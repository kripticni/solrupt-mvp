import { j as json } from './index-C5EvGOh5.js';
import { o as openDb } from './client-CZrn9TuC.js';
import { l as loadRooms, t as toMeta } from './loader-7j8kK69B.js';
import 'node:sqlite';
import 'node:fs';
import './paths-BVo4bQLA.js';
import 'node:path';
import 'node:url';
import 'js-yaml';
import './types-YoPt2-1h.js';

const GET = async ({ url }) => {
  const db = openDb(process.env.ARENA_DB ?? ":memory:");
  const session = url.searchParams.get("session") ?? "";
  const { rooms, greyed } = loadRooms();
  const entries = rooms.map((r) => {
    let solved = false;
    if (session) {
      const row = db.prepare(
        "SELECT 1 FROM solves JOIN sessions ON solves.user = sessions.user WHERE sessions.uuid = ? AND solves.room = ?"
      ).get(session, r.id);
      solved = row !== void 0;
    }
    return { ...toMeta(r), live: r.live, solved };
  });
  return json({ rooms: entries, greyed });
};

export { GET };
//# sourceMappingURL=_server.ts-CZ3qjYdL.js.map
