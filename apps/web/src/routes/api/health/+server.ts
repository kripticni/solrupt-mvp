import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";

export const GET: RequestHandler = async () => {
	return json({ ok: true, version: "0.1.0", verifier_pin: "litesvm-npm-1.5.0", db: "ok" });
};
