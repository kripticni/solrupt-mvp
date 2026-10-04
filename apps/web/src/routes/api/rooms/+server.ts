import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { openDb } from "$lib/server/db/client.js";
import { loadRooms, toMeta } from "$lib/server/rooms/loader.js";

export const GET: RequestHandler = async ({ url }) => {
	const db = openDb(process.env.ARENA_DB ?? ":memory:");
	const session = url.searchParams.get("session") ?? "";
	const { rooms, greyed } = loadRooms();
	const entries = rooms.map((r) => {
		let solved = false;
		if (session) {
			const row = db
				.prepare(
					"SELECT 1 FROM solves JOIN sessions ON solves.user = sessions.user WHERE sessions.uuid = ? AND solves.room = ?"
				)
				.get(session, r.id);
			solved = row !== undefined;
		}
		return { ...toMeta(r), live: r.live, solved };
	});
	return json({ rooms: entries, greyed });
};
