import { randomUUID } from 'node:crypto';

const SESSION_TTL_SECS = 900;
const MAX_LIVE_PER_IP = 1;
const uuidsByIp = /* @__PURE__ */ new Map();
function liveUuids(db) {
  const rows = db.prepare("SELECT uuid FROM sessions WHERE reaped = 0 AND expires > ?").all(new Date(Date.now()).toISOString());
  return new Set(rows.map((r) => r.uuid));
}
function createSession(db, user, room, ip) {
  reap(db);
  const live = liveUuids(db);
  const mine = [...uuidsByIp.get(ip) ?? /* @__PURE__ */ new Set()].filter((u) => live.has(u));
  if (mine.length === 0) {
    uuidsByIp.delete(ip);
  } else {
    uuidsByIp.set(ip, new Set(mine));
  }
  if (mine.length >= MAX_LIVE_PER_IP) {
    return { error: "RateLimited", retryAfterSecs: SESSION_TTL_SECS };
  }
  const uuid = randomUUID();
  const now = Date.now();
  const expires = new Date(now + SESSION_TTL_SECS * 1e3).toISOString();
  db.prepare(
    "INSERT INTO sessions(uuid, user, room, created, expires, reaped) VALUES(?,?,?,?,?,0)"
  ).run(uuid, user, room, new Date(now).toISOString(), expires);
  uuidsByIp.set(ip, /* @__PURE__ */ new Set([...mine, uuid]));
  return { uuid };
}
function getSession(db, uuid) {
  const row = db.prepare("SELECT user, room, expires, reaped FROM sessions WHERE uuid = ?").get(uuid);
  if (!row || row.reaped === 1 || new Date(row.expires).getTime() <= Date.now()) {
    return { error: "SessionExpired" };
  }
  return { user: row.user, room: row.room };
}
function reap(db) {
  const now = new Date(Date.now()).toISOString();
  const res = db.prepare("UPDATE sessions SET reaped = 1 WHERE reaped = 0 AND expires <= ?").run(now);
  return Number(res.changes ?? 0);
}

export { SESSION_TTL_SECS as S, createSession as c, getSession as g };
//# sourceMappingURL=manager-BBR1a2gj.js.map
