# Fleet-ops distilled — rulings that cost real incidents (2026-09)

Source: `/home/aleksic/fleet-ops/` top-level docs + `loops/research/` charter.
Full map in `notes/prior-art-index.md`. Rule: re-read source before citing.

## Architecture (ARCHITECTURE.md)
- One control tool + N independent loops. Loop = read-state → 1 unit work → save → repeat.
  Control tool never edits loop work, never background daemon.
- One-way flow, return-don't-touch. Machine-checked where cheap (read-only paths must
  never spawn/steer — test, not convention).
- Explicit contracts, default-deny isolation. Cross-loop wiring only via filed contract.
- Content over code; pin by content pattern, NEVER line numbers (drifted ~60 lines overnight ×3).
- Fail-safe defaults: missing → `unknown`, never crash. Loud stop only on explicit
  unrecoverable-corruption detection.
- Health = new deliverable bytes outside the log, with mtime proof. Log lines alone
  never health (Q22: liveness ≠ progress).
- Stop only on stall / proven-false premise / scope breach. STOP sentinel: empty file,
  human-plant/remove, polled between cycles, 4-step drain, exit 0.
- Singleton: 1 driver/loop via lockfile; 2nd quits politely (handled, not failure).
  No PID files (go stale).
- Engine-only: bash drivers retired — all execution via contained `fleet run`.
  A live bash driver is a violation: kill + switch.
- Shell only starts things; real logic NEVER in shell (weakest AI surface).

## Guardrails (GUARDRAILS.md)
- Ask in obeyable shape: charter (paths/caps/forbiddens), 1 result/round, verdict-first
  line 1, lineage + fresh re-check, small diffs, persist-as-you-go, explicit non-goals.
- 7 types; only CHECKS-THAT-THROW ever held. Prose-not-compiled-to-throwing-command decays.
- 5-step rehearsal (~5 min, temp-space): clean pass → plant (corrupt/delete/absent, must
  REMOVE text not extend) → observe trip (draft 0 + non-zero, source green) → restore +
  scratch-gone → ledger row. No row = didn't happen. Re-rehearse after every gate edit.
- Duplication = top failure mode (clones 8.3→18% under AI velocity): pinned
  `npx --yes jscpd@5.1.2` invocation, count baselines per surface (never % across
  surfaces), dual thresholds, pre-commit gate, leaf ledger. Consolidate at 3rd sighting.
- Daily: confirm-before-critical; fan-out ≤2 + child-inclusive cost; spawn grant gate
  (objective/tools+boundaries/existing-target/sized-effort); MCP default-off; incidents
  timestamped; full traces shared; sandbox-first; case-before-availability.

## Orchestration (ORCHESTRATION.md + SUBAGENTS.md)
- 6-step turn: pointer → preflight → 1 unit → save immediately → status → repeat.
  Never exit without handoff (queue+log+files let a stranger continue).
- 8 roles only, delegation without `role:` forbidden. Builder never verifies own.
  ONLY closer writes gate + flips Status + commits. Width ≤3, goals close serially.
- Briefs curated (objective/output-format/tools+boundaries/effort S|M|L); builders return
  REF ≤2k tokens, never full transcript. Lead ≤5 hot files; per-leg ≤2k/≤5 files/zero-history.
- Model tiers: lead/closer/gate strong; workers cheap. Reasoning models don't lead.
- Autonomy: plan hours/turn, parallel waves, surface at close or ticketed blocker.
  90-sec check-in turns are defects. Timeouts kill runaways, never shorten legit work.
- Pre-flight: 1 cheap existence check before n≥3 fan-out. Verify N targets exist, fan out
  only to living ones.

## Testing (ARCHITECTURE.md §§pyramid/cadence + DRIFT_CHECKLIST.md)
- Pyramid: unit → integration (scratch /tmp) → e2e parity → conformance → fuzz/stress →
  mutation (≥40% unit kill, 100% trip on tripping class) → live pilot soak.
- Mutation/negative controls are the binding arbiter (19.7% of agent patches passed weak
  suites while semantically wrong). Absent-input ≠ found-nothing — never green.
- Coverage ≥80% branch is informational (finds 0%-branches); assertion-free tests inflate it.
- Cadence: every change (unit+integration+fmt+dup+secret+rehearsal) / nightly (e2e+fuzz+stress)
  / pre-release (full mutation + 24h soak + audit F1–F9 zero waivers + sign-off).

## Failure modes (FAILURE.md + MONITORING.md + FLEET_RAM_AUDIT.md)
- Motion vs output (LAW): 5 loops × ~600 cycles, +3086 log lines, 0 gates, empty git log =
  motion 100% output 0%. Red patterns: breaker-open + error-only turns + null deltas +
  requeue cycling. Thresholds: failstreak climbing + requeue cycling = wall-riding.
- Misdiagnosis as quota: 403/500 non-retryable needs distinct ALERT; dead-air alarm
  (0 transcripts + null delta + alive>N). STATUS `alive` + null delta = NO progress.
- Shape-before-upstream: 2026-09-17 "refusal" was request shape — verify wire via tap/sink
  BEFORE declaring upstream dead.
- Full-history re-reads burned ~1M tokens in one night — verdict-lines-only, always.
- RAM hotspots: whole-file tails, full-log rewrites per line, uncapped capture buffers,
  repeated whole-output transforms, monotonic ledger growth. Bound everything; ring-cap logs.
- Herd oscillation: identical fixed sleeps re-sync lockstep — jitter + backoff.
