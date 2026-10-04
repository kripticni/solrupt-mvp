<script lang="ts">
	interface Room {
		id: string;
		title: string;
		tier: string;
		points: number;
		live?: boolean;
	}

	interface BoardEntry {
		nickname: string;
		points: number;
	}

	const STAKES: Record<string, string> = {
		"l1-signer": "The classic missing check. One word fixes it.",
		"l2-owner": "Fake millions. The program believes you.",
		"l3-cpi": "You choose who the victim trusts.",
		"l4-cosplay": "Wear the wrong type. Pass every check.",
		"l5-match": "Your signature. Someone else's vault.",
		"l6-vault": "Empty it all in a single transaction.",
		"l7-overflow": "Ask for one more than exists. Become rich."
	};

	const METER: Record<string, number> = { Easy: 33, Medium: 66, Hard: 100 };

	const FALLBACK_ROOMS: Room[] = [
		{ id: "l1-signer", title: "Missing signer: drain the vault", tier: "Easy", points: 100, live: true },
		{ id: "l2-owner", title: "Missing owner: fake the collateral", tier: "Medium", points: 250, live: true },
		{ id: "l3-cpi", title: "Confused deputy: release on a fake callee", tier: "Medium", points: 200, live: true },
		{ id: "l4-cosplay", title: "Wrong costume: claim as a user you are not", tier: "Hard", points: 300, live: true },
		{ id: "l5-match", title: "Wrong vault: a valid signature on someone else's account", tier: "Medium", points: 200, live: true },
		{ id: "l6-vault", title: "Vault raid: drain 100% in one transaction", tier: "Easy", points: 100, live: true },
		{ id: "l7-overflow", title: "Off by quintillions: wrap the books", tier: "Hard", points: 250, live: true }
	];

	const ANATOMY = [
		"solver hash",
		"timestamps",
		"attempts plus hints used",
		"code digest",
		"verifier pin",
		"negative control: fixed code FAILED"
	];

	let rooms: Room[] = $state(FALLBACK_ROOMS);
	let leaders: BoardEntry[] = $state([]);
	let canvas: HTMLCanvasElement | null = $state(null);

	const stats = $derived([
		{ value: rooms.filter((r) => r.live).length || 7, label: "live raids", suffix: "" },
		{ value: 1400, label: "points on the table", suffix: "" },
		{ value: 7, label: "guided lessons", suffix: "" },
		{ value: 100, label: "percent drain to win the raid", suffix: "%" }
	]);

	$effect(() => {
		fetch("/api/rooms")
			.then((r) => r.json())
			.then((j) => {
				const list = Array.isArray(j.rooms) ? (j.rooms as Room[]) : [];
				if (list.length > 0) rooms = list;
			})
			.catch(() => {});
		fetch("/api/board")
			.then((r) => r.json())
			.then((j) => {
				const entries = Array.isArray(j.entries) ? (j.entries as BoardEntry[]) : [];
				leaders = entries.slice(0, 5);
			})
			.catch(() => {});
	});

	$effect(() => {
		const el = canvas;
		if (!el) return;
		const ctx = el.getContext("2d");
		if (!ctx) return;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		let w = 0;
		let h = 0;
		let raf = 0;
		const resize = () => {
			const rect = el.getBoundingClientRect();
			w = el.width = Math.floor(rect.width);
			h = el.height = Math.floor(rect.height);
		};
		resize();
		window.addEventListener("resize", resize);
		const dots = Array.from({ length: 110 }, () => ({
			x: Math.random(),
			y: Math.random(),
			vx: (Math.random() - 0.5) * 0.0007,
			vy: (Math.random() - 0.5) * 0.0007,
			r: 0.8 + Math.random() * 2,
			hot: Math.random() < 0.16
		}));
		let mx = 0.5;
		let my = 0.5;
		const onMove = (e: PointerEvent) => {
			const rect = el.getBoundingClientRect();
			mx = (e.clientX - rect.left) / rect.width;
			my = (e.clientY - rect.top) / rect.height;
		};
		window.addEventListener("pointermove", onMove);
		const draw = (t: number) => {
			ctx.clearRect(0, 0, w, h);
			ctx.strokeStyle = "rgba(88, 166, 255, 0.10)";
			ctx.lineWidth = 1;
			const step = 56;
			ctx.beginPath();
			for (let x = 0.5; x < w; x += step) {
				ctx.moveTo(x, 0);
				ctx.lineTo(x, h);
			}
			for (let y = 0.5; y < h; y += step) {
				ctx.moveTo(0, y);
				ctx.lineTo(w, y);
			}
			ctx.stroke();
			const pulse = (t / 2400) % 1;
			ctx.strokeStyle = `rgba(20, 241, 149, ${0.35 * (1 - pulse)})`;
			ctx.beginPath();
			ctx.arc(w * 0.5, h * 0.42, 20 + pulse * 170, 0, Math.PI * 2);
			ctx.stroke();
			ctx.strokeStyle = `rgba(88, 166, 255, ${0.25 * (1 - pulse)})`;
			ctx.beginPath();
			ctx.arc(w * 0.5, h * 0.42, 10 + pulse * 90, 0, Math.PI * 2);
			ctx.stroke();
			for (const d of dots) {
				const px = (d.x + (mx - 0.5) * 0.03 * d.r + w) % 1;
				const py = (d.y + (my - 0.5) * 0.03 * d.r + h) % 1;
				ctx.fillStyle = d.hot ? "rgba(20, 241, 149, 0.85)" : "rgba(88, 166, 255, 0.55)";
				ctx.beginPath();
				ctx.arc(px * w, py * h, d.r, 0, Math.PI * 2);
				ctx.fill();
				d.x = (d.x + d.vx + 1) % 1;
				d.y = (d.y + d.vy + 1) % 1;
			}
			if (!reduced) raf = requestAnimationFrame(draw);
		};
		draw(0);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", resize);
			window.removeEventListener("pointermove", onMove);
		};
	});

	function countup(node: HTMLElement, target: number) {
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const suffix = node.dataset.suffix ?? "";
		if (reduced) {
			node.textContent = `${target}${suffix}`;
			return;
		}
		const t0 = performance.now();
		const dur = 1300;
		const tick = (now: number) => {
			const p = Math.min(1, (now - t0) / dur);
			const eased = 1 - Math.pow(1 - p, 3);
			node.textContent = `${Math.round(target * eased)}${suffix}`;
			if (p < 1) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	}
</script>

<div class="land">
	<canvas bind:this={canvas} class="sky" aria-hidden="true"></canvas>

	<header class="hero">
		<p class="eyebrow reveal">Seven live raids · real Solana programs</p>
		<h1 class="reveal d1">Drain the vault.<br />Keep the proof.</h1>
		<p class="lead reveal d2">
			Winners walk away with proof URLs nobody can argue with. Every exploit runs
			against true onchain state, and every pass is checked twice: once to win,
			once against the fixed code.
		</p>
		<p class="ctas reveal d3">
			<a class="btn prism" href="/rooms/l1-signer">Claim your first vault</a>
			<a class="btn ghost" href="/board">See who already did</a>
		</p>
	</header>

	<section class="stats" aria-label="Arena numbers">
		{#each stats as s, i}
			<div class="stat reveal" style="animation-delay: {0.1 + i * 0.08}s">
				<div class="num" use:countup={s.value} data-suffix={s.suffix}>{s.value}{s.suffix}</div>
				<div class="lbl">{s.label}</div>
			</div>
		{/each}
	</section>

	<div class="ticker" aria-label="Live rooms">
		<div class="track">
			{#each [...rooms, ...rooms] as r, i}
				<span class="tick" aria-hidden={i >= rooms.length ? "true" : "false"}>
					<span class="dot"></span>{r.title} · {r.points} pts
				</span>
			{/each}
		</div>
	</div>

	<section class="raids">
		<h2 class="reveal">Pick your raid</h2>
		<p class="sub reveal">Danger first, points second. Every card opens a live room.</p>
		<div class="bento">
			{#each rooms as r, i}
				<a
					class="panel raid reveal {r.tier.toLowerCase()}"
					style="animation-delay: {(i % 4) * 0.07}s"
					href="/rooms/{r.id}"
				>
					<div class="top"><span class="badge">{r.tier}</span><span class="pts">{r.points} pts</span></div>
					<h3>{r.title}</h3>
					<p class="stake">{STAKES[r.id] ?? "A live room. Real state. True verdict."}</p>
					<div class="meter" aria-hidden="true">
						<span class="fill" style="width: {METER[r.tier] ?? 50}%"></span>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<section class="panel anatomy reveal" aria-label="Anatomy of a pass">
		<h2>Anatomy of a pass</h2>
		<p class="sub">Six things ride inside every proof URL. The last one is the whole game.</p>
		<ol>
			{#each ANATOMY as a, i}
				<li class="chip reveal" style="animation-delay: {0.15 + i * 0.1}s">
					<span class="idx">{i + 1}</span>{a}
				</li>
			{/each}
		</ol>
	</section>

	<section class="panel boardprev reveal" aria-label="Fresh from the board">
		<h2>Fresh from the board</h2>
		{#if leaders.length > 0}
			<ol>
				{#each leaders as l, i}
					<li><span class="rank">{i + 1}</span><span class="who">{l.nickname}</span><span class="pts">{l.points} pts</span></li>
				{/each}
			</ol>
			<p><a href="/board">Open the full board</a></p>
		{:else}
			<p class="sub">No names yet. The first row is still yours to take.</p>
			<p><a class="btn prism" href="/rooms/l1-signer">Take it</a></p>
		{/if}
	</section>

	<section class="closer reveal">
		<h2>The vaults are full. The board is hungry.</h2>
		<p><a class="btn prism big" href="/rooms/l1-signer">Start the first raid</a></p>
		<p class="micro">No setup. No wallet. Just a nickname and a vault.</p>
	</section>
</div>

<style>
	.land {
		position: relative;
		overflow: clip;
	}
	.sky {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 760px;
		pointer-events: none;
	}
	.hero {
		position: relative;
		text-align: center;
		padding: 110px 0 44px;
		max-width: 900px;
		margin: 0 auto;
	}
	.eyebrow {
		color: var(--accent);
		letter-spacing: 0.22em;
		font-size: 13px;
		font-family: var(--font-mono);
	}
	h1 {
		font-size: clamp(52px, 9vw, 110px);
		line-height: 0.98;
		margin: 18px 0;
		text-shadow: 0 0 54px rgba(88, 166, 255, 0.4);
	}
	.lead {
		font-size: 19px;
		color: var(--muted);
		max-width: var(--measure);
		margin: 0 auto;
	}
	.ctas {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		margin-top: 30px;
	}
	.land .btn {
		margin: 0.25rem 6px;
	}
	.btn {
		display: inline-block;
		padding: 13px 26px;
		border-radius: var(--r-md);
		font-weight: 700;
	}
	.prism {
		background: var(--prism);
		color: #fff;
	}
	.prism.big {
		padding: 16px 34px;
		font-size: 18px;
	}
	.ghost {
		border: 1px solid var(--line);
		color: var(--text);
	}
	.stats {
		position: relative;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		margin: 40px 0;
	}
	.stat {
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		padding: 20px 18px;
		text-align: center;
	}
	.num {
		font-size: 40px;
		font-weight: 800;
		font-family: var(--font-mono);
		color: var(--accent);
	}
	.lbl {
		color: var(--muted);
		margin-top: 6px;
	}
	.ticker {
		position: relative;
		overflow: hidden;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		margin: 0 0 44px;
	}
	.track {
		display: flex;
		width: max-content;
		animation: slide 38s linear infinite;
	}
	.tick {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 12px 28px;
		white-space: nowrap;
		color: var(--muted);
		font-family: var(--font-mono);
		font-size: 14px;
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--green);
	}
	@keyframes slide {
		to {
			transform: translateX(-50%);
		}
	}
	.raids {
		margin-bottom: 44px;
	}
	.raids h2 {
		text-align: center;
		font-size: clamp(30px, 4vw, 46px);
		margin-bottom: 6px;
	}
	.sub {
		text-align: center;
		color: var(--muted);
		margin-top: 0;
	}
	.bento {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-top: 24px;
	}
	.raid {
		display: block;
		transition: transform 160ms ease, border-color 160ms ease;
	}
	.raid:hover {
		transform: translateY(-4px);
		border-color: var(--accent);
	}
	.raid .top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}
	.raid h3 {
		margin: 0 0 8px;
		font-size: 18px;
	}
	.stake {
		color: var(--muted);
		margin: 0 0 14px;
	}
	.meter {
		height: 6px;
		border-radius: var(--r-pill);
		background: var(--chip);
		overflow: hidden;
	}
	.fill {
		display: block;
		height: 100%;
		background: var(--accent);
		animation: grow 1100ms ease both;
	}
	.easy .fill {
		background: var(--green);
	}
	.medium .fill {
		background: var(--warn);
	}
	.hard .fill {
		background: var(--red);
	}
	@keyframes grow {
		from {
			width: 0;
		}
	}
	.anatomy {
		margin-bottom: 28px;
	}
	.anatomy h2 {
		margin-top: 0;
		text-align: center;
	}
	.anatomy ol {
		list-style: none;
		padding: 0;
		margin: 18px 0 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}
	.chip {
		display: flex;
		align-items: center;
		gap: 12px;
		background: var(--chip);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		padding: 12px 14px;
		font-family: var(--font-mono);
	}
	.idx {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: var(--accent);
		color: #fff;
		font-weight: 800;
		flex: none;
	}
	.boardprev {
		margin-bottom: 28px;
	}
	.boardprev h2 {
		margin-top: 0;
		text-align: center;
	}
	.boardprev > p {
		text-align: center;
	}
	.boardprev ol {
		list-style: none;
		padding: 0;
		margin: 14px 0 0;
	}
	.boardprev li {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 4px;
		border-bottom: 1px solid var(--line);
	}
	.rank {
		font-family: var(--font-mono);
		color: var(--muted);
		width: 24px;
	}
	.who {
		font-weight: 700;
	}
	.boardprev .pts {
		margin-left: auto;
		color: var(--muted);
		font-family: var(--font-mono);
	}
	.closer {
		text-align: center;
		padding: 60px 20px 76px;
	}
	.closer h2 {
		font-size: clamp(30px, 4.5vw, 52px);
		margin-bottom: 24px;
	}
	.micro {
		color: var(--muted);
		margin-top: 16px;
	}
	.reveal {
		opacity: 0;
		animation: rise 700ms ease forwards;
	}
	.d1 {
		animation-delay: 0.1s;
	}
	.d2 {
		animation-delay: 0.2s;
	}
	.d3 {
		animation-delay: 0.3s;
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@media (max-width: 900px) {
		.stats {
			grid-template-columns: repeat(2, 1fr);
		}
		.bento,
		.anatomy ol {
			grid-template-columns: 1fr;
		}
		.sky {
			height: 600px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.reveal {
			opacity: 1;
			animation: none;
		}
		.track {
			animation: none;
			flex-wrap: wrap;
			width: auto;
		}
		.fill {
			animation: none;
		}
		.raid {
			transition: none;
		}
		.raid:hover {
			transform: none;
		}
	}
	@media print {
		.sky,
		.ticker {
			display: none;
		}
	}
</style>
