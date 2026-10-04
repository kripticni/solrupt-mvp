import { j as json } from './index-C5EvGOh5.js';
import { o as openDb } from './client-CZrn9TuC.js';
import { v as verifyTranscript } from './transcript-iXLWPndq.js';
import 'node:sqlite';
import 'node:fs';
import './paths-BVo4bQLA.js';
import 'node:path';
import 'node:url';
import 'node:crypto';

const GET = async ({ params }) => {
  const db = openDb(process.env.ARENA_DB ?? ":memory:");
  const hash = params.hash ?? "";
  const finding = db.prepare(
    "SELECT user, room, severity, proof, fix, solver_hash, at, attempts AS mint_attempts, hints_used AS mint_hints FROM findings WHERE solver_hash = ?"
  ).get(hash);
  if (!finding) return json({ error: "UnknownProof" }, { status: 404 });
  const session = db.prepare("SELECT created, code_hash FROM sessions LEFT JOIN attempts ON attempts.session = sessions.uuid WHERE user = ? AND room = ? AND verdict = ? ORDER BY attempts.at LIMIT 1").get(
    finding.user,
    finding.room,
    "pass"
  );
  const fields = {
    solver: finding.user,
    room: finding.room,
    code_digest: session?.code_hash ?? "",
    verdict_pin: "litesvm-npm-1.5.0",
    attempts: finding.mint_attempts,
    hints_used: finding.mint_hints,
    started_at: session?.created ?? "",
    solved_at: finding.at
  };
  if (!verifyTranscript(fields, hash)) {
    return json({ error: "ProofMismatch", action: "reseed. Stored proof does not recompute" }, { status: 410 });
  }
  return json({
    solver_hash: finding.solver_hash,
    solver: finding.user,
    room: finding.room,
    severity: finding.severity,
    proof: finding.proof,
    fix: finding.fix,
    attempts: finding.mint_attempts,
    hints_used: finding.mint_hints,
    solved_at: finding.at,
    code_digest: fields.code_digest,
    verifier_pin: fields.verdict_pin,
    grade: "ungraded"
  });
};

export { GET };
//# sourceMappingURL=_server.ts-xCJY-k7a.js.map
