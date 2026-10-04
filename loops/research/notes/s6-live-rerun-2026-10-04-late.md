# S6 live re-run + refusal probes — 2026-10-04 ~01:00 UTC

Scope: notes/mvp-scope-2026-10-03.md §§4–4b. Freeze: Sun 11:00 code+evidence.
Active goal: S6 (first `pending` in GOALS.md). Lineage:
- /home/aleksic/spacestation/mvp/loops/research/notes/s06-gate-2026-10-04.md (conditional gate, stranger #1 pending)
- /home/aleksic/spacestation/mvp/loops/research/notes/s6-fresh-verify-2026-10-04.md (~03:00? actually 03:00 slot, re-verify)
- /home/aleksic/spacestation/mvp/loops/research/notes/s6-evidence-2026-10-04.md (P0.6 rows rc=0)
- /home/aleksic/spacestation/mvp/loops/research/notes/s6-stranger-test-2026-10-04.md (protocol, test pending)

## P0.6 rows (exact commands + outputs, this turn, cwd /home/aleksic/spacestation/mvp)
| time (UTC) | command | output verbatim | rc |
|---|---|---|---|
| 2026-10-04T00:59Z | `timeout 60 node verifier-ts/solve-l1.mjs` | `SOLVE PASS: vault 100000000 -> 60000000 (attacker gained 40000000)` | 0 |
| 2026-10-04T00:59Z | `timeout 60 node verifier-ts/solve-l1-negative.mjs` | `NEG-CONTROL PASS: fixed refused unsigned withdraw (TransactionErrorInstructionError { index: 0, error: InstructionErrorCustom { code: 3010 } })` | 0 |
| 2026-10-04T00:59Z | `timeout 60 node verifier-ts/solve-l2.mjs` | `SOLVE: insecure trusted fake balance 1000000 from System-owned account` + `NEG-CONTROL PASS: secure-manual refused (... 6000 ...)` + `NEG-CONTROL PASS: secure-anchor refused (... 3007 ...)` + `SOLVE PASS: fake 1000000 trusted by insecure, refused by both secure` | 0 |
| 2026-10-04T00:59:49Z | `curl -s -m 10 http://127.0.0.1:17864/api/health` | `{"ok":true,"version":"0.1.0","verifier_pin":"litesvm-npm-1.5.0","db":"ok"}` | 0 |
| 2026-10-04T00:59:49Z | `sha256sum content/programs/l1-signer/l1_signer.so content/programs/l2-owner/l2_owner.so` | `aad7d056...497` + `3d08d88e...b6dbd0` (match gate pins exactly) | 0 |
| 2026-10-04T01:00Z | `POST /api/run -d '{}'` | `{"verdict":"error","reason":"BadInput","action":"retry with session, room and exploit code"}` HTTP:422 | 0 (probe) |
| 2026-10-04T01:00Z | `GET /api/board` | `{"entries":[],"first_solvers":[]}` HTTP:200 | 0 |
| 2026-10-04T01:00Z | `GET /proof/bogus-hash-xyz` | 200 page, `Solver details appear with the proof record.` (no leak, no crash) | 0 |

## Failures / gaps verbatim (no reconstruction)
- `which jscpd` → `no jscpd in (...)` — jscpd baseline item stays OPEN, owner next turn.
- Rust `verifier-rs` crate NOT re-run this turn (prior evidence: rustc mismatch, needs 1.97.1) — TS bridge stays verdict path.
- Stranger test #1 still `_pending_` (protocol in s6-stranger-test file) — owner HUMAN.

## Verdict
- L1/L2 exploit + negative controls all rc=0 on TS litesvm@1.5.0; P0.1 digests match gate pins; :17864 health green.
- Refusal probes: empty-run 422 BadInput with retry action; bogus proof renders safe placeholder; board 200 empty. No solver/flag leak observed on these three probes (full TTL/reaper/per-IP-caps matrix still open, owner S8-technical).
- S6 flip still blocked on HUMAN stranger row #1 only.

INFERENCE (labeled): technical side fresh-as-of 2026-10-04T01:00Z; no code changed this turn (evidence-only).
