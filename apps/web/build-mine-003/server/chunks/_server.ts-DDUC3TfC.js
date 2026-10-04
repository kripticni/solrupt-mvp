import { j as json } from './index-C5EvGOh5.js';
import { o as openDb } from './client-CZrn9TuC.js';
import 'node:sqlite';
import 'node:fs';
import './paths-BVo4bQLA.js';
import 'node:path';
import 'node:url';

const GET = async () => {
  const db = openDb(process.env.ARENA_DB ?? ":memory:");
  const entries = db.prepare(
    "SELECT user AS nickname, SUM(points) AS points, MIN(first_at) AS first_at, GROUP_CONCAT(room) AS rooms FROM solves GROUP BY user ORDER BY points DESC, first_at ASC"
  ).all();
  const shaped = entries.map((e) => ({ ...e, rooms: e.rooms ? e.rooms.split(",") : [] }));
  const first_solvers = db.prepare(
    "SELECT room, user AS nickname, first_at FROM solves s WHERE first_at = (SELECT MIN(first_at) FROM solves WHERE room = s.room)"
  ).all();
  return json({ entries: shaped, first_solvers });
};

export { GET };
//# sourceMappingURL=_server.ts-DDUC3TfC.js.map
