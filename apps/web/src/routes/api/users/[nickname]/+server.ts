import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { openDb } from "$lib/server/db/client.js";

// Public profile data (no login to view): rooms solved + lessons done +
// proofs minted. Reads only. Unknown nickname → 404, never an empty shell.
export const GET: RequestHandler = async ({ params }) => {
	const db = openDb(process.env.ARENA_DB ?? ":memory:");
	const nickname = params.nickname ?? "";
	const user = db.prepare("SELECT nickname, created FROM users WHERE nickname = ?").get(nickname) as
		| { nickname: string; created: string }
		| undefined;
	if (!user) return json({ error: "UnknownUser", action: "check the board for solvers" }, { status: 404 });

	const rooms = db
		.prepare("SELECT room, points, first_at FROM solves WHERE user = ? ORDER BY first_at ASC")
		.all(nickname) as { room: string; points: number; first_at: string }[];
	const lessons = db
		.prepare("SELECT lesson, at FROM lesson_completions WHERE nickname = ? ORDER BY at ASC")
		.all(nickname) as { lesson: string; at: string }[];
	const proofs = db
		.prepare("SELECT solver_hash, room, severity, at FROM findings WHERE user = ? ORDER BY at ASC")
		.all(nickname) as { solver_hash: string; room: string; severity: string; at: string }[];
	const points = rooms.reduce((sum, r) => sum + r.points, 0);

	return json({
		nickname: user.nickname,
		since: user.created,
		points,
		rooms,
		lessons,
		proofs: proofs.map((p) => ({ ...p, url: `/proof/${p.solver_hash}` }))
	});
};
