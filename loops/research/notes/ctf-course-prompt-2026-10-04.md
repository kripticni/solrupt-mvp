# CTF_COURSE — content expansion prompt: more CTFs, mini-course with pictures + Q&A + completion points (run in a fresh session)

Paste everything below the line into a new session. Mission: turn our two rooms
into a real mini-course — more ported CTFs, picture-led lessons, and TryHackMe-style
Q&A checks that award completion points. Study deeply first, build second.

---

You are expanding the Solana Security Gym's CONTENT (lessons + rooms + quizzes),
not its platform. No new windows, no new user-facing features beyond one small
quiz-check mechanism (spec'd below). Everything you write must be learnable by a
React junior who has never touched Rust.

## 0. Start the world first (in this order)

1. Revive tor (all GitHub fetches go through it; fail-closed, never direct):
   `bash /home/aleksic/ideas/tor-egress/egress/tor-pilot.sh status --pilot fleet`
   (if down: `start --pilot fleet`, then `ready` — the READY line is the gate).
2. Re-verify every source license LIVE before touching its content (GitHub API
   via tor: `curl -s --socks5-hostname 127.0.0.1:19350 --max-time 25
   https://api.github.com/repos/<owner>/<repo>` → `.license.spdx_id`, plus the
   raw LICENSE file). Any source whose license is missing or changed since the
   table below → idioms-only, zero bytes copied. Log every check.
3. Read the port plan + existing content (all of it, small tree):
   `/home/aleksic/spacestation/mvp/loops/research/notes/ctf-port-plan-2026-10-03.md`,
   every file under `/home/aleksic/spacestation/mvp/content/rooms/` and
   `/home/aleksic/spacestation/mvp/content/lessons/` and
   `/home/aleksic/spacestation/mvp/content/programs/l1-signer/` and `l2-owner/`.

## 1. Source table (verified 2026-10-03 night — re-verify per §0.2 anyway)

INCLUDABLE (permissive, attribution headers mandatory):
- `otter-sec/sol-ctf-framework` (BSD-3-Clause) — scaffold + examples
- `z0neSec/solsec-workshop` (MIT) — 9 programs + 3 challenges + `docs/DEEP_DIVE.md` + `AUDIT_CHECKLIST.md` (study these two files deeply — they are the course backbone)
- `ubadineke/solana-security-by-example` (MIT) — 9 vuln demos, Anchor + Pinocchio
- `francis-codex/solana-security-patterns` (MIT) — vuln/secure pairs + `DEEP_DIVE.md`, pinned Cargo.lock

DO-NOT-COPY (unlicensed — read for understanding, reimplement in your own words,
never copy code or prose): Neodyme solana-ctf / breakpoint-workshop /
poc-framework, coral-xyz sealevel-attacks, Ackee Bootcamp + School of Solana,
Mysten CTF + bootcamp, MoveCTF, Monethic, Kiinzu infra, BlockChomper, Xzavior34.
AGPL/GPL (Sec3 x-ray, solana-playground server): reference only, never vendor.

## 2. Study deeply first (this is the job — ports without understanding are rejected)

Before writing a single lesson, read and take notes in
`/home/aleksic/spacestation/mvp/loops/research/notes/course-study-<date>.md`:
- z0neSec `DEEP_DIVE.md` + `AUDIT_CHECKLIST.md` end to end; distill the RECURRENT
  5 checks an auditor runs on every Solana program (signer, owner, PDA/bump,
  CPI target, reload-after-CPI).
- The vuln AND fixed variant of every program you plan to port; for each, write
  one paragraph: what the attacker does, which single check stops them, and the
  cheapest test that proves it.
- francis-codex `DEEP_DIVE.md` for the second opinion where it disagrees with
  z0neSec — note disagreements explicitly, pick the stricter claim.
- Port order (copy-mutate gen-2, no shared-room abstraction): `arbitrary-cpi` →
  `type-cosplay` → `account-data-matching` → challenge-1 `insecure-vault` (Easy
  capstone). L1/L2 are landed — do not touch them except to fix proven errors.

## 3. What you build (content only)

A. New rooms (one builder track per room, same shape as L1/L2): single-file
   `src/lib.rs` (Anchor `#[program]` requires one module tree) with
   `// PANEL: both|vuln|fixed` markers, `Cargo.toml`, exploit template with
   TODO gaps, room yaml (id/tier/points/prereq/template/hints[3]/checks/pins/
   attribution with `repo@sha` + license + author), VENDOR_NOTICES row.
B. Lesson per room (5-minute markdown in `content/lessons/`): accounts-level
   explanation → the bug → ONE real-world one-liner (Wormhole $320M class only
   where true — never invent incidents) → key snippet → "Open the room" ending.
   Lessons 2–5 stubs stay stubs until their room lands.
C. Pictures: ORIGINAL hand-drawn SVG diagrams committed under
   `content/lessons/assets/` (never hotlinked, never copied from anywhere):
   account anatomy (address/data/owner), signer-vs-pubkey, PDA seeds+bump,
   CPI confused-deputy arrow diagram — one per lesson minimum. ASCII-first
   drafts in the study note, SVG second. No binary blobs, no stock, no emoji.
D. Q&A checks (TryHackMe-style, proposed mechanism — record as S5-lock
   amendment): 2–4 questions per lesson (what/why/fix, severity-labeled),
   validated SERVER-SIDE (never client-authoritative progress — architecture
   law), each worth small completion points feeding the EXISTING board/points
   path (progress display only, zero hiring language — P2 forbids ranking as
   signal). If the minimal mechanism needs a new endpoint or column, spec it
   in the study note first (shapes + why existing tables can't carry it),
   then build it — one concern, tested, gated like everything else.

## 4. Hard rules (violations get reverted)

1. License boundary is a gate, not a memory: every ported file carries the
   attribution header (`Source: <repo> (<license>) @ <sha> — © <author>`);
   `VENDOR_NOTICES` extended per repo; the CI unlicensed-path grep must stay
   green (run it: it lives in `.gitea/workflows/ci.yml`).
2. Scope freeze holds: lessons + rooms + quizzes + pictures ONLY. No platform
   features, no new windows, no seasons, no teams, no wallet, no leaderboard
   semantics beyond progress display.
3. Points are progress, never rank: no "top hackers" language, no hiring
   promises, no certificate PDFs (proof URLs only — brief P2).
4. Solana-only on every public surface (grant positioning — locked): no Sui/Move/
   other-chain mentions anywhere user-facing; multi-chain notes stay in
   internal research files.
5. Every exploit template ships with a solve YOU ran: exploit-vs-vuln PASS +
   exploit-vs-fixed FAIL transcripts in the study note, or the room doesn't land.
6. Pictures are original SVG: no traced logos, no copied diagrams, no text-as-
   paths you didn't write. Every diagram has a one-line caption stating what it
   proves.
7. Small diffs, one room per track; copy-mutate until gen 3 earns abstraction.
   Numbers measured (`sha256sum`, `stat`, real command output), never memory.

## 5. Gates (every room/lesson/quiz ships only after all of these)

- `./node_modules/.bin/svelte-check` 0 errors + `./node_modules/.bin/vitest run`
  green (from `mvp/apps/web/`; loader tests cover every new yaml: parses + every
  referenced check exists + hints[3])
- Solve + negative-control transcripts pasted in the study note (same exploit,
  same session shape, both directions)
- `vite build` clean + server restarted (kill → build → seed → start; seed
  verifies every new `.so` digest against its yaml pin — extend `seed.ts`
  room list as rooms land)
- Q&A answers validated server-side; a wrong answer returns fail-with-action,
  never a pass; points appear on the board only after a pass
- Append one block to `mvp/loops/research/LOOP_LOG.md` (verdict-first, files,
  measurements, transcripts referenced)

## 6. Done looks like

A reply containing: (a) study note path + the 5 auditor checks distilled,
(b) rooms/lessons/quizzes/pictures landed (paths + tiers/points),
(c) per-room PASS + neg-control transcript references, (d) license re-verify
log (every source, live), (e) gate numbers, (f) what you left stubbed + why,
(g) the single weakest lesson in your honest judgment.
