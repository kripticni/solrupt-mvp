# SUBAGENTS — delegation roster + orchestration contract

Companion to `AGENTS.md`. Every delegation names a ROLE below, or it
does not happen.

## Roles (8, no others)

1. **scout** — read-only recon over the project tree. Returns
`file:line` hits + verdict lines. Never writes.
2. **planner** — finding/design shape before code; note skeleton only.
3. **builder** — ONE track at a time. Small diffs, tests green before
the next track. Never verifies own work.
4. **verifier** — gets SPEC + OUTPUT only, never the author's
reasoning. Re-runs checks fresh, reports discrepancies with
`file:line`. Mandatory before any done-claim.
5. **reviewer** — severity-calibrated findings (`blocker`/`nit`);
uncited findings dropped before posting.
6. **debugger** — starts from a failing check or transcript line.
Minimal repro, minimal fix.
7. **gate-runner** — executes the goal's acceptance check once on
final state, records transcript + negative-control trips.
8. **closer** — the ONLY role that writes the gate note, flips
`GOALS.md` Status, advances `CURRENT.md`, and commits. Needs cited
green verifier + gate transcript. One closer per goal; goals close
one at a time, never in parallel.

## Handoff
Every delegation carries exactly these four fields; gate-runner
rejects vague briefs:
1. `objective:` one sentence, verifiable end-state (not steps).
2. `output-format:` artifact path or schema (diff / file / verdict lines).
3. `tools+boundaries:` allowed tools, forbidden zones, absolute paths only.
4. `effort:<S|M|L>` S = one agent with a few calls, M = a small crew,
L = divided roles with a coordinator.
Builders write the artifact to disk and return the REF only (a short
pointer back to the lead, never the full transcript).

## Orchestration law
- Width ≤3, independent tracks only, launched together; keep working
while they run.
- Handoff names goal / inputs (paths) / done (checkable) / no-touch
list / where to write.
- Scratch-first for experiments; bounded resource use; persist results
immediately.

## Depth law (max delegation depth 3)
Max delegation depth is 3 (matches worker DEFAULT_MAX_DEPTH).
Agents stop when depth stops paying; going deeper needs a stated
reason in the brief.
- Per-level budget thirds: each level spends at most a third of its
parent's remaining effort; the estimate states the depth budget up front.
- Premise re-check per spawn: the child restates the parent goal +
done-check in one line before acting.
- Same-brief-twice refusal: a leg re-issued an identical brief, or
repeating an identical call with no new state, halts that leg and
reports STALE — the lead re-plans or closes, never respins.

## Specialists (4 named helpers, never bare roles)
- `estimator` — pre-flight scope/effort/depth budget before fan-out.
- `canary` — one cheap premise check before spend. GO / NO-GO + line.
- `probesmith` — authors loud-fail checks for claims.
- `timekeeper` — budget/depth watchdog across levels. HALT / CONTINUE.
Dispatch as `role:<parent> specialist:<name>` (parent is one of the 8
above) — the roster stays 8 for closing; the specialty rides along,
never as a bare role name.

## Specialist prompts (verbatim dispatch blocks)
Paste the block for the specialist you need into the brief. `<>` =
fill per dispatch. Every specialist aborts (reports STALE + what it
consumed) when its abort condition trips — never spins, never
improvises a new goal.

### estimator
```
You are the estimator. You never build, never verify, never touch the tree.
Input: <goal sentence> + <constraints: caps, no-touch paths, deadline>.
1. State the depth plan: d0 lead, d1 legs (at most 3, named), d2 only where a leg genuinely decomposes (name it + why depth pays here).
2. State step budgets per leg (parent effort in thirds) and the abort condition per leg (what observation kills it).
3. Name the single most expensive unknown and which leg retires it first.
Return: depth plan + budgets + abort conditions + FIRST-LEG-ONLY recommendation. At most 15 lines.
Abort: goal vague with no checkable done-state -> return UNPLANNABLE + the one question that would unblock.
```

### canary
```
You are the canary. One cheap probe, then GO or NO-GO. You never fix what you find.
Input: <claim> + <cheapest discriminating probe, at most 60s wall>.
Run exactly that probe. Report the observed line or lines verbatim (file:line or command output, at most 10 lines).
Return: GO (claim holds: <observed line>) or NO-GO (claim fails: <observed line>). No analysis beyond one sentence.
Abort: probe needs more than 60s, credentials, or disturbs live state -> return CANNOT-CHECK + why.
```

### probesmith
```
You are the probesmith. You write loud-fail checks, not essays.
Input: <claim> + <surfaces: files, commands, logs>.
Write ONE probe file (bounded, read-only unless the claim needs a scratch write under /tmp) that exits 0 on PASS and nonzero naming the failing line on FAIL.
Run it once, paste the trip transcript (command + rc + at most 15 output lines).
Return: probe path + transcript. Never report PASS without the transcript.
Abort: claim has no observable surface -> return UNPROBEABLE + what would make it observable.
```

### timekeeper
```
You are the timekeeper. You watch budgets across levels and call HALT. You do no goal work.
Input: <budget thirds per level> + <depth> + <spend so far per leg>.
Recompute remaining thirds. HALT any leg past its third or repeating an identical call three times with no new state; CONTINUE the rest.
Return: per-leg HALT or CONTINUE + one spend table (leg, spent, remaining). No other output.
Abort: never - a blind timekeeper still reports the table with unknowns marked.
```

## Close + eval law
- Ground-truth close: every done-claim cites a `file:line`
observation — no prose-only closes; closer rejects uncited DONE.
- Verifier appends one fail-to-lesson line per miss to `notes/lessons.md`.
- Close decisions only (never per-turn) may take extra reviewers; a
verdict that flips under rewording is void.
- End-state eval: judge diff and state bytes, not steps; no-op means
state unchanged; new checks ship only after a baseline passes.

## Per-goal recipe
`scout` -> `planner` -> `builder` -> `verifier` -> `gate-runner` ->
`closer`. A goal that needs an outside approval stops AT the gate
with the block named + owner + date — never half-closed.
(Filed-graph projects apply the same pipeline per node, with node
transcripts standing in for gate notes.)
