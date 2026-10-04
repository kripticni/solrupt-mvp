import { createHash } from 'node:crypto';

const PROOF_DOMAIN = "arena/proof/v1";
const VERIFIER_PIN = "litesvm-npm-1.5.0";
function field(s) {
  return `${s.length}:${s}`;
}
function buildTranscript(f) {
  return [
    PROOF_DOMAIN,
    field(f.solver),
    field(f.room),
    field(f.code_digest),
    field(f.verdict_pin),
    field(String(f.attempts)),
    field(String(f.hints_used)),
    field(f.started_at),
    field(f.solved_at)
  ].join("|");
}
function solverHash(transcript) {
  return createHash("sha256").update(transcript).digest("hex");
}
function verifyTranscript(f, hash) {
  return solverHash(buildTranscript(f)) === hash;
}

export { VERIFIER_PIN as V, buildTranscript as b, solverHash as s, verifyTranscript as v };
//# sourceMappingURL=transcript-iXLWPndq.js.map
