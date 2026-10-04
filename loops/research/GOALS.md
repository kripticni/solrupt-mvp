# GOALS — Spacestation Loop (mvp)

> 2026-10-03: S1–S3 RETIRED — stara book-code ideja se ne gradi. Istorija ispod ostaje radi traga, nikakav rad po njoj. Novi MVP golovi stižu od operatora.
> Oct 4 2026 retrack (operator): no outside testers, pitch later. S6 closed on the technical gate, S7 retired into S8, S9 deferred. Active path is S8 then S10 then S11.

Format: S<n> with Status/Target/AI instructions. First `pending` = next work. A finished goal flips Status the same turn with a dated gate note — never park finished work. S-series avoids Q/G/R collision with brain-as-llm, fleet-ops, and tor-egress.

## S1: Permission world-track log (Oct-1 calls + Oct-2 nudge)
- **Status:** `retired` (2026-10-03 — stara ideja se ne gradi)
- **Target:** every call/SMS from `paper/OCT1_OCT2_RUNBOOK.txt` §3 logged with MOZE/TISINA/NE + time + quote; H2 PASS/ARM/FAIL verdict recorded; Oct-2 12:00 nudge sent. The loop RECORDS human outcomes — it never sends mail or calls.
- **AI instructions:**
  1. Never type real book text (Ciric/Praktikum/Zbirka) until a MOZE signature is logged — teaser-only until then.
  2. H6 silence = FAIL, H12 <12/20 green = pivot circle — no debate, flip immediately.

## S2: Print-bag + rehearsal debt before Oct-10 morning
- **Status:** `retired` (2026-10-03 — stara ideja se ne gradi)
- **Target:** timed 3-min/90-sec runs + filler count; QR 2m scan + 10s hold; airplane drill; abort-to-paper speed; one latency number; 3 quotes in `paper/QUOTE_LOG.txt`; bag photo per runbook §6.
- **AI instructions:**
  1. Measured numbers only (stopwatch + log lines) — no recalled timings.
  2. Rubric self-score re-taken after debt clears (need 40 for morning slot).

## S3: Oct-3 H0 re-verify + freeze
- **Status:** `retired` (2026-10-03 — stara ideja se ne gradi)
- **Target:** `seed_20.py` + `pytest` 9/9 + WiFi-off 3-step all green; bundle re-synced <5MB; `git tag freeze-0800` Oct-4 08:00.
- **AI instructions:**
  1. No new features pre-Oct-3 — re-verify only, unless the operator orders otherwise.
  2. Any red aborts the freeze — fix forward, never tag red.

## S4: Repo reorg + fleet loop + tor-egress wiring (this turn)
- **Status:** `complete` (2026-10-02, gate: this note — 9/9 pytest + hook drill exit 0 + tor READY + commit `587de6d`)
- **Target:** flat root sorted into `docs/` + `paper/` + `logs/` with `tests/test_pack.py` paths fixed, `FILELIST.txt` regenerated, 9/9 pytest green; `loops/research/` live via `fleet init`, quota hook tor-first through the tor-egress module, tor pilot `fleet` READY; first commit.
- **AI instructions:**
  1. Code (`.py`, `c/`, `expected/`, `app.db`) stays at root — `db.py` uses relative `DB_PATH` and tests import flat modules; moving them breaks imports for zero benefit.
  2. `offline_bundle/` is a frozen WiFi-off snapshot — never edit in place, re-sync only by documented procedure.

## S5: H02 scope lock (Sat before 19:00 freeze)
- **Status:** `complete` (2026-10-03 night, gate: `notes/s05-gate-2026-10-03.md` — autonomous lock-as-written under operator-absent mode, zero cuts, 5 amendments proposed-not-applied)
- **Target:** operative spec locked — user/problem/hypothesis/names confirmed, F1–F3 + P0.1–P0.10 + §9 decisions + §11 part-2 initialed by operator; any cut recorded with date in §5/§9.
- **AI instructions:**
  1. No code until S5 locks — planning only; cuts welcome, additions need operator word.
  2. Keep one decision table (§9) + one locks list (§11); new calls append there, never in chat only.

## S6: Verifier + 2 rooms green (Sat, before evening honest test)
- **Status:** `complete` (Oct 4 2026, gate: `notes/s06-closeout-2026-10-04.md`; operator ordered close, stranger test waived)
- **Target:** P0.1 pins + L1/L2 `.so` prebuilt with digests + `verify(session,room,exploit)` green incl. NEGATIVE CONTROL (exploit vs fixed must fail, logged) + P0.2 schema + P0.4 five endpoints + F2.2 lab shell wired to Run; gate: honest-test-ready end-to-end (stranger test #1 passes).
- **Waiver Oct 4 2026 (operator):** stranger test 1 is out. Technical gate alone closes this goal.
- **AI instructions:**
  1. Bottom-up per arch §14: pins → verifier → API → UI; never debug the top when the bottom is unverified.
  2. Hermetic always: zero real money/txs/devnet; behavior-identical emulation allowed.
  3. Entry checklist (read before S6 code): scope §9+§11, `14` §2+§6+§9 pins, `15` §§1–7, `18` §§1–10+§14, `19` §§1–8, `16` both tracks + shared pre-flight; ship CI fast gate + svelte-check/stylelint/banned-grep + import-lint + jscpd with first code; F1 + F3 ride with the e2e gate, not later.

## S7: Honest test + evidence + offline (Sat evening)
- **Status:** `retired` (Oct 4 2026, operator: outside testing out of scope for this venue; evidence plus offline folded into S8)
- **Target:** self run rehearsal of the lab protocol with verbatim failure log; offline bundle passes with network disabled; VENDOR_NOTICES + AI disclosure drafted.
- **AI instructions:**
  1. A null result is valid iff transparent. No repeat runs to chase green.
  2. Evidence rows carry exact commands + outputs; nothing reconstructed Sunday.

## S8: Freeze + production + demo order (Sun)
- **Status:** `pending` (spec: H02 brief freeze windows; demo `16-demo-plan.md` Track B; scope P0.9–P0.10; deck + rehearsal → S9)
- **Target:** 11:00 CODE & EVIDENCE FREEZE (last commit sha + tests n/n + bundle bytes logged); production URL live + `/health` green + Turso persist verified + QR into the S9 deck; recorded demo plays first, live site second.
- **AI instructions:**
  1. After 11:00: formatting + AV + offline packaging + rehearsal only — no new features/results as sprint evidence.
  2. Any post-freeze fix = new tag + re-seed + re-test + one logged line.

## S9: Pitch deck + pitch research + rehearsal (Sun, S8 window)
- **Status:** `deferred` (operator order Oct 4 2026: pitch later; revisit on operator call; blocks nothing)
- **Target:** 9-slide deck synced with the 4-min script (~520 words), PDF exported (3–12 slides, first 3 on H01 spine), team names + Saturday test numbers filled verbatim, 5 Q&A answers ready, timer rehearsals stopping at 3:50, delivery 4+3+1.
- **AI instructions:**
  1. Research first, all from files: `git fetch gitea` then `git show gitea/design-doc:design/PITCH_CONTEXT.md` + `:design/pitch-skript.md` + `:design/pitch.html` + `:design/DESIGN_SYSTEM.md` + `:design/DESIGN_DOC.md` §§10–12; ground every number in `web3-security-platform/09-evidence-and-sources.md` + scope — no invented facts, unmeasured stays `[dopisati]`.
  2. Sync script to 9 slides before any rehearsal (script was written for 6); content frozen Sun 11:00 with S8 — after that formatting/AV/rehearsal only.
  3. Design system is law for visible surfaces (`DESIGN_SYSTEM.md` v1.0 + anti-slop rules); `page/` on the branch is plain Vite, not SvelteKit — reference only, never merge as the app.
  4. Deferred Oct 4 2026: skip this goal until the operator calls it back. It blocks nothing.


## S10: CTF port track — fetch, port, solve, credit (content, post-S6)
- **Status:** `pending` (spec: `web3-security-platform/10-ctf-license-inventory.md`; `notes/ctf-port-plan-2026-10-03.md`; scope P0.5; `11` §11b)
- **Target:** L1 signer-authorization + L2 owner-check ported from MIT sources into `content/rooms/*.yaml` + `content/programs/` (vuln + fixed + exploit template + 3 hints) with attribution headers; per-room solve script green on local LiteSVM + negative control (same solve vs fixed MUST fail); VENDOR_NOTICES extended; zero files from unlicensed repos (grep gate).
- **AI instructions:**
  1. Includable ONLY: OtterSec BSD-3 (scaffold) + z0neSec/ubadineke/francis-codex MIT (labs) — re-verify LICENSE live per port; Neodyme/sealevel-attacks/Ackee/Mysten/MoveCTF/Monethic/Kiinzu = idioms only, reimplement, never copy.
  2. One room per builder track: port → solve script → cargo neg-control → gate; copy-mutate gen-2, no shared-room abstraction until gen 3.
  3. Every port cites `repo@sha` + license + author in-file and in VENDOR_NOTICES; gate greps for unlicensed paths before any merge.

## S11: Autonomous improvement backlog — rubric-driven, UX first (operator-ordered)
- **Status:** `pending` (spec: `notes/improve-backlog-2026-10-04.md`; UX_PREMIUM §§4–8; H02 rubric 25/25/20/15/15)
- **Target:** backlog items 1–20 landed in order (UX/UI first, demo robustness, feasibility proof, evidence chain), each as one small verified diff with BEFORE/AFTER screenshots; closes only when all landed or moved to a dated gate with a named owner.
- **AI instructions:**
  1. Frontend/UI/UX items outrank all others; rubric points decide ties.
  2. Never invent scope: styling + copy + local proof only; anything needing an endpoint, column, route, human, or secret gets filed — not built.
  3. Screenshot discipline: no visual claim without BEFORE/AFTER shots read back.
