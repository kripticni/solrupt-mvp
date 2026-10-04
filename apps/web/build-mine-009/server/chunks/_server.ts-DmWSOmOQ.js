import { j as json } from './index-C5EvGOh5.js';
import { o as openDb } from './client-CZrn9TuC.js';
import { c as createSession, S as SESSION_TTL_SECS } from './manager-BBR1a2gj.js';
import { l as loadRooms } from './loader-7j8kK69B.js';
import { o as objectType, s as stringType } from './types-YoPt2-1h.js';
import 'node:sqlite';
import 'node:fs';
import './paths-BVo4bQLA.js';
import 'node:path';
import 'node:url';
import 'node:crypto';
import 'js-yaml';

const SessionInput = objectType({
  nickname: stringType().min(1).max(32),
  room: stringType().min(1).max(64)
});
const POST = async ({ request, getClientAddress }) => {
  const db = openDb(process.env.ARENA_DB ?? ":memory:");
  const parsed = SessionInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return json({ error: "BadInput", action: "pick a nickname and a room" }, { status: 422 });
  }
  const { rooms } = loadRooms();
  if (!rooms.some((r) => r.id === parsed.data.room)) {
    return json({ error: "RoomMissing", action: "pick a room from the picker" }, { status: 404 });
  }
  db.prepare("INSERT OR IGNORE INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
    parsed.data.nickname,
    null,
    (/* @__PURE__ */ new Date()).toISOString()
  );
  const out = createSession(db, parsed.data.nickname, parsed.data.room, getClientAddress());
  if ("error" in out) {
    return json({ error: out.error, action: "wait for your live session to expire, then retry" }, { status: 429 });
  }
  return json({ session_uuid: out.uuid, expires_in: SESSION_TTL_SECS }, { status: 201 });
};

export { POST };
//# sourceMappingURL=_server.ts-DmWSOmOQ.js.map
