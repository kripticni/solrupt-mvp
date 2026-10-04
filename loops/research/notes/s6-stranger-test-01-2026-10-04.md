# S6 stranger test #1 — protocol (2026-10-04)

Goal: S6 gate item "stranger test #1 passes" (GOALS.md S6). Status at write: S6 technically complete per CURRENT.md, stranger test + gate note pending. This file is the run protocol so any stranger can execute unsupervised.

## Preconditions (read verbatim to subject)
1. Machine has the repo at the S6 gate commit, dependencies installed, no extra setup by the observer.
2. Observer does NOT help except to hand over this sheet and record time + verbatim failures.

## Steps (subject executes, ≤15 min)
1. `verify(session,room,exploit)` on L1 vuln program with known-good exploit → expect GREEN.
2. Same `verify()` with the same exploit vs L1 FIXED program (negative control) → expect FAIL (must fail, logged).
3. Repeat 1–2 for L2 (vuln GREEN, fixed FAIL).
4. Open lab shell (F2.2) → Run the L1 exploit path end-to-end → expect same GREEN as step 1.
5. `curl /health` (or P0.4 equivalent) → expect green; note exact output.

## Pass criteria
- PASS = steps 1–5 all match expected outcomes with zero observer hints.
- Any deviation = FAIL with verbatim quote + exact command + output pasted below. No re-runs until green (S7AI-1 applies by analogy).

## Evidence row (fill, do not reconstruct later)
- date/time: [dopisati]
- subject (anon id): [dopisati]
- commit sha: [dopisati]
- L1 vuln verify cmd+output: [dopisati]
- L1 fixed neg-control cmd+output: [dopisati]
- L2 vuln verify cmd+output: [dopisati]
- L2 fixed neg-control cmd+output: [dopisati]
- lab-shell Run cmd+output: [dopisati]
- /health output: [dopisati]
- hints given (count + verbatim): [dopisati]
- verdict PASS/FAIL + time: [dopisati]

## Note
- Missing goal brief `notes/s6-agent-brief.md` (read miss 2026-10-04, os error 2) — protocol grounded in GOALS.md S6 target + CURRENT.md status instead; brief to be re-pinned by operator.
