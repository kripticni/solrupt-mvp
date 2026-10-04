# PINS — toolchain pins with measured evidence (2026-10-03, S6 Diff 1)

All versions below were resolved live via tor tonight, nothing from memory.
`Cargo.lock` / `package-lock.json` get committed alongside the manifests that need them.

| component | pinned | evidence |
|---|---|---|
| Node (Docker + CI base) | `v22.23.3` | `nodejs.org/dist/index.json` latest v22; tarball sha256 `df450af8…dcbe2e02de` verified pre-unpack |
| `litesvm` npm (TS bridge) | `1.5.0` exact | `registry.npmjs.org/litesvm` `dist-tags.latest`; 51 packages installed via tor, canary GO |
| LiteSVM Rust core | `v0.17.0` | `LiteSVM/litesvm` releases, 2026-09-28 (5 days old — watch for churn, fallback `v0.16.0`) |
| Anchor CLI (L1 `.so` build) | `v0.32.2` | release 2026-09-14 (repo moved coral-xyz → new location id `325891672`; resolve at build time) |
| Rust (local) | `1.97.1` stable | `rustc --version` on this machine; Solana BPF pin rides with Anchor platform-tools, recorded in S6 gate |

## Correction proposed for S5 lock (scope §11 naming)

Scope §11 says "official `node-litesvm` npm wrapper". The npm package is named
**`litesvm`** (`node-litesvm` is the napi crate directory inside `LiteSVM/litesvm`,
`crates/node-litesvm`). Mechanism stands (official wrapper, no hand-rolled binding);
only the install name was wrong: `npm install litesvm@1.5.0`, `import { LiteSVM } from "litesvm"`.

## Amendment measured 2026-10-03 (14 §9 pins)

`@sveltejs/vite-plugin-svelte@^4` peer-demands `vite@^5`, conflicting with the locked
`vite@^6` (npm eresolve, verbatim). Bumped to `^5.0.0` (peers `vite@^6` + `svelte@^5`,
accepted by kit 2.70.3): install green (246 packages via tor), `svelte-check`
0 errors 0 warnings. Propose 14 §9 pin `^4` → `^5` at S5 lock.

## Amendment 2026-10-03 (P0.2 findings table)
`findings` gains `attempts` + `hints_used` (frozen at mint): the public proof page must
recompute the transcript exactly (19 §4.4), and live counts drift after mint. Also fixed
a same-millisecond hazard: one `now` stamp feeds both transcript and row. Propose for
S5 lock; `schema.sql` carries the comment.

## Canary transcript (S6 Diff 2, GO)

- Scratch: `/tmp/s6-canary` (Node binary + `node_modules` stay scratch, never committed).
- Landed: `mvp/verifier-ts/canary.mjs` + `package.json` (exact pin).
- Result: `CANARY pre=0 post=1000000000` + `CANARY GO: LiteSVM in-process on Node v22.23.3`, rc=0.
- Honest stumbles on the way: system-program address (`1111…`) airdrops as no-op (pre=post=1);
  fresh accounts read `null` pre-airdrop (coalesce `?? 0n`). Both encoded in the landed script.
- Local `/usr/bin/node` is v24; scope pins 22 — canary ran 22, Docker/CI run 22, v24 is dev-only.

## Amendments 2026-10-03 (API surface, all proposed for S5 lock)

- New: `POST /api/session` (claim-a-name → uuid) + `GET /api/rooms/[id]` (lab detail:
  hints + sources + template) + `GET /api/search` (FTS). D18's five cannot mint
  sessions, feed the lab, or search — F3.1/F2.2/F1.5 require them.
- `GET /api/proof/:hash` gains `solver` (public nickname; board already publishes it).
- `GET /api/board` entries gain `rooms[]` (F3.4 profile merge needs rooms solved).
- `lesson_completions` table + `POST /api/lesson-complete` + `GET /api/users/:nickname` + `/profile/:nickname` (F3.4 "lessons done"; quiz-pass auto-marks).
