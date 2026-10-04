# UX Lab Patterns — premium CTF/lab pages (2026-10-04)

Scope: layout order, editor+terminal, verdict, hints, progress, empty/loading/error. Our ref: `mvp/apps/web/src/routes/rooms/[id]/+page.svelte` (title → tier/pts → locked banner → target vault/authority → vuln/fixed `<pre>` → nickname+claim → exploit `<textarea>` → Run → verdict-pass/fail + state_diff/logs/reason/action → hints 0/3).

## Verdict — best 5 (WHERE seen)
1. Dual-path Build/Deploy/Test: buttons + terminal equivalence — Solana Playground (Anchor/SolPG docs).
2. Split-screen task + machine with inline Q&A checklist — TryHackMe rooms.
3. Top progress bar + SPAWN TARGET → flag submit loop — HackTheBox Academy.
4. Prompt + contracts + executable test as verdict (`forge test --mp`) — Damn Vulnerable DeFi.
5. Empty/error-state discipline: one CTA, typed variants, copyable request ID — Vercel Geist + Linear.

## P1 — SolPG dual-path actions
- What: left-panel `Build`/`Deploy`/`Test` buttons mirror terminal `build`/`deploy`/`test`.
- Why premium: discoverable for novices, fast for experts; no mode confusion.
- Cost: M (wire existing Run to button + shortcut, echo command in log).
- H02-fit: yes — add Run/Reset/Clear buttons mirroring API + show invoked command.
- Seen: https://www.anchor-lang.com/docs/quickstart/solpg — "Alternatively, you can also use the `Build` and `Deploy` buttons on the left-side panel."

## P2 — THM split-screen + task checklist
- What: "Start Lab Machine" split view (upper-right) + sequential Task 1..N with "Answer the questions below".
- Why premium: context never scrolls away; checklist = progress without dashboard hop.
- Cost: M (sticky target header + task anchor list; full split-view = L, defer).
- H02-fit: yes — sticky victim-target bar + vuln/fixed/exploit anchor checklist.
- Seen: https://tryhackme.com/room/retracted — "Start the lab machine in split-screen view by clicking on the green "Start Lab Machine" button on the upper right section of this task."

## P3 — HTB progress + SPAWN TARGET loop
- What: top progress bar + `SPAWN TARGET` → IP → submit flags/answers per section.
- Why premium: always know completion % and env state; spawn makes backend latency explicit.
- Cost: S (top progress steps + env-status pill: Locked/Building/Live + attempts_used).
- H02-fit: yes — we already have `live`/`attempts_used`; surface as header pill + steps.
- Seen: https://enterprise-help.hackthebox.com/en/articles/12910196-academy-lab-users-guide — "Progress Bar: Positioned at the very top of your workspace to log your active completion metrics."

## P4 — DVD prompt/contracts/test verdict
- What: each challenge = prompt README + contracts + Foundry test; pass = `forge test` green.
- Why premium: verdict is mechanical and reproducible; no ambiguous prose grading.
- Cost: S (keep our verdict object; add seed/target + replay command next to PASS/FAIL).
- H02-fit: yes — append `state_diff` + "replay: session/target" line already half-present.
- Seen: https://github.com/theredguild/damn-vulnerable-defi — "Try your solution with `forge test --mp test/ /.t.sol`."

## P5 — Vercel/Linear empty-error discipline
- What: typed empty states (no-results/blank-slate/cleared/permission/error), max 1–2 CTAs, error = copyable request ID + Try Again; Linear empty views each offer one action.
- Why premium: blank screens teach instead of confusing; errors stay actionable.
- Cost: S (copy + component rules, no backend).
- H02-fit: yes — fix our silent `{#if detail}` blank: loading skeleton, locked, fail-with-next.
- Seen: https://vercel.com/geist/empty-state — "Error variant pairs the body with a copyable request ID and a `Try Again` button."
- Seen: https://www.shaheermalik.com/blog/linear-onboarding-ux-design-case-study — "Each empty view explains what belongs there and offers the one action to fill it, turning a blank screen into a gentle prompt."

## P6 — Ethernaut level-as-contract
- What: "each level is a contract to hack"; Get New Instance → hack in wallet → Submit; any order, infinite levels.
- Why premium: mental model is one sentence; instance-per-player kills shared-state flakiness.
- Cost: L (per-session instance infra; we already do per-session vault — keep metaphor).
- H02-fit: partial — copy the one-sentence framing + per-session target; skip wallet flow.
- Seen: https://github.com/OpenZeppelin/ethernaut — "Each level is a smart contract that needs to be 'hacked'."

## P7 — Secureum RACE timed single-attempt quiz
- What: "single attempt, 8 questions, 16 minutes", no back-navigation (hints leak forward).
- Why premium: tension + anti-spoiler ordering; severity-matrix reasoning over trivia.
- Cost: L (timer/lock infra; anti-fit for learning lab).
- H02-fit: no — H02 is untimed builder lab; borrow only severity-labeled verdicts.
- Seen: https://ventral.digital/posts/2025/2/14/race-37-of-the-secureum-bootcamp-epoch-infinity/ — "Participants of this quiz had a single attempt to answer 8 questions within the strict time limit of 16 minutes."

## P8 — Updraft career-track reinforcement
- What: tracks + "real-world projects, exercises, and quizzes reinforce learning" + credentials.
- Why premium: progress persists across labs; skills gap visible.
- Cost: L (accounts/tracks/creds; out of H02 scope).
- H02-fit: no — H02 needs single-room polish first; revisit post-H02.
- Seen: https://updraft.cyfrin.io/ — "Real-world projects, exercises, and quizzes reinforce learning."

## Highest-leverage 3 for OUR lab page
1. Sticky verdict-first header (P3+P4): env pill (Locked/Building/Live) + PASS/FAIL banner pinned under title with Next action (fail → relevant hint/diff; pass → Write finding). Kills scroll-hunting.
2. Dual-path Run (P1): prominent Run + Reset buttons echoing the exact API/test command in the log; keeps textarea workflow but adds SolPG discoverability for ~M cost.
3. Typed empty/loading/error states (P5): skeleton while `detail==null`, explicit Locked panel, fail panel with reason + Try Again + Hint n/3. Biggest current gap is silent blank before fetch resolves.
