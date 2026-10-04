# CURRENT — Spacestation Loop (mvp/loops/research)

**Status 2026-10-04 (resume point): H02 BUILD ACTIVE. Shared tree with a SIBLING session (theirs: rooms L3–L7 + lessons/quizzes/SVGs + mobile/UX round 2 — attributed, quality; coordinate via LOOP_LOG, never touch their files). S5 locked. S6 machine-complete, pending stranger test + gate note. Course track closed per sibling log (7/7/7/7). Brand: SOLRUPT (nav/title/meta; deck still old name — S9 sync). Deploys: MINE :17865 immutable `build-mine-010` (health 200); THEIRS :17864 + shared `build/`. Demo DB fluid (seeded rows vanish on testing) — evidence rows are the record. Profiles live (`/profile/:nickname`, quiz-pass auto-marks lessons). S6–S11 all pending; no goal flipped without a gate note.**

## Operator directive 2026-10-04 (~02:45, binding until revoked)
- CHROME IS GROUNDED: no Chromium/headless launches unless pixel-verification is
  unavoidable for the exact change under test (it cost 7GB RAM). Prefer
  curl + DOM asserts + `svelte-check` + vitest. When a launch is unavoidable:
  ONE instance, `--headless` one-shot `--screenshot` (never persistent, never
  parallel), kill immediately after, log peak RSS. Never touch `/opt/brave*`
  (operator's own browser — killing it is a firing offense).
- Priorities while absent: gorgeous modern UI/UX (S11 items 1–9) > technical
  completion (S6/S10/S8-technical/S7-technical) > pitch technical halves (S9:
  script-to-slide sync, PDF export ONLY via one-shot headless print-to-pdf;
  team names + test numbers stay `[dopisati]` for humans).
- Expected on return: UI transformed with BEFORE/AFTER shots, all technical
  parts done-or-gate-blocked with named owners, pitch deck built except human
  fill-ins. Humans/secrets-gated items wait — never fake them.
- Note discipline (2026-10-04 ~01:00): ONE living probe note per goal, updated in
  place; near-duplicate probe notes are motion-without-output (see lessons.md)
  and burn quota — batch findings, never one-note-per-turn.

## Iteration instructions (važi kad stigne novi MVP spec)
1. Read `GOALS.md` → first `pending` S-goal is the work (S1 → S2 → S3 chronological).
2. Land artifacts + dated gate note → flip Status same turn → append LOOP_LOG → repeat.
3. Caps: 2GB RAM, `nice -n 19`, `timeout 60` heavy ops, jobs ≤2. `/tmp` disposable — persist immediately.
4. Old domain law RETIRED 2026-10-03 (bivši `docs/CATCHUP_NEXT_SESSION.md`, sada `archive/book-code/docs/` — samo čitanje istorije, nikakav novi rad po njemu).

## Fleet wiring (live 2026-10-02, preseljeno 2026-10-03)
- Seeded by `fleet init --preset default --hooks none`; run via `fleet run /home/aleksic/spacestation/mvp/loops/research` or contained via `mvp/loops/research/run-loop.sh` (copy of fleet-ops launcher + `sandbox.sh`, provenance: `/home/aleksic/fleet-ops/loops/research/`).
- In the fleet census since 2026-10-02 (`fleet sweep` → `spacestation/loops/research | evidence:clear`; `fleet status spacestation` resolves). Mechanism fixed upstream same day: roster is data (`~/.config/fleet/loops.conf`, unioned over the embedded fallback) and `fleet init` self-registers — no rebuild per loop.
- `run-loop.sh` needs the loop dir only; project = two levels above it. Worker NOT started — operator's call (long-lived process + quota).

## Tor-egress wiring (module: `/home/aleksic/ideas/tor-egress/egress/`)
- Quota hook `hooks/quota-rotate.sh` is a THIN WRAPPER — `exec`s the module's `egress-rotate.sh`, zero logic fork (DRY). Pinned in `hooks-registry.json` with sha256 + `TOR_*` env (contract-visible).
- Env contract: `TOR_SOCKS=127.0.0.1:19350` (scratch tor `fleet`, NOT system :9050) + `EGRESS_ORDER=tor` (c90 fallback unwired here — empty `C90_CMD` = tor-only, logged never faked) + `NO_PROXY=127.0.0.1,localhost` (loopback serve/Gitea stay direct).
- Revive after reboot: `bash /home/aleksic/ideas/tor-egress/egress/tor-pilot.sh start --pilot fleet` then `... ready` to gate. Fail-closed: Tor down ⇒ traffic stops, never direct.
- Canonical copies under `~/.config/fleet/hooks/` are byte-identical to the module (verified 2026-10-02) — either path is the same code; the wrapper points at the module source.

## Loop ops (2026-10-03 improvements from fleet-ops + agent-engineering/guardrails)
- Stop: `touch mvp/loops/research/STOP` drains between cycles (exit 0); absence = continue.
- Transcripts: `run.conf tee_transcript=true` for H02 evidence (turn transcripts are re-verifiable proof).
- Gate kit: `notes/done-checklist.md` (copy into every gate note) + `notes/evidence-schema.md` (P0.6 rows from Sat 11:00) + `notes/lessons.md` (verifier appends one fail→lesson line per miss).
- Hook pin fixed 2026-10-03: `hooks-registry.json` path was `spacestation/loops/...`, real is `spacestation/mvp/loops/...`; sha `7374a166…0744a58` verified both sides.
- Knowledge base (start here before citing any rule): `notes/prior-art-index.md` (reading map) → `notes/fleet-ops-distilled.md` + `notes/agent-corpus-distilled.md` (compressed rulings) → `notes/session-handoff-2026-10-03.md` (mine vs pre-existing) → `web3-security-platform/17-architecture-review.md` (2 S5 blockers).
- Petruci design/pitch (on `gitea/design-doc`, NOT on local disk — `git fetch gitea` first, read via `git show gitea/design-doc:<path>`): `design/DESIGN_DOC.md` + `design/DESIGN_SYSTEM.md` (v1.0, law for visible surfaces) + `design/PITCH_CONTEXT.md` (pitch research: YC/Kawasaki/Sequoia/Colosseum/MLH) + `design/pitch-skript.md` + `design/pitch.html` (9 slides) + `design/brand-board.html` + `design/system.html` + `design/technical.html`; `page/` is a plain-Vite sketch, never merge as the app. S9 owns these files.

## Standing state (2026-10-03)
- Stara ideja arhivirana: `archive/book-code/` (poslednje zeleno 2026-09-30: 9/9 pytest, 16/16 gcc-clean, bundle 384K <5MB).
- H02 istorijat ostaje u arhivi (`archive/book-code/docs/H02_BRIEF.txt`) — za challenge sadržaj ga supersede-a on-paper reveal (`mvp/loops/research/notes/h02-challenge-brief-2026-10-03.md`); mail deo (kontakti/hrana/oprema) i dalje važi.
- H02 venue-brief (11 strana papira, 9 unikatnih): centralno pitanje = 1 osoba pretvara znanje/veštine/kontakte u sledeći ostvariv korak ka iskustvu/radu; pravci P1 (ekspertiza) / P2 (vidljiva veština: tvrdnja→proverljiv rad→feedback→sledeći korak; NE auto-ranking/sertifikacija) / P3 (prva prilika: uslovi→obaveze→nepoznanice→potez; NE više oglasa); disciplina: 1 korisnik → 1 problem → ≤3 funkcije → 1 hipoteza → 1 test → 1 sledeći korak; rubrika H02-RUB-H01-100 (25+25+20+15+15); EVIDENCE > CLAIMS; build 3.10 11:00 → 4.10 11:00; scope freeze 19:00; code&evidence freeze 11:00; pitch 4+3+1.
- Sudije odobrile Solana starter arenu pod P2 (tvrdi korisnik + P2 lanac pokriveni validatorom i dokaz-URL-om).
