# S11 improvement backlog — rubric-driven, frontend/UI/UX first (operator ordered 2026-10-04)

Scoring reality (H02-RUB-H01-100): Tech&UX 25 · Impact 25 · Feasibility 20 ·
Pitch 15 · Teamwork 15. EVIDENCE > CLAIMS decides ties. Work top-down; each
item = one small diff, screenshot-proven, logged. Items needing humans/secrets
stay in S7/S8/S9 gates — everything here is buildable alone.

## UX/UI 25pts — the money section (UX_PREMIUM §§4–8 + round-2 audit)
1. Lab side-by-side ≥1024px (editor | terminal, §7.1 asks, we ship stacked) +
   sticky victim-target bar (THM lesson: context never scrolls away).
2. Lesson prose styling: `.prose` headings/fences/callouts (Wormhole one-liner
   as callout) + prev/next + "Open the room" continuity on 101/102.
3. Terminal typing effect per motion note (capped, skippable, ≤450ms budget).
4. 360px mobile pass: screenshot EVERY route, fix overflow, keep shots.
5. Focus-visible audit: keyboard-only Tab nav→Run→verdict, rings everywhere.
6. Empty states with teeth: zero-solve board, no-session lab, empty search —
   typed, one CTA each (Vercel/Linear discipline).
7. Print stylesheet for `/proof/[hash]` (white/black — judges print proofs).
8. `prefers-reduced-motion` emulation screenshots (instant swaps proven).
9. Hero round 2: only if 1–8 are green (density without clutter, keep single
   gradient, no new sections that need endpoints).

## Live-demo robustness (what saves the 4 minutes)
10. Offline bundle assembly (16 Track A): frozen transcript from
    `notes/evidence-2026-10-04.md` + local LiteSVM run recipe, zero net.
11. Re-verify drill script: the exact click-path for the jury re-verify
    (proof URL → Re-verify → PASS on camera), timed, no debugging on stage.
12. Failure choreography: every error path screenshotted once (expired session,
    wrong vault, unbuilt room) — each names an action, none dumps a stack.

## Feasibility 20pts — prove it ships
13. `docker build` locally (direct net authorized, logged): bytes + seconds;
    run it: `/health` + seed + L1+L2 e2e inside container net. Transcript kept.
14. `docker-compose.yml` (local only): up → green → down, one command.
15. CI gates executed locally from clean checkout (fmt/clippy/cargo, check/test/
    stylelint, banned-grep, import-lint, jscpd, unlicensed-grep) — log each.
16. jscpd baselines per surface recorded (never % across surfaces).
17. Disk-headroom guard: `df -h /home` before build-heavy turns; >90% → clear
    ONLY regenerable caches (npm/pip/pnpm, /tmp); never toolchains, never data.

## Evidence chain (feeds Impact 25 + Teamwork 15)
18. Evidence README skeleton (user→problem→proof-vs-hypothesis→test→result→
    changes→limits→next test): measured rows only, `[dopisati]` elsewhere.
19. VENDOR_NOTICES completion + unlicensed-grep transcript in the note.
20. Verdict-first LOOP_LOG discipline kept every turn (the teamwork score is
    literally this trail).

## Done rule
S11 closes only when every item is landed + logged, or moved to a dated gate
with a named owner. Until then it stays `pending` — that is what keeps the
worker running indefinitely.
