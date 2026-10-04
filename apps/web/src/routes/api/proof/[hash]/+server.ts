import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { openDb } from "$lib/server/db/client.js";
import { verifyTranscript } from "$lib/server/proof/transcript.js";

// Public proof page data (no login to view). This record IS the certificate.
// Corruption path: stored fields that do not recompute to the URL hash → 410.
export const GET: RequestHandler = async ({ params }) => {
	const db = openDb(process.env.ARENA_DB ?? ":memory:");
	const hash = params.hash ?? "";
	const finding = db
		.prepare(
			"SELECT user, room, severity, proof, fix, solver_hash, at, attempts AS mint_attempts, hints_used AS mint_hints FROM findings WHERE solver_hash = ?"
		)
		.get(hash) as
		| {
				user: string;
				room: string;
				severity: string;
				proof: string;
				fix: string;
				solver_hash: string;
				at: string;
				mint_attempts: number;
				mint_hints: number;
		  }
		| undefined;
	if (!finding) return json({ error: "UnknownProof" }, { status: 404 });

	const session = db.prepare("SELECT created, code_hash FROM sessions LEFT JOIN attempts ON attempts.session = sessions.uuid WHERE user = ? AND room = ? AND verdict = ? ORDER BY attempts.at LIMIT 1").get(
		finding.user,
		finding.room,
		"pass"
	) as { created: string; code_hash: string } | undefined;

	const fields = {
		solver: finding.user,
		room: finding.room,
		code_digest: session?.code_hash ?? "",
		verdict_pin: "litesvm-npm-1.5.0",
		attempts: finding.mint_attempts,
		hints_used: finding.mint_hints,
		started_at: session?.created ?? "",
		solved_at: finding.at
	};
	if (!verifyTranscript(fields, hash)) {
		return json({ error: "ProofMismatch", action: "reseed. Stored proof does not recompute" }, { status: 410 });
	}

	return json({
		solver_hash: finding.solver_hash,
		solver: finding.user,
		room: finding.room,
		severity: finding.severity,
		proof: finding.proof,
		fix: finding.fix,
		attempts: finding.mint_attempts,
		hints_used: finding.mint_hints,
		solved_at: finding.at,
		code_digest: fields.code_digest,
		verifier_pin: fields.verdict_pin,
		grade: "ungraded"
	});
};
