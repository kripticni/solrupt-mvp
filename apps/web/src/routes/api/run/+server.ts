import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { openDb } from "$lib/server/db/client.js";
import { handleRun } from "$lib/server/verifier/run.js";

export const POST: RequestHandler = async ({ request }) => {
	const db = openDb(process.env.ARENA_DB ?? ":memory:");
	const body = await request.json().catch(() => null);
	const out = await handleRun(db, body);
	const status = out.verdict === "error" ? 422 : 200;
	return json(out, { status });
};
