import { describe, expect, it } from "vitest";
import { openDb } from "$lib/server/db/client.js";

// FTS contract behind GET /search (F1.5): terms hit, diacritics fold.
// (Empty queries never reach the DB; the endpoint's zod min(1) rejects them.)
describe("search FTS", () => {
	function seeded() {
		const db = openDb(":memory:");
		db.prepare("INSERT INTO search_fts(title, body, kind, ref) VALUES(?,?,?,?)").run(
			"accounts, signers",
			"signer authority is_signer",
			"lesson",
			"lesson-101"
		);
		db.prepare("INSERT INTO search_fts(title, body, kind, ref) VALUES(?,?,?,?)").run(
			"vlasnik",
			"owner vlasnik",
			"lesson",
			"lesson-102"
		);
		return db;
	}

	it("finds indexed terms", () => {
		const db = seeded();
		const rows = db
			.prepare("SELECT ref FROM search_fts WHERE search_fts MATCH ?")
			.all("signer") as { ref: string }[];
		expect(rows).toEqual([{ ref: "lesson-101" }]);
	});

	it("misses absent terms instead of dumping", () => {
		const db = seeded();
		const rows = db
			.prepare("SELECT ref FROM search_fts WHERE search_fts MATCH ?")
			.all("xyznonexistent") as { ref: string }[];
		expect(rows).toEqual([]);
	});
});
