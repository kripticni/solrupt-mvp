// Proof transcript (19 §4.4, canonical): domain label + length-delimited fields
// → SHA256 = solver_hash. Verification = recompute from stored fields; mismatch
// → explicit corruption path (fail fast, loudly). Pure, offline-testable.
import { createHash } from "node:crypto";

export const PROOF_DOMAIN = "arena/proof/v1";
// Single line to bump when the verifier changes (health endpoint reports it too).
export const VERIFIER_PIN = "litesvm-npm-1.5.0";

export interface TranscriptFields {
	solver: string;
	room: string;
	code_digest: string;
	verdict_pin: string;
	attempts: number;
	hints_used: number;
	started_at: string;
	solved_at: string;
}

function field(s: string): string {
	return `${s.length}:${s}`;
}

export function buildTranscript(f: TranscriptFields): string {
	return [
		PROOF_DOMAIN,
		field(f.solver),
		field(f.room),
		field(f.code_digest),
		field(f.verdict_pin),
		field(String(f.attempts)),
		field(String(f.hints_used)),
		field(f.started_at),
		field(f.solved_at)
	].join("|");
}

export function solverHash(transcript: string): string {
	return createHash("sha256").update(transcript).digest("hex");
}

export function verifyTranscript(f: TranscriptFields, hash: string): boolean {
	return solverHash(buildTranscript(f)) === hash;
}
