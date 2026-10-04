import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { z } from "zod";
import { openDb } from "$lib/server/db/client.js";

// F1.5 search: SQLite FTS over rooms + lessons, diacritic-insensitive.
// Reads only. Empty query → empty list (never the whole index).
const SearchInput = z.object({ q: z.string().min(1).max(100) });

export const GET: RequestHandler = async ({ url }) => {
	const parsed = SearchInput.safeParse({ q: url.searchParams.get("q") ?? "" });
	if (!parsed.success) return json({ results: [] });
	const db = openDb(process.env.ARENA_DB ?? ":memory:");
	const rows = db
		.prepare("SELECT title, kind, ref FROM search_fts WHERE search_fts MATCH ? LIMIT 20")
		.all(parsed.data.q) as { title: string; kind: string; ref: string }[];
	return json({ results: rows });
};
