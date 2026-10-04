# UX Gap Audit vs Petruci DESIGN_SYSTEM — 2026-10-04

Verdict: NOT COMPLIANT. Compliant: 9. Gaps: 17 (15 blocker, 2 nit).
Scope: DESIGN_SYSTEM §§1-7,10,19,20 vs tokens.css + 10 route files (prompt said 13, repo has 10).
Compliant: token parity 12/12, prism order, verdict top-strip CSS, panel/card geometry, nav sticky+panel, H2 rule, H3 19/600, no webfont/blur/emoji, tabs-absent/modal-deferred correct.

## Findings

blocker | /home/aleksic/spacestation/mvp/apps/web/src/lib/styles/tokens.css:43 | §4 body must be system stack, mono only for code/verdicts | set body font-family to `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`.
blocker | /home/aleksic/spacestation/mvp/apps/web/src/lib/styles/tokens.css:26 | §4 mono stack verbatim includes Liberation Mono | add `Liberation Mono` to `--font-mono`.
blocker | /home/aleksic/spacestation/mvp/apps/web/src/lib/styles/tokens.css:265 | §5 lab cards min 260px columns | change `minmax(280px,1fr)` to `minmax(260px,1fr)`.
blocker | /home/aleksic/spacestation/mvp/apps/web/src/lib/styles/tokens.css:156-173 | §6.1 primary needs 200ms press state, only glow allowed on hover | replace brightness hover with press darkening + `0 8px 32px rgba(20,241,149,.25)` hover glow.
blocker | /home/aleksic/spacestation/mvp/apps/web/src/routes/+page.svelte:1-9 | §10 one gradient per viewport; §3.1 one hero accent max | remove `.rule` prism when `.btn` prism is present (keep button only).
blocker | /home/aleksic/spacestation/mvp/apps/web/src/routes/+page.svelte:8 | §6.1 verbs only; §10/§19 ban generic CTA | rename `Start` to `Run exploit` (or `Open the lab`).
blocker | /home/aleksic/spacestation/mvp/apps/web/src/routes/+layout.svelte:6-11 | §2.3 header lockup is mark + wordmark | inline `design/assets/logo.svg` mark before wordmark text.
blocker | /home/aleksic/spacestation/mvp/apps/web/src/routes/+layout.svelte:15-16 | §6.6 footer is one centered muted line, no sitemap | drop `support` mailto link, keep single muted line.
blocker | /home/aleksic/spacestation/mvp/apps/web/src/routes/rooms/+page.svelte:19-34 | §6.2 never repeat same card grid twice; §19 no identical card rows | make F1-equivalent room full-width lead, remaining tiers compact (asymmetric).
blocker | /home/aleksic/spacestation/mvp/apps/web/src/routes/rooms/[id]/+page.svelte:59-80 | §7.1 nothing above Run except title; order Run→verdict→finding→proof | move nickname/claim below Run, add LIVE badge, side-by-side editor+terminal ≥1024px.
blocker | /home/aleksic/spacestation/mvp/apps/web/src/routes/rooms/[id]/+page.svelte:74-88 | §6.5 terminal is ink mono-14 with timestamps; document `Run = Ctrl+Enter` | render output in `.termbar` with timestamps, add keybinding hint.
blocker | /home/aleksic/spacestation/mvp/apps/web/src/routes/rooms/[id]/+page.svelte:80-88 | §6.3 verdict needs mono 14+, timestamp, negative-control line, top strip only | add timestamp + `negative control: fixed code FAILED the exploit` line.
blocker | /home/aleksic/spacestation/mvp/apps/web/src/routes/finding/+page.svelte:37-42 | §6.3 no green without negative-control line; timestamp always visible | add timestamp + negative-control line to `verdict-pass`.
blocker | /home/aleksic/spacestation/mvp/apps/web/src/routes/finding/+page.svelte:41 | §3.3 verdicts never in muted brightness | change error `p.muted` action to full `--text`.
blocker | /home/aleksic/spacestation/mvp/apps/web/src/routes/proof/[hash]/+page.svelte:85-103 | §6.3 verdict must use banner with 3px top strip; §6.4 proof block hash+copy+re-verify only | replace `.panel.hero-ok` (undefined class) with `.verdict-pass` + timestamp + negative-control note.
blocker | /home/aleksic/spacestation/mvp/apps/web/src/routes/proof/[hash]/+page.svelte:106-125 | §6.4 no scores/ranks on proof block | delete Solver-progress points/rooms-solved from proof page (keep on board only).
nit | /home/aleksic/spacestation/mvp/apps/web/src/routes/board/+page.svelte:16-20 | §20.7 row is mono rank + name + solves + last-active with bottom rules | restyle rows to mono rank line with last-active, add bottom rules.
nit | /home/aleksic/spacestation/mvp/apps/web/src/routes/rooms/[id]/+page.svelte:27-34 | §20.2 every wait shows elapsed timer + cancel past 10s (same in board:7, rooms:9, proof:57) | add mono `Spawning session… 00:03` timer + cancel button.

## Top 5 fixes in build order

1. tokens.css body font → system stack; fix mono stack (unblocks all type verdicts).
2. Verdict banner content rule: timestamp + negative-control line in rooms/[id] + finding (spec §6.3 core lie-check).
3. Lab template order + terminal timestamps + Ctrl+Enter in rooms/[id] (demo script path).
4. Proof page: use real verdict banner, strip scores/points (P2 rule).
5. Header lockup mark + CTA verb `Run exploit` + single-gradient viewport (brand + §10).
