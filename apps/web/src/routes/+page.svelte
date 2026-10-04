<script lang="ts">
	const icons: Record<string, string> = {
		play: '<path d="M8 5v14l11-7z" />',
		shield:
			'<path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" /><path d="M9.5 12l2 2 3.5-4" />',
		terminal: '<path d="M4 17l6-5-6-5" /><path d="M12 19h8" />',
		proof:
			'<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5" /><path d="M9 14l2 2 4-4" />',
		lock: '<rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />',
		arrow: '<path d="M5 12h14" /><path d="M13 6l6 6-6 6" />'
	};

	function icon(name: string): string {
		return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? ""}</svg>`;
	}

	// Live room count (existing /api/rooms, same $effect pattern as the rooms
	// page, no new endpoint). Null until the fetch resolves so the badge
	// never prints a stale number.
	let liveCount: number | null = $state(null);
	$effect(() => {
		fetch("/api/rooms")
			.then((r) => r.json())
			.then((j) => {
				const rooms = Array.isArray(j.rooms) ? j.rooms : [];
				liveCount = rooms.filter((r: { live?: boolean }) => r.live).length;
			})
			.catch(() => (liveCount = null));
	});
</script>

<div class="hero">
	<p><img class="hero-mark" src="/logo.svg" alt="" /></p>
	<p>
		<span class="badge">Solana only</span>
		<span class="badge">● {liveCount === null ? "live rooms" : `${liveCount} live rooms`}</span>
		<span class="badge">LiteSVM verified</span>
		<span class="badge">MIT licensed labs</span>
	</p>
	<h1>Break real Solana programs in your browser. Prove&nbsp;it with a link.</h1>
	<p class="lead">
		No setup, no wallet, no toolchain. Run a guided missing signer exploit against a
		real program, watch the chain state move, and walk away with a proof URL a
		stranger can run again: hints, attempts and all.
	</p>
	<p>
		<a class="btn" href="/rooms/l1-signer">{@html icon("play")} Run your first exploit</a>
		<a class="btn-ghost" href="#how">How it works</a>
	</p>
	<p class="muted">Free forever. Your first verdict lands in under a minute.</p>
</div>

<div class="termwin" aria-label="Sample verified run">
	<div class="termbar">
		<div><span class="muted">$ session claimed (jovan) · room l1-signer · 900s TTL</span></div>
		<div><span class="muted">$ run exploit: withdraw_insecure, unsigned, 10000000 lamports</span></div>
		<div><span class="ok">[PASS] vault 100000000 to 90000000 (attacker gained 10000000)</span></div>
		<div>negative control: fixed code FAILED the exploit (good)</div>
		<div><span class="muted">proof: /proof/126b48f1…c15380 · runnable again from the URL alone</span></div>
	</div>
</div>

<h2>Why this exists</h2>
<div class="panel">
	<h3>Tutorials end. Proof does not start.</h3>
	<p>
		Local setup takes hours: Rust plus Anchor plus CLI conflicts. And when the
		tutorial ends, a CV line remains that nobody can verify again. No feedback,
		no next step, no trusted artifact.
	</p>
	<p>
		This gym inverts that: zero setup in your browser, one guided exploit at
		a time, and every lesson ends in a room where you prove it. The proof is
		a URL a stranger runs again alone.
	</p>
	<p><a href="/learn/101">Start with lesson 101</a></p>
</div>

<h2 id="how">How it works</h2>
<div class="steps">
	<div class="panel">
		<h3>{@html icon("terminal")} 1. Learn</h3>
		<p class="muted">Five minute lessons: accounts, signers, owners, CPI, types, relationships. Each one ends in a room.</p>
		<p><a href="/learn">Open the path {@html icon("arrow")}</a></p>
	</div>
	<div class="panel">
		<h3>{@html icon("lock")} 2. Hack</h3>
		<p class="muted">Vuln vs fixed side by side. One Run button, state verdict, staged hints.</p>
		<p><a href="/rooms">Open the rooms {@html icon("arrow")}</a></p>
	</div>
	<div class="panel">
		<h3>{@html icon("proof")} 3. Prove</h3>
		<p class="muted">Write the finding, mint the proof URL. A stranger verifies it again alone.</p>
		<p><a href="/board">See the board {@html icon("arrow")}</a></p>
	</div>
</div>

<h2>What a proof carries</h2>
<p class="muted">
	Not a badge. Not a certificate. A record you can run again. Every proof URL holds:
</p>
<div class="termbar">
	<div>solver hash · timestamps · attempts + hints used</div>
	<div>code digest · verifier pin · blind grade status</div>
	<div>run again recipe: claim a name, paste the target, press Run exploit</div>
</div>
<p><a href="/board">See the board</a></p>

<h2>Questions</h2>
<div class="cards">
	<div class="panel">
		<h3>Do I need a wallet?</h3>
		<p class="muted">
			No. Claim a nickname, get a session. No passwords, no OAuth, no email.
			An optional wallet pubkey string exists for later. Guest mode is allowed.
		</p>
	</div>
	<div class="panel">
		<h3>Does it cost anything?</h3>
		<p class="muted">
			No. Free forever. Execution is hermetic LiteSVM in our process: zero
			real money, zero real transactions, zero devnet.
		</p>
	</div>
	<div class="panel">
		<h3>What setup do I need?</h3>
		<p class="muted">
			None. A browser. The editor is plain, Run is one click or Ctrl+Enter,
			and the terminal shows every command with a timestamp.
		</p>
	</div>
	<div class="panel">
		<h3>Which chain?</h3>
		<p class="muted">
			Solana only. Rooms run against real Solana programs, verified against
			real onchain state semantics.
		</p>
	</div>
	<div class="panel">
		<h3>I never touched Rust or Solana.</h3>
		<p class="muted">
			Start at lesson 101. Five minutes: what an account is, what a signer
			proves, the one word fix. Then open the room and drain the vault.
		</p>
	</div>
	<div class="panel">
		<h3>How is the verdict honest?</h3>
		<p class="muted">
			The verifier reads account state, never log text. Every pass ships
			with a negative control: the same exploit must fail against the
			fixed program, or there is no green.
		</p>
	</div>
</div>

<div class="panel hero-ok">
	<h3>{@html icon("shield")} Why the verdicts are trustworthy</h3>
	<p>
		The verdict reads onchain account state, never log text. Every pass ships
		with its negative control: the same exploit run against the fixed program,
		which must refuse. Attempts, hints and timestamps are baked into the proof
		hash. Nothing to take on faith.
	</p>
	<p><a class="btn-ghost" href="/rooms/l1-signer">{@html icon("play")} Run your first exploit</a></p>
</div>
