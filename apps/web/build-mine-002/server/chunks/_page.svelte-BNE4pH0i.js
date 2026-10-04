import { h as html } from './html-FW6Ia4bL.js';

function _page($$renderer) {
  const icons = {
    play: '<path d="M8 5v14l11-7z" />',
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" /><path d="M9.5 12l2 2 3.5-4" />',
    terminal: '<path d="M4 17l6-5-6-5" /><path d="M12 19h8" />',
    proof: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5" /><path d="M9 14l2 2 4-4" />',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />',
    arrow: '<path d="M5 12h14" /><path d="M13 6l6 6-6 6" />'
  };
  function icon(name) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? ""}</svg>`;
  }
  $$renderer.push(`<div class="hero"><p><img class="hero-mark" src="/logo.svg" alt=""/></p> <p><span class="badge">Solana-only</span> <span class="badge">● L1 + L2 live</span> <span class="badge">LiteSVM verified</span> <span class="badge">MIT-licensed labs</span></p> <h1>Break real Solana programs in your browser. Prove it with a link.</h1> <p class="lead">No setup, no wallet, no toolchain. Run a guided missing-signer exploit against a
		real program, watch the chain state move, and walk away with a proof URL a
		stranger can re-run: hints, attempts and all.</p> <p><a class="btn" href="/rooms/l1-signer">${html(icon("play"))} Run your first exploit</a> <a class="btn-ghost" href="/learn">How it works</a></p> <p class="muted">Free forever. Your first verdict lands in under a minute.</p></div> <div class="termwin" aria-label="Sample verified run"><div class="termbar"><div><span class="muted">$ session claimed (jovan) · room l1-signer · 900s TTL</span></div> <div><span class="muted">$ run exploit: withdraw_insecure, unsigned, 10000000 lamports</span></div> <div><span class="ok">[PASS] vault 100000000 -> 90000000 (attacker gained 10000000)</span></div> <div>negative control: fixed code FAILED the exploit (good)</div> <div><span class="muted">proof: /proof/126b48f1…c15380 · re-runnable from the URL alone</span></div></div></div> <h2 id="how">How it works</h2> <div class="steps"><div class="panel"><h3>${html(icon("terminal"))} 1. Learn</h3> <p class="muted">5-minute lessons: accounts, signers, owners, CPI. Each one ends in a room.</p> <p><a href="/learn">Open the path ${html(icon("arrow"))}</a></p></div> <div class="panel"><h3>${html(icon("lock"))} 2. Hack</h3> <p class="muted">Vuln vs fixed side by side. One Run button, state verdict, staged hints.</p> <p><a href="/rooms">Open the rooms ${html(icon("arrow"))}</a></p></div> <div class="panel"><h3>${html(icon("proof"))} 3. Prove</h3> <p class="muted">Write the finding, mint the proof URL. A stranger re-verifies it alone.</p> <p><a href="/board">See the board ${html(icon("arrow"))}</a></p></div></div> <div class="panel hero-ok"><h3>${html(icon("shield"))} Why judges and employers trust it</h3> <p>The verdict reads on-chain account state, never log text. Every pass ships
		with its negative control: the same exploit run against the fixed program,
		which must refuse. Attempts, hints and timestamps are baked into the proof
		hash. Nothing to take on faith.</p> <p><a class="btn-ghost" href="/rooms/l1-signer">${html(icon("play"))} Run your first exploit</a></p></div>`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BNE4pH0i.js.map
