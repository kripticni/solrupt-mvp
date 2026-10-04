# lessons.md — episodic fail→lesson log (verifier appends one line per miss)

Rule: each entry = `date | goal | fail (observed line) | lesson (what to do next time)`.
Promote to skill/checklist after 2+ hits on same pattern (debugger owns promotion, librarian prunes stale).
Lineage: pattern from `agent-engineering` spill+lessons deltas + `agent-guardrails` decay modes; fleet-ops G-series rehearsals.

## Seed (distilled from fleet-ops + ideas corpus, 2026-10-03 — not yet observed HERE)

- 2026-10-02 | S4 | hook pin path `spacestation/loops/...` vs real `spacestation/mvp/loops/...` drifted silently | lesson: pin by live-file sha BOTH sides every gate (`sha256sum` live vs registry), never trust one side.
- 2026-10-03 | loop | AGENTS.md said PARKED while GOALS S5–S8 + queue were active — fresh agent misread as idle | lesson: 3-pointer sync checked every turn (GOALS Status vs CURRENT active vs queue head); contradiction = BLOCKED until reconciled.
- fleet-ops 2026-09-17 | shape-before-upstream | "policy refusal" was request shape (missing stream+SSE prefix), misread as upstream wall for hours | lesson: verify wire shape against official client (tap/sink, 3 curls) BEFORE declaring upstream dead.
- fleet-ops 2026-09-17 | motion-vs-output | 5 loops × ~600 cycles, +3086 log lines, 0 gates, empty git log = motion 100% output 0% | lesson: health = new deliverable bytes outside log with mtime proof; log lines alone never health.
- guardrails G4 | substring-survival | naive plant EXTENDED the needle instead of removing it, gate stayed green | lesson: plants must REMOVE quoted text entirely; passing plant = UNWIRED, file it don't hide it.
- guardrails G8 | prose-without-wrapper | every held specimen is a per-execution verb that throws; prose never held | lesson: a rule not compiled into a throwing check will decay — wire or drop the claim.
- engineering E2 | three-truths | queue.txt/CURRENT.md/GOALS.md diverged, DONE work re-issued | lesson: single-closer atomic promote-on-DONE; rc=0 + zero diff = NO-OP, never failure.
- brain Q23 | crash-after-write | buffered-/tmp-/overwrite writes = total loss on crash | lesson: persist-as-you-go to workspace files, flush each track, adopt-don't-overwrite on crash (verify both sides, disclose gap).

## Live entries (append below, newest last)
- 2026-10-03 | recon | `curl -s $S` with multi-flag string failed under zsh (no SH_WORD_SPLIT; flags passed as one unknown option) | lesson: arrays-or-literal flags for multi-word commands in zsh, never a flags-string variable.
- 2026-10-03 | recon | external fetch attempted with pilot down would have gone direct | lesson: `tor-pilot.sh status --pilot fleet` (then `ready`) precedes ANY external fetch; READY line is the gate, not assumption.
- 2026-10-03 | vendor | `pkill -f "<pattern>"` killed the invoking shell twice (pattern matches own cmdline) → relaunches never happened, silence misread as progress | lesson: kill by explicit PID from `ps`; never pkill -f with a pattern present in your own command.
- 2026-10-04 | course | quiz radio rows split text around a centered dot — global `input{width:100%}` made the radio full-width; served-CSS grep proved it in one step | lesson: every global input rule gets an explicit `[type=radio]/[type=checkbox]` carve-out at write time, not after a screenshot.
- 2026-10-04 | course | `vite build | tail -n 1` hid a crash; restarted server on half-written build → 500s everywhere, misdiagnosed twice as stale chunks | lesson: builds assert `exit=$?` on the PINNED node (v22.23.3) with full log to file; never tail-pipe a build gate, never serve before exit 0.
- 2026-10-04 | course | headless chrome runs without `timeout` never exited → 10 strays, later runs hung | lesson: every headless run wrapped in `timeout`, stray check by PID after; screenshot flakiness falls back to --dump-dom, which never hangs.
- 2026-10-04 | course | `ps aux | grep PATTERN | awk | xargs kill` killed the invoking shell (bracket trick protects grep, not your own cmdline which contains the literal pattern) → 10-min tool timeout | lesson: store server PIDs in a file at start (`echo $! > pidfile`), kill by file; never pattern-kill near your own cmdline.
- 2026-10-04 | course | worked all night off a pasted prompt, missed the ~02:45 CURRENT.md directive grounding headless Chrome | lesson: re-read CURRENT.md (directives section) at every resume; a pasted prompt never overrides a newer loop directive.
