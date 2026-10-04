import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { openDb } from "$lib/server/db/client.js";
import { issueFinding } from "$lib/server/proof/issue.js";

export const POST: RequestHandler = async ({ request }) => {
	const db = openDb(process.env.ARENA_DB ?? ":memory:");
	const body = await request.json().catch(() => null);
	const out = issueFinding(db, body);
	if ("error" in out) {
		const status = out.error === "BadInput" ? 422 : 409;
		return json(out, { status });
	}
	return json(out, { status: 201 });
};
