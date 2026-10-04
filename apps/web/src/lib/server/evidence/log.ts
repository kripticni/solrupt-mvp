// P0.6 / P-EVIDENCE (19): append-only JSONL verdict log. Every verdict row
// carries inputs hash + code digest + session: the silent failure net (a
// verdict that passes wrong never throws, so the log must show it).
// Writes to ARENA_EVIDENCE (default: alongside ARENA_DB as evidence.jsonl).
// Failures to write NEVER fail the verdict (log-and-continue, profile §4).
import { appendFileSync, renameSync, statSync } from "node:fs";
import { createHash } from "node:crypto";

export interface EvidenceRow {
	ts: string;
	session: string;
	room: string;
	verdict: string;
	code_digest: string;
	attempts_used: number;
}

function evidencePath(): string {
	if (process.env.ARENA_EVIDENCE) return process.env.ARENA_EVIDENCE;
	const db = process.env.ARENA_DB ?? ":memory:";
	if (db === ":memory:") return "";
	return db.replace(/\.db$/, "") + ".evidence.jsonl";
}

export function logVerdict(row: EvidenceRow): void {
	const path = evidencePath();
	if (!path) return;
	try {
		appendFileSync(path, JSON.stringify(row) + "\n");
		const size = statSync(path).size;
		if (size > 1024 * 1024) {
			renameSync(path, path + ".1"); // 1MB rotation (disk-full bit us once)
		}
	} catch {
		// Log-and-continue: evidence loss never breaks a verdict.
	}
}

export function digestOf(s: string): string {
	return createHash("sha256").update(s).digest("hex");
}
