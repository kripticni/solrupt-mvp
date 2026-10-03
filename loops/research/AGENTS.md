# Spacestation Loop — PARKED 2026-10-03 (čeka novi MVP spec)

PARKED loop under `mvp/loops/research`. Stara book-code ideja je arhivirana (`archive/book-code/`, read-only istorija) i ne gradi se. Nema aktivnog gola dok operator ne zada novi MVP spec. One active goal at a time (S-series in `GOALS.md`); close with evidence same turn.

## Scope
Allowed: čitanje arhive radi istorije, priprema novog MVP skeleta po nalogu operatora, održavanje loop harness-a (`run-loop.sh`, `sandbox.sh`, hook pinovi).
Forbidden: bilo kakav novi rad na staroj ideji (book-code/circle/classcast, `archive/book-code/` se ne edituje); novi feature-i bez operatorovog MVP spec-a; steering sibling loops (read-only telemetry).

## Hard rules
1. **Parked discipline.** Nema rada dok ne stigne novi MVP spec — nikakvi "samoinicijativni" feature-i po staroj ideji.
2. **Numbers are measured.** Latency, timings, bundle bytes come from fresh command output, never memory. Quote `file:line` or the exact command.
3. **Fail-closed offline.** Tor down means stop, never direct (see CURRENT.md tor wiring).
4. **Tor-first quota recovery.** Rate-limit ⇒ `hooks/quota-rotate.sh` ⇒ module `egress-rotate.sh` (`EGRESS_ORDER=tor`). Never hand-roll rotation logic here — fix the module, not a fork.
5. **Small diffs.** One concern per change; novi MVP kod živi pod `mvp/` (ne u arhivi); arhiva se ne edituje.

## Prior-art law (binding, read-only)
- `archive/book-code/docs/CATCHUP_NEXT_SESSION.md` → samo istorija stare ideje (ne važi kao nalog za rad).
- `archive/book-code/docs/SESSION_2026-09-30.md` → šta je stara ideja bila/verifikovala; `archive/book-code/docs/SESSION_2026-09-29.md` → domen stare ideje.
- Architecture law: `/home/aleksic/ideas-reeval-20260823/ARCHITECTURE_PROFILE.md`; style: `/home/aleksic/opencode.d/STYLE_GUIDE.md`.

## Resource limits
Standard caps (2GB RAM, nice -n 19, timeout 60 heavy ops, jobs ≤2). Never disturb a running loop's state. `/tmp` disposable — persist under this tree immediately.

## Delegation (read `SUBAGENTS.md` before first dispatch)
Every dispatch names `role:<scout|planner|builder|verifier|reviewer|debugger|gate-runner|closer>` + handoff (goal/inputs/done/no-touch/write-path); width ≤3, same-turn launch. Max delegation depth 3 (run default; serve allows 3). Builder never verifies own work; ONLY the closer writes gate notes + flips Status. Depth multiplies spend — estimator thirds are ceilings, not targets.
