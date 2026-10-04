// P-RUN core (19 §2): exploit → verdict. Pure and testable; the endpoint is a
// thin wrapper. Fail-closed everywhere: no session, no room, no harness, no
// timeout may ever produce a pass. Every failure names an action.
import { createHash } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { z } from "zod";
import { getSession } from "$lib/server/sessions/manager.js";
import { loadRooms } from "$lib/server/rooms/loader.js";
import { FixedPassed, verify } from "$lib/server/verifier/harness.js";
import { logVerdict } from "$lib/server/evidence/log.js";
import type { Verdict } from "$lib/shared/types.js";

export const RunInput = z.object({
	session_uuid: z.string().uuid(),
	room_id: z.string().min(1).max(64),
	exploit_code: z.string().min(1).max(32 * 1024)
});

export interface RunOk {
	verdict: "pass" | "fail";
	state_diff: string;
	logs: string;
	attempts_used: number;
	hints_available: number;
	action: string;
}

export interface RunErr {
	verdict: "error";
	reason: "SessionExpired" | "RoomMissing" | "VerifierUnavailable" | "BadInput" | "LabBroken";
	action: string;
}

export async function handleRun(db: DatabaseSync, raw: unknown): Promise<RunOk | RunErr> {
	const parsed = RunInput.safeParse(raw);
	if (!parsed.success) {
		return { verdict: "error", reason: "BadInput", action: "retry with session, room and exploit code" };
	}
	const { session_uuid, room_id, exploit_code } = parsed.data;

	const session = getSession(db, session_uuid);
	if ("error" in session) {
		return { verdict: "error", reason: "SessionExpired", action: "claim a fresh name to start a new session" };
	}

	const { rooms } = loadRooms();
	const room = rooms.find((r) => r.id === room_id && r.live);
	if (!room) {
		return { verdict: "error", reason: "RoomMissing", action: "pick a live room from the picker" };
	}

	const code_hash = createHash("sha256").update(exploit_code).digest("hex");
	db.prepare("INSERT INTO attempts(session, code_hash, verdict, at) VALUES(?,?,?,?)").run(
		session_uuid,
		code_hash,
		"pending",
		new Date().toISOString()
	);

	let verdict: Verdict;
	try {
		verdict = await verify(session_uuid, room_id, exploit_code);
	} catch (e) {
		if (e instanceof FixedPassed) {
			return { verdict: "error", reason: "LabBroken", action: "the lab is broken, not you. Tell the team" };
		}
		return { verdict: "error", reason: "VerifierUnavailable", action: "retry, or open the lesson and try a hint" };
	}

	db.prepare("UPDATE attempts SET verdict = ? WHERE session = ? AND code_hash = ?").run(
		verdict.pass ? "pass" : "fail",
		session_uuid,
		code_hash
	);
	const attempts_used = (
		db.prepare("SELECT COUNT(*) AS n FROM attempts WHERE session = ?").get(session_uuid) as {
			n: number;
		}
	).n;
	logVerdict({
		ts: new Date().toISOString(),
		session: session_uuid,
		room: room_id,
		verdict: verdict.pass ? "pass" : "fail",
		code_digest: code_hash,
		attempts_used
	});

	return {
		verdict: verdict.pass ? "pass" : "fail",
		state_diff: verdict.state_diff,
		logs: verdict.logs,
		attempts_used,
		hints_available: 3,
		action: verdict.pass ? "write your finding to mint the proof" : "retry, or open hint 1"
	};
}
