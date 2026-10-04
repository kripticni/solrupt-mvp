import { describe, expect, it } from "vitest";
import { openDb } from "$lib/server/db/client.js";
import { createSession, getSession, reap } from "$lib/server/sessions/manager.js";

function memdb() {
	return openDb(":memory:");
}

describe("sessions", () => {
	it("creates and reads back a live session", () => {
		const db = memdb();
		db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
			"jovan",
			null,
			"2026-10-03"
		);
		const created = createSession(db, "jovan", "l1-signer", "127.0.0.1");
		expect("uuid" in created).toBe(true);
		const back = getSession(db, (created as { uuid: string }).uuid);
		expect(back).toEqual({ user: "jovan", room: "l1-signer" });
	});

	it("caps one live session per IP", () => {
		const db = memdb();
		db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
			"jovan",
			null,
			"2026-10-03"
		);
		expect("uuid" in createSession(db, "jovan", "l1-signer", "10.0.0.9")).toBe(true);
		const second = createSession(db, "jovan", "l1-signer", "10.0.0.9");
		expect(second).toEqual({ error: "RateLimited", retryAfterSecs: 900 });
	});

	it("expired sessions read as expired and reap marks them", () => {
		const db = memdb();
		db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
			"jovan",
			null,
			"2026-10-03"
		);
		db.prepare(
			"INSERT INTO sessions(uuid, user, room, created, expires, reaped) VALUES(?,?,?,?,?,0)"
		).run("old", "jovan", "l1-signer", "2026-10-03", "2020-01-01T00:00:00.000Z");
		expect(getSession(db, "old")).toEqual({ error: "SessionExpired" });
		expect(reap(db)).toBe(1);
		expect(getSession(db, "old")).toEqual({ error: "SessionExpired" });
	});
});
