# Prior-art index — where the loop's rules came from (read-only, extend-don't-remine)

Scope policy (operator 2026-10-03): this tree saves ONLY fleet-ops + agent-engineering /
agent-guardrails / brain-as-llm principles + H02 work. No content from unrelated
projects (reopencode, game loops, infra loops, other ideas dirs) — neither copied
nor indexed. Pointers below are read-only; the sources themselves are never written.
ARCHITECTURE_PROFILE canonical copies (byte-identical, md5-verified 2026-10-03):
`/home/aleksic/ideas/ARCHITECTURE_PROFILE.md` = `/home/aleksic/ideas-reeval-20260823/ARCHITECTURE_PROFILE.md` =
`web3-security-platform/ARCHITECTURE_PROFILE.md` (in-tree copy).

Every rule in `AGENTS.md`/`SUBAGENTS.md` traces to one of these. When a rule feels wrong,
re-read its source BEFORE changing it — most were paid for with real incidents.
Cite lineage (`extends <source>`) + NEW evidence for any adoption. Never quote from memory.

## Architecture law (binding on every structural decision)
- `/home/aleksic/ideas/ARCHITECTURE_PROFILE.md` — prime directive (least bugs), one-way
  deps return-don't-touch, orthogonal axes, explicit contracts, data>code, fail-safe
  defaults, verify-mechanically, determinism-when-it-pays, full-suite-tiers, debuggability,
  markdown-state, copy-mutate-then-consolidate, maintained-libs, honest non-claims.
  Decision table (§4): effort tiers, graceful-default vs crash-on-corruption, YAML>JSON,
  git-mandatory, sync-first, planning-always, project-chooses-language.
- `/home/aleksic/opencode.d/STYLE_GUIDE.md` — per-language conventions + operative
  architecture principles copy.

## Fleet-ops (loop science + fleet tooling) — distilled in `fleet-ops-distilled.md`
- `/home/aleksic/fleet-ops/ARCHITECTURE.md` — control-tool vs loops, one-way flow,
  content-over-code, fail-safe defaults, health=deliverable-bytes, STOP sentinel,
  singleton locks, driver contract, engine-only order, testing pyramid, mutation floors.
- `/home/aleksic/fleet-ops/GUARDRAILS.md` — 7 guardrail types, 5-step rehearsal,
  duplication recipe, daily rules, done-checklist.
- `/home/aleksic/fleet-ops/ORCHESTRATION.md` — 6-step turn, fan-out waves, 8-role roster,
  joint record, human-only actions.
- `/home/aleksic/fleet-ops/MONITORING.md` — motion-vs-output law, 5 output proofs,
  HISTORICAL marking.
- `/home/aleksic/fleet-ops/FAILURE.md` — The Wall (2026-09-17), misdiagnosis-as-quota,
  shape-before-upstream, secondary defects C1–C12.
- `/home/aleksic/fleet-ops/loops/research/AGENTS.md` — LOG-SIGNAL BUDGET (copied here),
  autonomy + pre-flight orders.
- `/home/aleksic/fleet-ops/loops/research/SUBAGENTS.md` — orchestrator playbook, depth
  thirds, model tiers (lead strong / workers cheap), specialist prompts.

## Agent-engineering (LLM interfacing) — distilled in `agent-corpus-distilled.md`
- `.../agent-engineering/loops/research/AGENTS.md` — queue-driven E-series, gate method.
- `.../notes/e1-goal-mechanics.md` + `fixes/e1/rotation-contract.md` — three-truths fix,
  single-closer atomic promote-on-DONE, NO-OP law.
- `.../notes/e2-small-loop-hygiene.md` — status-field law, infinite-goal ban.
- `.../notes/e3-log-signal.md` — measured 35–100× savings from dedup; 15KB cap origin.
- `.../notes/e4-orchestration.md` — role-less delegation banned (643-repetition specimen).
- `.../notes/fixes/e5/e5-deltas.md` — handoff v2, spill format, end-state eval.
- `.../notes/e5-delta-supplement-2026-09-16.md` — external deltas (Cognition, Claude
  best-practices, SWE-agent ACI, description budgets).
- `.../notes/e6-master-fix-architecture.md` — ordered apply (prompts → mechanics → gates),
  canary one loop at a time, R0 tag + revert.
- `.../notes/e13-delegation-grants.md` — spawn grant matrix (ported to SUBAGENTS.md).
- `.../notes/e8-depth-measurement.md` + `fixes/e4/agents-one-line-patch.md` — depth law,
  one-line-patch specimen.

## Agent-guardrails (what holds under pressure) — distilled in `agent-corpus-distilled.md`
- `.../agent-guardrails/notes/findings/2026-09-06-g1-guardrail-taxonomy.md` — 7 classes;
  prose never held.
- `.../2026-09-06-g2-must-fail-rehearsal.md` — wired iff plant trips on demand.
- `.../2026-09-06-g3-ranked-code-quality-levers.md` — dup-gate > verify-gate >
  negative-controls > spec-first thresholds > small diffs > merge-readiness.
- `.../2026-09-07-g4-duplication-policing.md` — pinned invocation + count baselines +
  dual thresholds + pre-commit gate + leaf ledger.
- `.../2026-09-07-g5-orchestration-patterns.md` — queue vs CURRENT routing, premise probe
  before fan-out, adopt-don't-overwrite.
- `.../2026-09-07-g6-negative-controls-mutation.md` — 6-element mutation ritual.
- `.../2026-09-07-g7-external-evidence-guardrails.md` — adopt-table for merit review.
- `.../2026-09-09-g8-guardrail-decay-modes.md` — 6 decay paths + detectors.
- `.../2026-09-09-g9-envelope-wiring.md` — resource envelope, fail-closed.
- `.../2026-09-09-g10-sentinel-vocabulary-wiring.md` — STOP + death_class taxonomy.
- `.../2026-09-09-g11-rehearsal-schedule.md` + `.../2026-09-09-g12-rehearsal-plant-rotation.md`
- `.../2026-09-10-g13-token-blind-vs-zero-honesty.md` — blind never green-zero.
- `.../2026-09-10-g15-generation-match-wiring.md` — live-vs-fd self-md5 staleness check.

## Brain-as-llm (cognition foundation, READ-ONLY, never write)
- `/home/aleksic/ideas/brain-as-llm/notes/findings/2026-08-28-q16-policy-setter-compile.md` —
  law survives iff compiled to a per-execution throwing check.
- `/home/aleksic/ideas/brain-as-llm/notes/findings/2026-08-28-q17-verification-asymmetry.md` —
  machine wins byte-anchored checks; vocabulary-bounded coverage is the human edge.
- `/home/aleksic/ideas/brain-as-llm/notes/findings/2026-08-28-q23-crash-after-write-forensic-resume.md` —
  crash-after-write:
  remaining work is forensic adoption; /tmp/buffered/overwrite = total loss.
- `/home/aleksic/ideas/brain-as-llm/notes/findings/2026-08-28-q29-human-brain-vs-llm-memory.md` —
  persist frequently before compaction/death.
- `/home/aleksic/ideas/brain-as-llm/notes/findings/2026-08-29-q33-external-memory-as-authority.md` —
  authority is audit (header+SHA+provenance+stat+absence+two-sided re-read), never the file.
- `/home/aleksic/ideas/brain-as-llm/notes/findings/2026-08-30-q66-premise-provenance-audit-before-fanout.md`

## This repo's own distilled knowledge
- `notes/fleet-ops-distilled.md` + `notes/agent-corpus-distilled.md` — compressed rulings.
- `notes/lessons.md` — episodic fail→lesson (append per miss; promote after 2+ hits).
- `notes/session-handoff-2026-10-03.md` — what the hardening session did vs pre-existing.
- `web3-security-platform/17-architecture-review.md` — Solana arch review + open risks.
