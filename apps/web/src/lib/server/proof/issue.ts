// P-FINDING (19 §2): verdict → proof. Pure and testable; the endpoint is thin.
// Proposed floors for S5 lock (19 §4.1 leaves N/M open): proof ≥ 40 chars
// (two or three sentences), fix ≥ 20 (one or two sentences). Gated on ≥1 pass attempt in-session;
// awards the solve; returns the public proof URL. This page IS the certificate.
import { z } from "zod";
import type { DatabaseSync } from "node:sqlite";
import { loadRooms } from "$lib/server/rooms/loader.js";
import { VERIFIER_PIN, buildTranscript, solverHash } from "$lib/server/proof/transcript.js";

export const FindingInput = z.object({
	session_uuid: z.string().uuid(),
	severity: z.enum(["Critical", "High", "Medium", "Low"]),
	proof: z.string().min(40).max(2000),
	fix: z.string().min(20).max(1000)
});

export interface FindingOk {
	proof_url: string;
}

export interface FindingErr {
	error: "BadInput" | "SessionExpired" | "NoPassInSession" | "RoomMissing";
	action: string;
}

export function issueFinding(db: DatabaseSync, raw: unknown): FindingOk | FindingErr {
	const parsed = FindingInput.safeParse(raw);
	if (!parsed.success) {
		return { error: "BadInput", action: "severity plus a two or three sentence proof plus a one or two sentence fix" };
	}
	const { session_uuid, severity, proof, fix } = parsed.data;

	const session = db
		.prepare("SELECT user, room, expires, reaped FROM sessions WHERE uuid = ?")
		.get(session_uuid) as
		| { user: string; room: string; expires: string; reaped: number }
		| undefined;
	if (!session || session.reaped === 1 || new Date(session.expires).getTime() <= Date.now()) {
		return { error: "SessionExpired", action: "claim a fresh name to start a new session" };
	}

	const { rooms } = loadRooms();
	const room = rooms.find((r) => r.id === session.room);
	if (!room) {
		return { error: "RoomMissing", action: "pick a live room from the picker" };
	}

	const pass = db
		.prepare("SELECT code_hash, at FROM attempts WHERE session = ? AND verdict = ? ORDER BY at LIMIT 1")
		.get(session_uuid, "pass") as { code_hash: string; at: string } | undefined;
	if (!pass) {
		return { error: "NoPassInSession", action: "pass the room first. Run, then write the finding" };
	}

	const attempts = (db.prepare("SELECT COUNT(*) AS n FROM attempts WHERE session = ?").get(session_uuid) as { n: number }).n;
	const hints = (db.prepare("SELECT COUNT(*) AS n FROM hints_used WHERE session = ?").get(session_uuid) as { n: number }).n;
	const started = (
		db.prepare("SELECT created FROM sessions WHERE uuid = ?").get(session_uuid) as { created: string }
	).created;
	const now = new Date().toISOString(); // single stamp: transcript + row must match exactly

	const transcript = buildTranscript({
		solver: session.user,
		room: session.room,
		code_digest: pass.code_hash,
		verdict_pin: VERIFIER_PIN,
		attempts,
		hints_used: hints,
		started_at: started,
		solved_at: now
	});
	const hash = solverHash(transcript);

	db.prepare(
		"INSERT INTO findings(user, room, severity, proof, fix, solver_hash, at, attempts, hints_used) VALUES(?,?,?,?,?,?,?,?,?)"
	).run(session.user, session.room, severity, proof, fix, hash, now, attempts, hints);
	db.prepare("INSERT OR IGNORE INTO solves(user, room, points, first_at) VALUES(?,?,?,?)").run(
		session.user,
		session.room,
		room.points,
		now
	);
	return { proof_url: `/proof/${hash}` };
}
