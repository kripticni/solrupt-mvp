# Done-checklist (run before any DONE claim — adapted from fleet-ops GUARDRAILS §6 for H02)

Copy this block into the gate note, check each box with its evidence line.

- [ ] Verdict first, lineage + fresh re-checks cited with `file:line`?
- [ ] Small diff, touched harnesses re-proven live (`pytest`/`cargo test` re-run AFTER the touch), noise reverted?
- [ ] Negative control tripped: exploit-vs-fixed MUST fail, transcript attached (S6 load-bearing; no green without it)?
- [ ] Guard rehearsed (S6/S8): clean PASS → plant (corrupt/delete/absent, removes text) → trip non-zero naming miss → restore → ledger line; non-tripped classes listed?
- [ ] Duplication: `jscpd` pinned invocation run on stated surface, count at/below baseline, leaves ledgered?
- [ ] State persisted in workspace (not temp-only), premise probed before fan-out, skeleton written before compute, crashes disclosed as gaps?
- [ ] Coverage on changed logic, no new 0%-branch unexplained (informational; mutation kill floor stays arbiter for verifier crate)?
- [ ] Privileged paths (server-side solver/flag, session TTL/reaper, per-IP caps) have unauthorized-caller refusal probes?
- [ ] Evidence rows carry exact commands + outputs (P0.6 logger); failures verbatim, never re-run-until-green (S7 bar 3/5 stands on first runs)?
- [ ] Freeze rules honored: post-19:00 Sat no scope adds; post-11:00 Sun formatting/AV/packaging only, any fix = new tag + re-seed + re-test + one log line?

Non-goals stated (what this gate does NOT claim, what it does NOT cover):
