# Recommendations — ordered, each with owner + done-check (2026-10-03)

## R1. Start the reviewer receiver on :8765 (owner: whoever touches Gitea next, before any PR)
Why: `main` requires the `reviewer-pass` status check + 1 approval; the webhook
target `127.0.0.1:8765/hook` has no listener, so every future PR wedges unmergeable.
Use `~/.config/gitea/reviewer-secret` for the hook secret.
Done-check: `curl 127.0.0.1:8765/hook` answers non-000 → open a trial PR
(`design-doc` → `main`) → `reviewer-pass` posts → merge → close trial with a note.

## R2. Lock S5 by cutting, in writing (owner: operator, before any code)
Why: AGENTS hard rule 1 — no code until lock. The lock is §9 + §11 initials + any
§5 cut dated. S6–S10 builders are otherwise limited to planning (as tonight).
Suggested lock line: "S5 locked <date> — F1–F3 + P0.1–P0.10 + §9/§11 stand as written;
cuts: <none|list>".
Done-check: `GOALS.md` S5 flips to `complete` with a dated gate note same turn.

## R3. Run the bridge canary first thing in S6 (owner: S6 builder, Diff 2)
Why: TS↔Rust is the only unproven mechanism (scope §11 PROPOSED, review BLOCKER 1).
A 60s hello-world through `node-litesvm` in Node 22 + Docker base retires the
biggest Saturday risk before any verifier code exists.
Done-check: GO/NO-GO transcript in the S6 gate note; fallback pre-approved, no debate.

## R4. Merge `design-doc` surgically, never wholesale (owner: S9 closer)
Why: the branch mixes keepers (`design/`: doc + system + pitch + context) with
reference-only (`page/`: plain Vite, not SvelteKit; `SESSION_2026-10-03.md`: personal log).
Suggested: squash-merge `design/` into `main` at S9 close; leave `page/` + session log
on the branch as reference. Keep Petruci as author (do not rewrite history).
Done-check: `main` has `design/*` with original authorship; `page/` absent from `main`.

## R5. Keep evidence mechanical from 11:00 Sat (owner: every goal from S6 on)
Why: EVIDENCE > CLAIMS is the rubric hinge; Sunday reconstruction is forbidden.
P0.6 rows (hypothesis → command → rc → verbatim out → verdict → next) start at sprint
start, failures verbatim, negative/null results kept transparently.
Done-check: `notes/evidence-<date>.md` non-empty before Sunday; closer cites row lines.

## R6. Protect the license boundary as a gate, not a memory (owner: S6 + S10 closers)
Why: one vendored file from Neodyme/sealevel/Ackee/Mysten/Kiinzu poisons the H02
disclosure (pack item 4). Memory fails under velocity; a grep gate does not.
Done-check: S6/S10 gate notes each contain the unlicensed-path grep transcript (zero hits).

## R7. Rehearse the freeze before it matters (owner: S8 closer)
Why: post-11:00 rules are strict (formatting/AV/packaging/rehearsal only; any fix =
new tag + re-seed + re-test + one log line). A team that has never practiced the
tag-seed-test line will fumble it under jury pressure.
Done-check: one dry-run freeze drill Saturday evening (tag + snapshot + one-line log).
