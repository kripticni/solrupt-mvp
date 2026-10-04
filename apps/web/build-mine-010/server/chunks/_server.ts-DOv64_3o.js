import { j as json } from './index-C5EvGOh5.js';
import { o as openDb } from './client-CZrn9TuC.js';
import { l as loadRooms } from './loader-7j8kK69B.js';
import { b as buildTranscript, s as solverHash, V as VERIFIER_PIN } from './transcript-iXLWPndq.js';
import { o as objectType, s as stringType, e as enumType } from './types-YoPt2-1h.js';
import 'node:sqlite';
import 'node:fs';
import './paths-BVo4bQLA.js';
import 'node:path';
import 'node:url';
import 'js-yaml';
import 'node:crypto';

const FindingInput = objectType({
  session_uuid: stringType().uuid(),
  severity: enumType(["Critical", "High", "Medium", "Low"]),
  proof: stringType().min(40).max(2e3),
  fix: stringType().min(20).max(1e3)
});
function issueFinding(db, raw) {
  const parsed = FindingInput.safeParse(raw);
  if (!parsed.success) {
    return { error: "BadInput", action: "severity + 2-3 sentence proof + 1-2 sentence fix" };
  }
  const { session_uuid, severity, proof, fix } = parsed.data;
  const session = db.prepare("SELECT user, room, expires, reaped FROM sessions WHERE uuid = ?").get(session_uuid);
  if (!session || session.reaped === 1 || new Date(session.expires).getTime() <= Date.now()) {
    return { error: "SessionExpired", action: "claim a fresh name to start a new session" };
  }
  const { rooms } = loadRooms();
  const room = rooms.find((r) => r.id === session.room);
  if (!room) {
    return { error: "RoomMissing", action: "pick a live room from the picker" };
  }
  const pass = db.prepare("SELECT code_hash, at FROM attempts WHERE session = ? AND verdict = ? ORDER BY at LIMIT 1").get(session_uuid, "pass");
  if (!pass) {
    return { error: "NoPassInSession", action: "pass the room first. Run, then write the finding" };
  }
  const attempts = db.prepare("SELECT COUNT(*) AS n FROM attempts WHERE session = ?").get(session_uuid).n;
  const hints = db.prepare("SELECT COUNT(*) AS n FROM hints_used WHERE session = ?").get(session_uuid).n;
  const started = db.prepare("SELECT created FROM sessions WHERE uuid = ?").get(session_uuid).created;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const transcript = buildTranscript({
    solver: session.user,
    room: session.room,
    code_digest: pass.code_hash,
    verdict_pin: VERIFIER_PIN,
    attempts,
    hints_used: hints,
    started_at: started,
    solved_at: now
  });
  const hash = solverHash(transcript);
  db.prepare(
    "INSERT INTO findings(user, room, severity, proof, fix, solver_hash, at, attempts, hints_used) VALUES(?,?,?,?,?,?,?,?,?)"
  ).run(session.user, session.room, severity, proof, fix, hash, now, attempts, hints);
  db.prepare("INSERT OR IGNORE INTO solves(user, room, points, first_at) VALUES(?,?,?,?)").run(
    session.user,
    session.room,
    room.points,
    now
  );
  return { proof_url: `/proof/${hash}` };
}
const POST = async ({ request }) => {
  const db = openDb(process.env.ARENA_DB ?? ":memory:");
  const body = await request.json().catch(() => null);
  const out = issueFinding(db, body);
  if ("error" in out) {
    const status = out.error === "BadInput" ? 422 : 409;
    return json(out, { status });
  }
  return json(out, { status: 201 });
};

export { POST };
//# sourceMappingURL=_server.ts-DOv64_3o.js.map
