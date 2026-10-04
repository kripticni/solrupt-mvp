# UX motion + sound ceiling — dark dev web app (SvelteKit)

Date: 2026-10-04. Status: scout note. All params mutable; sound OFF by default.

## Verdict-first: the budget

- SHIP (small, fast, skippable): fade-only page transitions, 1-step button press
  states, 3-step verdict reveal, capped terminal typing, Web Audio blips.
- Motion ceiling: any single interaction resolves in <=400 ms; verdict
  sequence <=600 ms total; no loops, no parallax, no layout-shift animation.
- Sound ceiling: no assets, oscillators only; every cue <=150 ms, peak
  <=-18 dBFS; OFF by default behind an opt-in toggle; never before first gesture.
- Taste rule: motion confirms state that already changed, never announces the
  app itself. If removing it loses no information, it ships. If it draws
  attention to itself, it is cut.

## Allowed list (exact params, all mutable)

- Page transition: `opacity` only, 150 ms, `ease-out`, no slide/scale. Under
  `prefers-reduced-motion: reduce`: 0 ms (instant swap).
- Button press: `:active` scale 0.97 + brightness +10%, 100 ms `ease-out`;
  focus-visible ring always instant (no animation on the ring).
- Verdict reveal: 3 stages, 150 ms each (badge fade-in -> score count-up ->
  border tint), `ease-out`, total <=450 ms; count-up snaps to final on reduce.
- Terminal typing: max 30 chars/s, max 120 chars per block, `Skip` button; under
  reduce: full text renders instantly, cursor static.
- Sounds (after opt-in + first click only): pass = sine 660->880 Hz, 120 ms;
  fail = triangle 220->160 Hz, 150 ms; hint/click = square 1200 Hz, 40 ms at
  -24 dBFS. Master gain <=-18 dBFS peak, no overlap stacking (debounce 100 ms).
- Toggles: `sound: off` default in settings + persisted; `motion: full|reduced`
  follows OS by default via `matchMedia('(prefers-reduced-motion: reduce)')`.
- Easing allowlist only: `ease-out`, `linear` (typing/counters). No spring,
  bounce, or `ease-in` on entrances (reads as lag).

## Ban list (cheap / AI-slop)

- Gradient text (esp. purple-blue): unreadable on dark, instant template look.
- Glassmorphism (blur + translucency everywhere): muddy contrast, perf cost.
- Mascot / emoji guide character: fights the terminal-developer register.
- Particle canvas / animated starfields: GPU noise behind reading surfaces.
- Autoplay background music or ambient loops: violates gesture policy + trust.
- Full-page typewriter for body copy: slow, unskippable, breaks screen readers.
- Spring/bounce verdict animations: celebration physics for pass/fail misreads.

## Implementation sketch (5 lines, no new deps)

1. `actions/motion.ts`: Svelte action `reduced(node)` — reads matchMedia, sets
2. `lib/sfx.ts`: lazy `AudioContext` (created on first toggle/click only),
3. `+layout.svelte`: wraps pages in `fade({duration:150})`; wrapped in
4. Verdict component: CSS classes staged via `setTimeout(150)` chain; counter
5. Settings store: `{ sound:false, motion:'auto' }` persisted to localStorage;

## Sources (verbatim quotes)

- Autoplay (https://developer.chrome.com/blog/autoplay/): "If an
  AudioContext is created before the document receives a user gesture, it will
  be created in the 'suspended' state, and you will need to call resume() after
  the user gesture." / "Autoplay with sound is allowed if: The user has
  interacted with the domain (click, tap, etc.)."
- Reduced motion (https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion):
  "is used to detect if a user has enabled a setting on their device to
  minimize the amount of non-essential motion."
