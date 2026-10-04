# S6 stranger-test #1 — protocol + result log (2026-10-04)

Scope: `notes/mvp-scope-2026-10-03.md`. S6 gate = honest-test-ready end-to-end (GOALS.md S6).
Freeze: Sun 11:00 code+evidence. Rows from Sat 11:00; failures verbatim.

## Protocol (stranger, 10 min, no help)
1. Open app at <URL TBD — fill before test>.
2. Complete L1 room: read brief → run exploit → observe PASS.
3. Run same exploit vs FIXED build → must FAIL (negative control).
4. Repeat for L2 room.
5. Verbal: "what would you do next?" (1 sentence, verbatim below).

## Result rows
| # | time (UTC) | subject | L1 exploit | L1 neg-control | L2 exploit | L2 neg-control | next-step quote (verbatim) | notes |
|---|------------|---------|------------|----------------|------------|----------------|----------------------------|-------|
| 1 | _pending_ | stranger #1 | _ | _ | _ | _ | _ | _ |

## Verdict lines (append-only)
- 2026-10-04: protocol drafted; test NOT yet run — needs app URL + prebuilt L1/L2 digests.
- 2026-10-04T00:41Z probe: demo :17864 /api/health → 200 (live for stranger test); reviewer :8765 → DOWN (000, gate-blocker per 2026-10-03 verdict — stranger test runs on :17864 regardless).
