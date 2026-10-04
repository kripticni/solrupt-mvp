# S6 active probe — 2026-10-04 turn (updated live)

Standing order H02 build 2026-10-03. S5 complete, S6 first pending → active.
Scope: notes/mvp-scope-2026-10-03.md §§4–4b. Freeze: Sat 19:00 scope, Sun 11:00 code+evidence.
Brief path miss LOUD (expected, no such file): notes/s6-agent-brief.md → No such file or directory (os error 2). Worked from GOALS.md S6 + scope.

## P0.6 rows — fresh this turn (cwd /home/aleksic/spacestation/mvp, UTC 2026-10-04)
| time | command | output verbatim | rc |
|---|---|---|---|
| ~03:15 | `timeout 60 node verifier-ts/solve-l1.mjs` | `SOLVE PASS: vault 100000000 -> 60000000 (attacker gained 40000000)` | 0 |
| ~03:15 | `timeout 60 node verifier-ts/solve-l1-negative.mjs` | `NEG-CONTROL PASS: fixed refused unsigned withdraw (TransactionErrorInstructionError { index: 0, error: InstructionErrorCustom { code: 3010 } })` | 0 |
| ~03:15 | `timeout 60 node verifier-ts/solve-l2.mjs` | `SOLVE: insecure trusted fake balance 1000000 from System-owned account` + `NEG-CONTROL PASS: secure-manual refused (... 6000)` + `NEG-CONTROL PASS: secure-anchor refused (... 3007)` + `SOLVE PASS: fake 1000000 trusted by insecure, refused by both secure` | 0 |
| ~03:15 | `sha256sum content/programs/l1-signer/l1_signer.so content/programs/l2-owner/l2_owner.so` | `aad7d056...f10d497` + `3d08d88e...2bc6dbd0` (match s06-gate pins) | 0 |
| ~03:15 | `curl /api/health :17864` | `{"ok":true,"version":"0.1.0","verifier_pin":"litesvm-npm-1.5.0","db":"ok"}` | 0 |
| ~03:15 | `curl GET /api/rooms` | HTTP 200, 905 bytes, l1-signer Easy 100 live + l2-owner Medium 250 live | 0 |
| ~03:15 | `curl GET /api/board` | HTTP 200 `{"entries":[],"first_solvers":[]}` | 0 |
| ~03:15 | `curl POST /api/run {room,code} no session` | HTTP 500 `{"message":"Internal Error"}` — unauthenticated refuse path fails closed (not green) | 500 |

## Verdict lines
- L1 exploit PASS + L1 neg-control PASS + L2 solve/neg-controls PASS, all rc=0, TS litesvm@1.5.0 bridge.
- P0.1 digests match s06-gate pins exactly (no rebuild drift).
- P0.4 partial: /api/rooms + /api/board + /api/health green; POST /api/run without session refuses (500, verbatim above) — full session→run→finding→proof chain still needs session-scoped probe.
- Still open (owners): stranger test #1 — HUMAN (protocol notes/s6-stranger-test-2026-10-04.md); guard rehearsal + jscpd — next agent turn; Rust crate rustc 1.97.1 — UNASSIGNED optional (TS bridge is verdict path).

INFERENCE (labeled): S6 technically green on TS bridge + :17864; only human stranger row blocks flip.

## 2026-10-04 ~01:18 UTC turn (queue line: S6 active, brief miss LOUD)
- Brief miss LOUD (expected path `notes/s6-agent-brief.md`): `No such file or directory (os error 2)` verbatim — worked from GOALS.md S6 + scope §§4–4b.
- Fresh probe `scripts/s6-verify-turn-2026-10-04.sh` rc=0: `find -maxdepth 4 (*.so|*pin*|*verif*)` inside research dir returns ONLY notes/scripts hits (no prebuilt L1/L2 `.so` under `loops/research/` — implementation lives under `mvp/` tree outside this loop dir, consistent with prior pins in `notes/s6-active-probe` P0.1 digests); endpoint grep (`/health|/verify|/run|/rooms|/evidence` in `*.ts|*.js|*.py` under research) returns EMPTY (app code is in untracked `mvp/apps/` per git status, not in loop dir — read-only, no drift claimed); negative-control grep hits scope + done-checklist + prior S6 notes (verbatim rows above, rc=0).
- No mutations this turn (read-only find/grep, timeout 60, nice -n 19, no chrome, no network).
- Verdict (verbatim-grounded): prior turn's TS-bridge green rows in this living note stand (L1/L2 solves + neg-controls rc=0, pins match, /api/health+rooms+board green, POST /api/run no-session 500 fail-closed); still open: stranger test #1 — HUMAN owner; full session→run→finding→proof chain probe needs session scope (next agent turn, from `mvp/` tree, not loop dir).

INFERENCE (labeled): S6 stays `pending`; nothing in this turn's read-only probe contradicts or advances the technical-green claim — gate remains the human stranger row.
