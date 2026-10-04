// Session handling (P0.3): UUID per Run, 900s TTL + reaper, per-IP caps.
// Server-only. Per-IP caps are single-process in-memory (post-H02: shared store).
import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

export const SESSION_TTL_SECS = 900;
const MAX_LIVE_PER_IP = 1;

const uuidsByIp = new Map<string, Set<string>>();

function liveUuids(db: DatabaseSync): Set<string> {
	const rows = db
		.prepare("SELECT uuid FROM sessions WHERE reaped = 0 AND expires > ?")
		.all(new Date(Date.now()).toISOString()) as { uuid: string }[];
	return new Set(rows.map((r) => r.uuid));
}

export function createSession(
	db: DatabaseSync,
	user: string,
	room: string,
	ip: string
): { uuid: string } | { error: "RateLimited"; retryAfterSecs: number } {
	reap(db); // opportunistic sweep: expired rows marked before counting
	const live = liveUuids(db);
	const mine = [...(uuidsByIp.get(ip) ?? new Set())].filter((u) => live.has(u));
	if (mine.length === 0) {
		uuidsByIp.delete(ip); // prune dead IP entries (unbounded-map fix)
	} else {
		uuidsByIp.set(ip, new Set(mine));
	}
	if (mine.length >= MAX_LIVE_PER_IP) {
		return { error: "RateLimited", retryAfterSecs: SESSION_TTL_SECS };
	}
	const uuid = randomUUID();
	const now = Date.now();
	const expires = new Date(now + SESSION_TTL_SECS * 1000).toISOString();
	db.prepare(
		"INSERT INTO sessions(uuid, user, room, created, expires, reaped) VALUES(?,?,?,?,?,0)"
	).run(uuid, user, room, new Date(now).toISOString(), expires);
	uuidsByIp.set(ip, new Set([...mine, uuid]));
	return { uuid };
}

export function getSession(
	db: DatabaseSync,
	uuid: string
): { user: string; room: string } | { error: "SessionExpired" } {
	const row = db
		.prepare("SELECT user, room, expires, reaped FROM sessions WHERE uuid = ?")
		.get(uuid) as
		| { user: string; room: string; expires: string; reaped: number }
		| undefined;
	if (!row || row.reaped === 1 || new Date(row.expires).getTime() <= Date.now()) {
		return { error: "SessionExpired" };
	}
	return { user: row.user, room: row.room };
}

/** Sweeper: mark expired reaped. Returns count reaped. Runs opportunistically
 * at session creation (no timer; single process demo, zero ceremony). */
export function reap(db: DatabaseSync): number {
	const now = new Date(Date.now()).toISOString();
	const res = db
		.prepare("UPDATE sessions SET reaped = 1 WHERE reaped = 0 AND expires <= ?")
		.run(now);
	return Number(res.changes ?? 0);
}
