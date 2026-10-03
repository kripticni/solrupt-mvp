# GOALS — Spacestation Loop (mvp)

> 2026-10-03: S1–S3 RETIRED — stara book-code ideja se ne gradi. Istorija ispod ostaje radi traga, nikakav rad po njoj. Novi MVP golovi stižu od operatora.

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
