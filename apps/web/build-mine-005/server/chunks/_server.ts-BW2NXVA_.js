import { j as json } from './index-C5EvGOh5.js';
import { o as openDb } from './client-CZrn9TuC.js';
import { createHash } from 'node:crypto';
import { g as getSession } from './manager-paqdH-Lm.js';
import { l as loadRooms } from './loader-7j8kK69B.js';
import { verify, FixedPassed } from './harness-NwB6K6Mg.js';
import { appendFileSync } from 'node:fs';
import { o as objectType, s as stringType } from './types-YoPt2-1h.js';
import 'node:sqlite';
import './paths-BVo4bQLA.js';
import 'node:path';
import 'node:url';
import 'js-yaml';
import 'litesvm';
import '@solana/kit';
import '@solana-program/system';

function evidencePath() {
  if (process.env.ARENA_EVIDENCE) return process.env.ARENA_EVIDENCE;
  const db = process.env.ARENA_DB ?? ":memory:";
  if (db === ":memory:") return "";
  return db.replace(/\.db$/, "") + ".evidence.jsonl";
}
function logVerdict(row) {
  const path = evidencePath();
  if (!path) return;
  try {
    appendFileSync(path, JSON.stringify(row) + "\n");
  } catch {
  }
}
const RunInput = objectType({
  session_uuid: stringType().uuid(),
  room_id: stringType().min(1).max(64),
  exploit_code: stringType().min(1).max(32 * 1024)
});
async function handleRun(db, raw) {
  const parsed = RunInput.safeParse(raw);
  if (!parsed.success) {
    return { verdict: "error", reason: "BadInput", action: "retry with session, room and exploit code" };
  }
  const { session_uuid, room_id, exploit_code } = parsed.data;
  const session = getSession(db, session_uuid);
  if ("error" in session) {
    return { verdict: "error", reason: "SessionExpired", action: "claim a fresh name to start a new session" };
  }
  const { rooms } = loadRooms();
  const room = rooms.find((r) => r.id === room_id && r.live);
  if (!room) {
    return { verdict: "error", reason: "RoomMissing", action: "pick a live room from the picker" };
  }
  const code_hash = createHash("sha256").update(exploit_code).digest("hex");
  db.prepare("INSERT INTO attempts(session, code_hash, verdict, at) VALUES(?,?,?,?)").run(
    session_uuid,
    code_hash,
    "pending",
    (/* @__PURE__ */ new Date()).toISOString()
  );
  let verdict;
  try {
    verdict = await verify(session_uuid, room_id, exploit_code);
  } catch (e) {
    if (e instanceof FixedPassed) {
      return { verdict: "error", reason: "LabBroken", action: "the lab is broken, not you — tell the team" };
    }
    return { verdict: "error", reason: "VerifierUnavailable", action: "retry, or open the lesson and try a hint" };
  }
  db.prepare("UPDATE attempts SET verdict = ? WHERE session = ? AND code_hash = ?").run(
    verdict.pass ? "pass" : "fail",
    session_uuid,
    code_hash
  );
  const attempts_used = db.prepare("SELECT COUNT(*) AS n FROM attempts WHERE session = ?").get(session_uuid).n;
  logVerdict({
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    session: session_uuid,
    room: room_id,
    verdict: verdict.pass ? "pass" : "fail",
    code_digest: code_hash,
    attempts_used
  });
  return {
    verdict: verdict.pass ? "pass" : "fail",
    state_diff: verdict.state_diff,
    logs: verdict.logs,
    attempts_used,
    hints_available: 3,
    action: verdict.pass ? "write your finding to mint the proof" : "retry, or open hint 1"
  };
}
const POST = async ({ request }) => {
  const db = openDb(process.env.ARENA_DB ?? ":memory:");
  const body = await request.json().catch(() => null);
  const out = await handleRun(db, body);
  const status = out.verdict === "error" ? 422 : 200;
  return json(out, { status });
};

export { POST };
//# sourceMappingURL=_server.ts-BW2NXVA_.js.map
