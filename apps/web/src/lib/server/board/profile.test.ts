import { describe, expect, it } from "vitest";
import { openDb } from "$lib/server/db/client.js";

describe("lesson completions + public profile", () => {
	function userWith(db: ReturnType<typeof openDb>, nick = "jovan") {
		db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
			nick,
			null,
			"2026-10-03"
		);
		return nick;
	}

	it("records lesson completions idempotently", () => {
		const db = openDb(":memory:");
		const nick = userWith(db);
		const once = db
			.prepare("INSERT OR IGNORE INTO lesson_completions(nickname, lesson, at) VALUES(?,?,?)")
			.run(nick, "101-accounts-signer", "2026-10-04").changes;
		const twice = db
			.prepare("INSERT OR IGNORE INTO lesson_completions(nickname, lesson, at) VALUES(?,?,?)")
			.run(nick, "101-accounts-signer", "2026-10-04").changes;
		expect(Number(once)).toBe(1);
		expect(Number(twice)).toBe(0);
		const rows = db
			.prepare("SELECT lesson FROM lesson_completions WHERE nickname = ?")
			.all(nick) as { lesson: string }[];
		expect(rows).toEqual([{ lesson: "101-accounts-signer" }]);
	});

	it("profile aggregates rooms + lessons + proofs", () => {
		const db = openDb(":memory:");
		const nick = userWith(db);
		db.prepare("INSERT INTO solves(user, room, points, first_at) VALUES(?,?,?,?)").run(
			nick,
			"l1-signer",
			100,
			"2026-10-04"
		);
		db.prepare("INSERT INTO lesson_completions(nickname, lesson, at) VALUES(?,?,?)").run(
			nick,
			"101-accounts-signer",
			"2026-10-04"
		);
		const rooms = db.prepare("SELECT room, points FROM solves WHERE user = ?").all(nick);
		const lessons = db.prepare("SELECT lesson FROM lesson_completions WHERE nickname = ?").all(nick);
		expect(rooms).toEqual([{ room: "l1-signer", points: 100 }]);
		expect(lessons).toEqual([{ lesson: "101-accounts-signer" }]);
	});
});
