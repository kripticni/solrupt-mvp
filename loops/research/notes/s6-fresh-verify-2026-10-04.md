# S6 fresh re-verify — 2026-10-04 ~03:00 UTC (agent turn, live runs)

Scope: notes/mvp-scope-2026-10-03.md §§4–4b. Freeze: Sun 11:00 code+evidence.
Rows from Sat 11:00; failures verbatim. Closes the s06-gate open item
"harnesses re-proven live" (gate note of 2026-10-04 admits prior-turn runs only).

## P0.6 rows (exact commands + outputs, run this turn)
| time (UTC) | command | output verbatim | rc |
|---|---|---|---|
| 2026-10-04 ~03:00 | `timeout 60 node verifier-ts/solve-l1.mjs` (cwd /home/aleksic/spacestation/mvp) | `SOLVE PASS: vault 100000000 -> 60000000 (attacker gained 40000000)` | 0 |
| 2026-10-04 ~03:00 | `timeout 60 node verifier-ts/solve-l1-negative.mjs` | `NEG-CONTROL PASS: fixed refused unsigned withdraw (TransactionErrorInstructionError { index: 0, error: InstructionErrorCustom { code: 3010 } })` | 0 |
| 2026-10-04 ~03:00 | `timeout 60 node verifier-ts/solve-l2.mjs` | `SOLVE: insecure trusted fake balance 1000000 from System-owned account` + `NEG-CONTROL PASS: secure-manual refused (TransactionErrorInstructionError { index: 0, error: InstructionErrorCustom { code: 6000 } })` + `NEG-CONTROL PASS: secure-anchor refused (TransactionErrorInstructionError { index: 0, error: InstructionErrorCustom { code: 3007 } })` + `SOLVE PASS: fake 1000000 trusted by insecure, refused by both secure` | 0 |
| 2026-10-04 ~03:00 | `curl -s -m 10 http://127.0.0.1:17864/api/health` | `{"ok":true,"version":"0.1.0","verifier_pin":"litesvm-npm-1.5.0","db":"ok"}` | 0 |
| 2026-10-04 ~03:00 | `sha256sum content/programs/l1-signer/l1_signer.so content/programs/l2-owner/l2_owner.so` | `aad7d056709fac66d5519b4bd7d109eda73aea77c37bd7cfeb8990267f10d497` + `3d08d88e95a47a13b02ed330746bdd679d42c34d5015a17a10a1ca7d2bc6dbd0` | 0 |

## Verdict
- L1 exploit PASS + L1 neg-control PASS + L2 solve/neg-controls PASS, all rc=0, TS litesvm bridge.
- P0.1 digests match notes/s06-gate-2026-10-04.md pins exactly (no rebuild drift).
- Demo :17864 /api/health green (verifier_pin litesvm-npm-1.5.0, db ok).
- Tooling note: `jscpd` NOT on PATH (`which jscpd` → no jscpd) — jscpd baseline item stays open, owner next turn (needs npx pin or install; no network claim made).

## Still open (unchanged, named owners)
1. Stranger test #1 — owner HUMAN (protocol: notes/s6-stranger-test-2026-10-04.md).
2. Guard rehearsal ledger — owner next agent turn (definition not located in notes/ this turn; grep `guard rehearsal` → no matches).
3. Rust crate (rustc 1.97.1) — UNASSIGNED, optional; TS bridge is verdict path.

INFERENCE (labeled): S6 technical evidence is now fresh-as-of ~03:00 UTC; only the human stranger row blocks the flip.
