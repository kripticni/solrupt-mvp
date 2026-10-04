import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { openDb } from "$lib/server/db/client.js";

// Reads only, cacheable. Progress display only; never hiring language (P2).
export const GET: RequestHandler = async () => {
	const db = openDb(process.env.ARENA_DB ?? ":memory:");
	const entries = db
		.prepare(
			"SELECT user AS nickname, SUM(points) AS points, MIN(first_at) AS first_at, GROUP_CONCAT(room) AS rooms FROM solves GROUP BY user ORDER BY points DESC, first_at ASC"
		)
		.all() as { nickname: string; points: number; first_at: string; rooms: string }[];
	const shaped = entries.map((e) => ({ ...e, rooms: e.rooms ? e.rooms.split(",") : [] }));
	const first_solvers = db
		.prepare(
			"SELECT room, user AS nickname, first_at FROM solves s WHERE first_at = (SELECT MIN(first_at) FROM solves WHERE room = s.room)"
		)
		.all() as { room: string; nickname: string; first_at: string }[];
	return json({ entries: shaped, first_solvers });
};
