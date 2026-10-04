import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { z } from "zod";
import { openDb } from "$lib/server/db/client.js";
import { SESSION_TTL_SECS, createSession } from "$lib/server/sessions/manager.js";
import { loadRooms } from "$lib/server/rooms/loader.js";

// Claim-a-name (F3.1): nickname + room → session UUID. Guest mode = any name.
// 6th endpoint (proposed S5-lock amendment to D18/P0.4): P0.3 sessions must be
// creatable; none of the five listed endpoints can mint them.
const SessionInput = z.object({
	nickname: z.string().min(1).max(32),
	room: z.string().min(1).max(64)
});

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const db = openDb(process.env.ARENA_DB ?? ":memory:");
	const parsed = SessionInput.safeParse(await request.json().catch(() => null));
	if (!parsed.success) {
		return json({ error: "BadInput", action: "pick a nickname and a room" }, { status: 422 });
	}
	const { rooms } = loadRooms();
	if (!rooms.some((r) => r.id === parsed.data.room)) {
		return json({ error: "RoomMissing", action: "pick a room from the picker" }, { status: 404 });
	}
	db.prepare("INSERT OR IGNORE INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
		parsed.data.nickname,
		null,
		new Date().toISOString()
	);
	const out = createSession(db, parsed.data.nickname, parsed.data.room, getClientAddress());
	if ("error" in out) {
		return json({ error: out.error, action: "wait for your live session to expire, then retry" }, { status: 429 });
	}
	return json({ session_uuid: out.uuid, expires_in: SESSION_TTL_SECS }, { status: 201 });
};
