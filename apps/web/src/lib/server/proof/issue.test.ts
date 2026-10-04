import { describe, expect, it } from "vitest";
import { openDb } from "$lib/server/db/client.js";
import { createSession } from "$lib/server/sessions/manager.js";
import { issueFinding } from "$lib/server/proof/issue.js";
import { verifyTranscript } from "$lib/server/proof/transcript.js";

const PROOF = "attacker called withdraw_insecure with the victim vault and took funds";
const FIX = "type authority as Signer so missing signatures fail";

// NOTE: the verifier harness is unwired until Diff 3, so tests plant a pass
// attempt row directly to exercise the finding logic (same shape P-RUN writes).
function sessionWithPass(db: ReturnType<typeof openDb>, nick = "jovan") {
	db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
		nick,
		null,
		"2026-10-03T10:00:00.000Z"
	);
	const s = createSession(db, nick, "l1-signer", "127.0.0.1");
	if (!("uuid" in s)) throw new Error("setup failed");
	db.prepare("INSERT INTO attempts(session, code_hash, verdict, at) VALUES(?,?,?,?)").run(
		s.uuid,
		"abc123",
		"pass",
		"2026-10-03T10:05:00.000Z"
	);
	return s.uuid;
}

describe("POST /finding", () => {
	it("mints a proof URL and awards the solve", () => {
		const db = openDb(":memory:");
		const uuid = sessionWithPass(db);
		const out = issueFinding(db, {
			session_uuid: uuid,
			severity: "Critical",
			proof: PROOF,
			fix: FIX
		});
		expect("proof_url" in out).toBe(true);
		const url = (out as { proof_url: string }).proof_url;
		expect(url.startsWith("/proof/")).toBe(true);
		const solves = db.prepare("SELECT points FROM solves").all() as { points: number }[];
		expect(solves).toEqual([{ points: 100 }]);
	});

	it("recomputes: stored fields verify against the minted hash", () => {
		const db = openDb(":memory:");
		const uuid = sessionWithPass(db);
		const out = issueFinding(db, {
			session_uuid: uuid,
			severity: "High",
			proof: PROOF,
			fix: FIX
		}) as { proof_url: string };
		const hash = out.proof_url.split("/proof/")[1];
		const row = db.prepare("SELECT at FROM findings WHERE solver_hash = ?").get(hash) as { at: string };
		const sess = db.prepare("SELECT created FROM sessions WHERE uuid = ?").get(uuid) as { created: string };
		expect(
			verifyTranscript(
				{
					solver: "jovan",
					room: "l1-signer",
					code_digest: "abc123",
					verdict_pin: "litesvm-npm-1.5.0",
					attempts: 1,
					hints_used: 0,
					started_at: sess.created,
					solved_at: row.at
				},
				hash
			)
		).toBe(true);
	});

	it("refuses without a pass in session, and rejects short prose", () => {
		const db = openDb(":memory:");
		db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
			"jovan",
			null,
			"2026-10-03"
		);
		const s = createSession(db, "jovan", "l1-signer", "127.0.0.1");
		const uuid = (s as { uuid: string }).uuid;
		expect(issueFinding(db, { session_uuid: uuid, severity: "Low", proof: PROOF, fix: FIX })).toEqual({
			error: "NoPassInSession",
			action: "pass the room first. Run, then write the finding"
		});
		db.prepare("INSERT INTO attempts(session, code_hash, verdict, at) VALUES(?,?,?,?)").run(uuid, "x", "pass", "2026-10-03");
		expect(issueFinding(db, { session_uuid: uuid, severity: "Low", proof: "short", fix: FIX })).toEqual({
			error: "BadInput",
			action: "severity plus a two or three sentence proof plus a one or two sentence fix"
		});
	});
});
