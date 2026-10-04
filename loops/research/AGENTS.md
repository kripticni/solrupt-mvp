# Spacestation Loop — H02 BUILD ACTIVE 2026-10-03

H02 build loop under `mvp/loops/research`. Stara book-code ideja je arhivirana (`archive/book-code/`, read-only istorija) i ne gradi se. Aktivni rad: S5 → S6 → S7 → S8 → S9 → S10 → S11 iz `GOALS.md` (first `pending` = active). One active goal at a time; close with evidence same turn. Gate-blocked goals (named owner + date, awaiting humans/secrets) do NOT hold the loop: advance to the next pending goal and re-check blocked goals each cycle — this is what keeps indefinite runs moving under operator-absent mode.

## Scope
Allowed: S-goal rad po `notes/mvp-scope-2026-10-03.md`; čitanje arhive radi istorije; održavanje loop harness-a (`run-loop.sh`, `sandbox.sh`, hook pinovi).
Forbidden: bilo kakav novi rad na staroj ideji (`archive/book-code/` se ne edituje); novi feature-i van S5-lockanog spec-a pre 19:00 freeze-a; steering sibling loops (read-only telemetry).

## Hard rules
1. **Scope lock.** Nema koda dok S5 ne locka operator (cutting, ne dodavanje). Posle 19:00: F1–F3 as-is. Posle Sun 11:00: format/AV/packaging/rehearsal only.
2. **Numbers are measured.** Latency, timings, bundle bytes come from fresh command output, never memory. Quote `file:line` or the exact command.
3. **Fail-closed offline.** Tor down means stop, never direct (see CURRENT.md tor wiring).
4. **Tor-first quota recovery.** Rate-limit ⇒ `hooks/quota-rotate.sh` ⇒ module `egress-rotate.sh` (`EGRESS_ORDER=tor`). Never hand-roll rotation logic here — fix the module, not a fork.
5. **Small diffs.** One concern per change; novi MVP kod živi pod `mvp/` (ne u arhivi); bottom-up per arch §14 (pins → verifier → API → UI).
6. **No green without negative control.** S6 verifier claims NOTHING without fixed-code-must-fail demonstrated + logged (spec §4b/§8.3). Svaki gate: clean PASS → plant (corrupt/delete/absent, removes text never extends) → trip observed non-zero naming the miss → restore + ledger line. No ledger row = didn't happen.

## LOG-SIGNAL BUDGET (binding — parsers grep, never rename)
1. Per-turn verdict block ≤5 lines, exact tokens:
`turn <n> <YYYY-MM-DD> goal=<ID> rc=<rc> diff=<+a/-d|none> verdict:<DONE|PROGRESS|NO-OP|BLOCKED> next=<ID|none>`
`sweep: evidence:<one-phrase> | verdict:<Clear|Fired|STALE-ESCALATE> | <detail> | rate:<ts|->`
[only if fired/blocked, max 3 lines:] `evidence:<file:line> what:<1 line> act:<1 line>`
2. Cap: round appends ≤15KB to LOOP_LOG.md. Overflow → `notes/spill-<date>.md`; LOOP_LOG keeps pointer `spill:<path> bytes:<n> verdict:<same>`.
3. Dedup: 3rd+ identical consecutive line → counter `repeat x<N> last:<exact prior line>` (normalize iter/timestamps first).
4. Verdict-first: verdict + key evidence on line 1 of every finding and turn block, repeated at bottom for long notes — never middle-only.

## Gate ritual (every done-claim)
- Verdict-first ≤800 words, ≥3 citations (live bytes / ledger rows / verbatim external), every quote two-sided verified pre+post write (`grep -n -F` + `wc -w` + `stat`).
- Dated gate note per goal (`notes/sNN-gate-<date>.md`); closer flips Status same turn with transcript + negative-control transcript attached.
- `[INFERENCE]` / `ESTIMATE+method` labels mandatory. Mechanism without runnable probe = hypothesis.
- Persist-as-you-go: finished fragments appended to workspace files immediately, never temp-only.

## Duplication policing (top AI failure mode — clones 8.3→18%)
- Pin invocation (`npx --yes jscpd@5.1.2`, tool+version+threshold+surface in gate note); baseline counts per surface, never compare % across surfaces; dual thresholds loose+strict.
- Gate pre-commit: count above baseline blocks commit. Consolidate at 3rd sighting (shared helper / single-source fixture), not 1st.
- Leaves ledgered: location + why + re-trigger (e.g. "consolidate on 4th copy"). Silent leftovers = decay.

## Autonomy (operator order pattern 2026-09-18)
Work LONG unsupervised. A 90-sec check-in turn is a defect: plan hours of verifiable work per turn, batch independent tracks in parallel (width ≤3), surface only at goal-close or genuine blocker (Decision/Options/Recommendation/Blocks). Timeouts kill runaways, never shorten legit work.

## Operator-absent mode (operator order 2026-10-03 night — binding until revoked)
The operator is absent. The loop proceeds on charter + locked scope as written:
no scope cuts on the operator's behalf (lock verbatim, zero cuts — S5 record),
no secrets invented (Turso/Spaces tokens stay empty until provided; prod deploy
waits), no humans conjured (honest test waits for real beginners; scripted
stand-ins are rehearsal, never evidence). Every autonomous decision that the
charter assigns to the operator is logged with `OPERATOR-DEFERRED` + date +
revisit trigger instead of being silently taken. Direct-net use for read-only
OSS downloads is authorized (logged per fetch); quota/identity traffic stays
tor-first, fail-closed as ever.

## Pre-flight probes (before any n≥3 fan-out or expensive wave)
ONE cheap existence check first (`test -e` / `grep -c` / `stat` / `find -newer`) proving the premise; log probe + answer in one line. Never dispatch subagents at unverified paths — verify N targets exist, then fan out only to living ones.

## Stop sentinel (wired via run-loop.sh)
`touch <loop>/STOP` between cycles drains cleanly (exit 0) before next iteration; human-plant/human-remove. Absence = continue. Never plant STOP on someone else's loop.

## Prior-art law (binding, read-only)
- `archive/book-code/docs/CATCHUP_NEXT_SESSION.md` → samo istorija stare ideje (ne važi kao nalog za rad).
- Architecture law: `/home/aleksic/ideas/ARCHITECTURE_PROFILE.md` (prime directive: least bugs; one-way deps return-don't-touch; explicit contracts; data>code; fail-safe defaults; verify mechanically; small diffs; logic out of bash); style: `/home/aleksic/opencode.d/STYLE_GUIDE.md`. Conflicts resolve in ARCHITECTURE_PROFILE's favor.
- Agentic engineering corpus (read-only, extend-don't-remine — every adoption cites lineage + new evidence):
  - `/home/aleksic/fleet-ops/GUARDRAILS.md` — 7 guardrail types (only checks-that-throw ever held), 5-step rehearsal, done-checklist.
  - `/home/aleksic/fleet-ops/ORCHESTRATION.md` — 6-step turn (pointer → preflight → 1 unit → save → status → repeat), fan-out waves, joint record.
  - `/home/aleksic/ideas/agent-engineering/loops/research/` — role contracts, curated briefs (≤2k tokens/leg, ≤5 files, zero history), skeleton-before-fanout, adopt-don't-overwrite.
  - `/home/aleksic/ideas/agent-guardrails/notes/findings/` — ranked levers (dup-gate > verify-gate > negative-controls > spec-first thresholds > small diffs), decay modes, compiled wiring (G9 envelope / G10 sentinel / G13 token honesty).
  - `/home/aleksic/fleet-ops/loops/research/SUBAGENTS.md` — orchestrator playbook + depth thirds + model tiers (lead strong, workers cheap).

## Resource limits
Standard caps (2GB RAM, nice -n 19, timeout 60 heavy ops, jobs ≤2). Never disturb a running loop's state. `/tmp` disposable — persist under this tree immediately.

## Delegation (read `SUBAGENTS.md` before first dispatch)
Every dispatch names `role:<scout|planner|builder|verifier|reviewer|debugger|gate-runner|closer>` + handoff (objective/output-format/tools+boundaries/effort:S|M|L); width ≤3, same-turn launch. Max delegation depth 3. Builder never verifies own work; ONLY the closer writes gate notes + flips Status. Depth multiplies spend — estimator thirds are ceilings, not targets.
