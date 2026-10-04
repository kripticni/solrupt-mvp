# Solrupt

Break real Solana programs in your browser. Prove it with a link.

Seven live raids against real Solana programs. No setup, no wallet, no toolchain. Claim a nickname, run the exploit, and walk away with a proof URL a stranger can rerun alone.

Live demo copy: "Drain the vault. Keep the proof."

## How it works

Three steps, same loop every room:

1. Learn. Five minute lessons on accounts, signers, owners, CPI, types, and relationships. Each lesson ends in a room.
2. Hack. Vulnerable and fixed programs side by side. One Run button, a state verdict, hints on demand.
3. Prove. Write the finding, mint the proof URL. Attempts, hints, timestamps, and code digest are baked into the hash.

## Why the verdicts hold

The verdict reads on chain account state, never log text. Every pass ships with a negative control: the same exploit runs against the fixed program, which must refuse it. If the fixed code passes, the lab is broken, not you.

## The seven raids

| Room | Title | Tier | Points |
| --- | --- | --- | --- |
| l1-signer | Missing signer: drain the vault | Easy | 100 |
| l2-owner | Missing owner: fake the collateral | Medium | 250 |
| l3-cpi | Confused deputy: release on a fake callee | Medium | 200 |
| l4-cosplay | Wrong costume: claim as a user you are not | Hard | 300 |
| l5-match | Wrong vault: a valid signature on someone else's account | Medium | 200 |
| l6-vault | Vault raid: drain 100 percent in one transaction | Easy | 100 |
| l7-overflow | Off by quintillions: wrap the books | Hard | 250 |

Start at `l1-signer`. It takes under a minute and teaches the one word fix.

## Quickstart

Prereqs: Node 22, npm. Docker optional for the single image build.

```bash
cd apps/web
npm install
npm run dev
```

Seed a local SQLite DB from the room yamls (idempotent, safe to rerun):

```bash
ARENA_DB=./arena.db node ../seed.ts
```

Useful checks:

```bash
npm run check   # svelte-check, zero errors
npm test        # vitest suite
```

Production image (API plus static frontend, port 7860):

```bash
docker build -f mvp/Dockerfile -t solrupt .
```

## Repo layout

- `apps/web/` : SvelteKit frontend plus API routes (`/api/run`, `/api/proof`, `/api/board`, `/api/session`). `src/routes/` holds landing, rooms, proof, and board pages.
- `content/programs/` : L1 to L7 Solana programs (vuln plus fixed, Anchor). `content/rooms/` : room yamls with pins, digests, hints, and checks.
- `content/lessons/`, `content/quizzes/` : guided lessons and server checked Q and A.
- `verifier-ts/`, `verifier-rs/` : LiteSVM execution bridge (TS in process, Rust core). Canary: `verifier-ts/canary.mjs`.
- `schema.sql`, `seed.ts` : SQLite schema and idempotent seed. The SQLite file is the production DB, back it up by copy.
- `loops/` : build ops harness (goals, gates, notes). Not part of the runtime.
- `PINS.md` : pinned toolchain with measured evidence. `TROUBLESHOOTING.md` : symptom to cause to fix. `VENDOR_NOTICES` : reused code and licenses.

## Proof format

Every proof URL carries: solver hash, timestamps, attempts plus hints used, code digest, verifier pin, and grade status. Rerun recipe: claim a name, paste the target, press Run exploit.

## FAQ

Do I need a wallet? No. Claim a nickname and get a session. A wallet pubkey string exists for later, guest mode is allowed.

Does it cost anything? No. Free forever. Execution is hermetic LiteSVM in process: zero real money, zero real transactions, zero devnet.

What setup do I need? A browser. The editor is plain, Run is one click or Ctrl plus Enter.

Which chain? Solana only. Rooms run against real Solana programs.

I never touched Rust or Solana. Start at lesson 101, then open `l1-signer` and drain the vault.

## Licenses

Code in this repo is GPL-3.0 (see `LICENSE`). Labs port vendored sources under their own licenses: OtterSec BSD-3-Clause, z0neSec MIT. LiteSVM is Apache-2.0/MIT (dependency only). Full list in `VENDOR_NOTICES`.
