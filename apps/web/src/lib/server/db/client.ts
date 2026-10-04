// Single SQLite client factory (19 §3): WAL, once, server-only.
// Never imported into client components (import-lint gate enforces).
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { schemaFile } from "$lib/server/paths.js";

let db: DatabaseSync | null = null;

export function schemaPath(): string {
	return schemaFile();
}

export function openDb(path: string = ":memory:"): DatabaseSync {
	if (path === ":memory:" || db === null) {
		const fresh = new DatabaseSync(path);
		fresh.exec("PRAGMA journal_mode=WAL;");
		const schema = readFileSync(schemaPath(), "utf8");
		fresh.exec(schema);
		if (path !== ":memory:") db = fresh;
		return fresh;
	}
	return db;
}
