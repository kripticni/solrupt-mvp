import { j as json } from './index-C5EvGOh5.js';
import { o as openDb } from './client-CZrn9TuC.js';
import 'node:sqlite';
import 'node:fs';
import './paths-BVo4bQLA.js';
import 'node:path';
import 'node:url';

const GET = async ({ params }) => {
  const db = openDb(process.env.ARENA_DB ?? ":memory:");
  const nickname = params.nickname ?? "";
  const user = db.prepare("SELECT nickname, created FROM users WHERE nickname = ?").get(nickname);
  if (!user) return json({ error: "UnknownUser", action: "check the board for solvers" }, { status: 404 });
  const rooms = db.prepare("SELECT room, points, first_at FROM solves WHERE user = ? ORDER BY first_at ASC").all(nickname);
  const lessons = db.prepare("SELECT lesson, at FROM lesson_completions WHERE nickname = ? ORDER BY at ASC").all(nickname);
  const proofs = db.prepare("SELECT solver_hash, room, severity, at FROM findings WHERE user = ? ORDER BY at ASC").all(nickname);
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

export { GET };
//# sourceMappingURL=_server.ts-BPl6uHqq.js.map
