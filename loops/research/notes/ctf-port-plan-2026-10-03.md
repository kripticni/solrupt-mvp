# CTF port plan — Solana labs into `content/` (planning, 2026-10-03)

Status: PLAN ONLY (S5 no-code rule holds — no ports, no solve scripts, no tests land until lock).
Sources re-verified live 2026-10-03 ~22:40 via tor (`195.176.3.24`, GitHub API).

## 1. Includable sources (LICENSE verified tonight)

| repo | license | stars | branch | provides |
|---|---|---|---|---|
| `otter-sec/sol-ctf-framework` | BSD-3-Clause | 79 | main | scaffold (`src/` + `examples/`), shape only |
| `z0neSec/solsec-workshop` | MIT | 1 | main | 9 programs (signer-authorization, owner-check, account-data-matching, type-cosplay, arbitrary-cpi, integer-overflow, reinitialization, pda-seed-collision, closing-accounts) + 3 challenges (insecure-vault, token-drain, admin-takeover) |
| `ubadineke/solana-security-by-example` | MIT | 4 | main | 9 vuln demos (Anchor + Pinocchio) |
| `francis-codex/solana-security-patterns` | MIT | 0 | main | `patterns/` vuln/secure pairs + `DEEP_DIVE.md`, pinned `Cargo.lock` |

DO-NOT-TOUCH (unlicensed, idioms-only): Neodyme, sealevel-attacks, Ackee bootcamp/school,
Mysten CTF/bootcamp, MoveCTF, Monethic, Kiinzu infra, BlockChomper, Xzavior34. AGPL/GPL:
reference only, never vendor.

## 2. Port order

1. L1 = `signer-authorization` (z0neSec) — H02 demo room, first.
2. L2 = `owner-check` (z0neSec) — second verifier predicate.
3. Backlog (post-H02, in this order): `arbitrary-cpi` → `type-cosplay` →
   `account-data-matching` → challenge-1 `insecure-vault` (Easy capstone).

## 3. Per-port checklist (one builder track per room)

1. `git show`/`fetch` source at pinned sha; record `repo@sha` + license + author.
2. Land `content/programs/<id>/` (vuln + fixed, attribution header in-file) +
   `content/rooms/<id>.yaml` (id/tier/points/prereq/template/hints[3]/checks/pins).
3. Write solve script (spec §4); run vs vuln → PASS + state diff.
4. Negative control: same solve vs fixed → MUST FAIL, transcript kept.
5. Extend VENDOR_NOTICES (© + license text); grep gate for unlicensed paths.
6. Verifier + gate-runner re-run fresh before closer flips anything.

## 4. Solve-script spec (shape, not code)

- Inputs: room `.so` digest (must match pin), fresh session shape (UUID, keypairs, program IDs).
- Steps: build LiteSVM → `airdrop` → `add_program_from_file` → `send_transaction(exploit)` → `get_account` → predicate assert.
- Outputs: `PASS|FAIL` + state diff + code digest; exit non-zero naming the miss on any deviation.
- MUST also run against the fixed program and FAIL (neg-control pair, same session shape).

## 5. Test plan (runs post-lock, S6/S10 gates)

- `cargo test` per room: exploit-vs-vuln PASS + exploit-vs-fixed FAIL (load-bearing).
- `vitest`: YAML loader (every room parses, every referenced check exists) + `/run` verdict contracts.
- `svelte-check` + `stylelint` + banned-grep + import-lint + `jscpd` (S6 entry checklist).
- Evidence rows per P0.6 (exact commands + outputs, failures verbatim).

## 6. Attribution header format (in every ported file)

`// Source: <repo> (<license>) @ <sha> — © <author>; ported for arena use, original license retained.`
Plus one VENDOR_NOTICES row per repo: © + license text vendored.
