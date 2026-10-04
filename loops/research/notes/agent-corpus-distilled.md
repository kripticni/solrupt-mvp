# Agent corpus distilled — agentic-engineering rulings (2026-09)

Sources: `/home/aleksic/ideas/agent-engineering/`, `/home/aleksic/ideas/agent-guardrails/`,
`/home/aleksic/ideas/brain-as-llm/` (read-only). Full map in `notes/prior-art-index.md`.

## Ranked code-quality levers (guardrails-G3 — strongest ordering evidence available)
1. Duplication gate > 2. verification gate on final code > 3. negative controls >
4. spec-first pre-registered thresholds > 5. small diffs + merit review >
6. merge-readiness over test-passing (METR: ~half test-passing patches unmergeable) >
7. comprehension-preserving use. Benchmark pass rate LAST. Apply in this order when short on time.

## Prompting (agent-engineering roles + briefs)
- Role-less delegation forbidden — every dispatch `role:scout|planner|builder|verifier|
  reviewer|debugger|gate-runner|closer` + 4-field handoff. Generic "launch subagents
  freely" produced 643 repetitions of the same failure (E4 specimen).
- Briefs curated: objective/output-format/tools+boundaries(absolute paths)/effort S|M|L.
  Builders write artifact + return REF only (no telephone game). Worker legs read-only,
  cheap models for search.
- Pointer-small: role table lives ONLY in SUBAGENTS.md, one line in AGENTS.md.
- Verdict-first line 1 + repeated at bottom for long notes (attention U-curve).
- Eval: judge end-state bytes not steps; no-op = unchanged; framing-resistance probe
  (order/verbosity swap voids flip); N-vote only for CLOSE.
- External grounding: ≥5 live sources per goal (E5 ran ≥20); a finding with zero
  live-fetched sources is a draft, never gated. Every claim needs a verbatim quote or
  a fleet measurement — no vibes-engineering.
- ACI lesson (SWE-agent arXiv:2405.15793): scoped tools + absolute paths shape behavior
  MORE than prompt wording. Fix the interface before rewording the prompt.

## Context management
- Hygiene law: small single-purpose files; signatures-over-bodies; markdown pointers get
  deliberate pruning/archival or they rot; content stays in data files.
- Log-signal budget (measured 35–100× savings): verdict block ≤5 lines fixed tokens;
  round ≤15KB overflow→spill file + pointer; 3rd+ identical → `repeat xN`;
  `.sweep-last` rewritten every turn; 4th silent Clear → STALE-ESCALATE; greppability
  proven with the parsers' own regexes.
- Memory: spill (`summary/kept/discarded+why/recall-check`) — CURRENT/queue hot, spills
  cold; `lessons.md` episodic fail→lesson → semantic skills after 2+ hits; librarian
  curates/prunes. Effective-context-engineering: attention budget, JIT pointers,
  1–2k subagent summaries, 3–10 steps per leg, description budgets.
- Brain foundation: LLM = file-tree hippocampus without sleep — persist FREQUENTLY
  before compaction/death. Authority is AUDIT (header+SHA+provenance+stat+absence+
  two-sided re-read), never the file. Crash-after-write: buffered//tmp/overwrite =
  total loss; remaining work is forensic adoption (verify artifacts + rebuild registry).

## Guardrails that hold (guardrails-G1/G2/G4/G6/G8–G13)
- Taxonomy: 7 classes; EVERY held specimen is a per-execution verb that throws.
  Prose-without-wrapper is the #1 decay path.
- Wired iff plant trips on demand (PASS→FAIL→PASS recorded). Plants REMOVE the needle,
  never extend it (substring-survival lesson).
- Duplication holds iff pinned invocation + count-baseline on stated surface +
  pre-commit consolidation + documented leaves + retrigger. Totals across surfaces
  never comparable. Dual thresholds: loose-only = review candidate, strict-survivor =
  consolidate. One probe collapsed 4 flags → 1 with zero code change (thresholds decide).
- Negative controls (6 elements): clean PASS + planted trip per class + non-claim ledger +
  hash-identical restore + arbiter selftest + fail-closed (missing → exit 2, never green).
- Decay (6 paths): prose-without-wrapper, unwired sentinel, vocabulary drift (hook watches
  quota subset), stale evidence (needs HISTORICAL marker), rehearsal-never-rerun,
  registry lag. Detectors exist as probes — run them.
- Compiled wiring reference: envelope (ulimit in turn-subshell only + TIMEOUT vs HEAVY_OP
  disambiguation), sentinel (STOP poll + death_class taxonomy), rehearsal (every N=10 +
  plant rotation), token honesty (blind→null/unknown, never 0), generation-match
  (live-vs-self md5 staleness), restart seam (exit 75, consumed request).
- External adopt-table: confirm-before-critical, incident-log SLA, share-full-traces
  linear-default, sandbox-then-guardrails, safety-case-before-availability,
  50%-horizon autonomy ceiling (split + human review beyond it).

## Loop mechanics (engineering-E1/E2 + guardrails-G5)
- Disease: queue.txt/CURRENT.md/GOALS.md three truths, no atomic closer → re-issues DONE
  work. Fix: single-closer atomic promote-on-DONE; rc=0 + zero diff = NO-OP (never failure);
  infra-vs-goal classes (cap-hit parks, never burns requeues); gate-GO protocol.
- Routing holds iff next work computable from bytes without asking (queue-first-unchecked
  or CURRENT-first-pending). Advance rule: no re-verify without new evidence.
- Gate fan-out with ONE premise probe before n≥3; persist-as-you-go (flush each track,
  skeleton-before-compute); inline fallback on provider death; adopt-don't-overwrite
  (12 crash-after-write specimens); contention `ceil(n/2)` waves under jobs≤2.
- Depth default 3 + doom guard; deeper needs stated reason. Breadth alert (>10 subs).
- Specialist future (E13): role×grants table + pre-dispatch checker — brief missing a
  grant rejected before spawn (ported here as the spawn grant gate).
- Master-fix order (E6): R0 tag → prompts → mechanics → gates last; canary one loop at
  a time; rollback = revert; blameless note per rollback.
