<script lang="ts">
	import { page } from "$app/stores";
	import { sfx } from "$lib/sfx.js";
	import { highlightRust } from "$lib/shared/code.js";

	const id = $page.params.id;
	// Room → lesson check backlink (presentation map; rooms carry prereqs in yaml).
	const lessonFor: Record<string, string> = {
		"l1-signer": "101",
		"l2-owner": "102",
		"l3-cpi": "103",
		"l4-cosplay": "104",
		"l5-match": "105",
		"l6-vault": "106",
		"l7-overflow": "107"
	};
	const lesson = $derived(lessonFor[id ?? ""] ?? "");
	interface LabDetail {
		meta: { id: string; title: string; tier: string; points: number; live: boolean };
		hints: string[];
		vuln: string;
		fixed: string;
		template: string;
		target?: { vault?: string; authority?: string; fields?: { k: string; v: string }[] };
	}
	let detail: LabDetail | null = $state(null);
	let loadError: string | null = $state(null);
	let nickname = $state("");
	let exploit = $state("");
	interface RunResult {
		verdict: string;
		state_diff?: string;
		logs?: string;
		reason?: string;
		action?: string;
		attempts_used?: number;
		received_at?: string;
	}
	let result: RunResult | null = $state(null);
	let hint = $state(0);
	let showFixed = $state(false);
	let termlog: string[] = $state([]);
	let running = $state(false);
	let elapsed = $state("");
	let aborter: AbortController | null = $state(null);
	let loadSecs = $state(0);
	// Plain (non-reactive) by design: the $effect below writes this controller
	// and reads its .signal. As $state that self-subscribes the effect into
	// an infinite fetch+interval loop (found by 10-leg leak hunt). Plain `let`
	// breaks the tracking with zero behavior change; cancelLoad closes over it.
	let loadAborter: AbortController | null = null;

	function stamp(): string {
		return new Date().toISOString().slice(11, 19);
	}

	function fmtElapsed(s: number): string {
		return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
	}

	// UX_PREMIUM §4 + v1.0 §20.2: every wait shows a live elapsed timer and a
	// cancel past 10s. Client-side abort only; the Try Again path already exists.
	$effect(() => {
		const uuid = localStorage.getItem("arena_session") ?? "";
		loadAborter = new AbortController();
		const t0 = Date.now();
		const tick = setInterval(() => {
			loadSecs = Math.floor((Date.now() - t0) / 1000);
		}, 500);
		fetch(`/api/rooms/${id}${uuid ? `?session=${uuid}` : ""}`, { signal: loadAborter.signal })
			.then((r) => {
				if (!r.ok) throw new Error(`room ${r.status}`);
				return r.json();
			})
			.then((j) => {
				detail = j;
				exploit = j.template ?? "";
			})
			.catch((e) => {
				loadError =
					(e as Error).name === "AbortError"
						? "Load cancelled before the room arrived. Try Again below."
						: `${(e as Error).message}. Try Again below.`;
			})
			.finally(() => {
				clearInterval(tick);
				loadAborter = null;
			});
		return () => {
			clearInterval(tick);
			loadAborter?.abort();
		};
	});

	function cancelLoad() {
		loadAborter?.abort();
	}

	async function claim() {
		const r = await fetch("/api/session", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ nickname, room: id })
		});
		const j = await r.json();
		if (j.session_uuid) {
			localStorage.setItem("arena_session", j.session_uuid);
			termlog = [...termlog, `[${stamp()}] $ session claimed (${nickname})`];
		}
		result = j;
	}

	async function run() {
		const uuid = localStorage.getItem("arena_session") ?? "";
		if (!uuid) {
			result = { verdict: "error", reason: "NoSession", action: "claim a name first, then Run" };
			return;
		}
		running = true;
		result = null;
		aborter = new AbortController();
		const t0 = Date.now();
		const tick = setInterval(() => {
			const s = Math.floor((Date.now() - t0) / 1000);
			elapsed = `Running… 00:${String(s).padStart(2, "0")}`;
		}, 500);
		termlog = [...termlog, `[${stamp()}] $ run exploit (${exploit.split("\n").length} lines)`];
		try {
			const r = await fetch("/api/run", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ session_uuid: uuid, room_id: id, exploit_code: exploit }),
				signal: aborter.signal
			});
			const j = await r.json();
			result = { ...j, received_at: new Date().toISOString() };
			if (j.verdict === "pass") sfx.pass();
			else sfx.fail();
			termlog = [
				...termlog,
				`[${stamp()}] ${j.verdict === "pass" ? "PASS" : "FAIL"}${j.state_diff ? `: ${j.state_diff}` : ""}${j.reason ? ` (${j.reason})` : ""}`
			];
		} catch (e) {
			result = {
				verdict: "error",
				reason: "RequestCancelled",
				action: "run again when ready"
			};
			termlog = [...termlog, `[${stamp()}] cancelled (${(e as Error).name})`];
		} finally {
			clearInterval(tick);
			elapsed = "";
			running = false;
			aborter = null;
		}
	}

	function cancel() {
		aborter?.abort();
	}

	function onKey(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
			e.preventDefault();
			run();
		}
	}
</script>

{#if detail}
	<h1>{detail.meta.title}</h1>
	<p>
		<span class="badge">{detail.meta.tier}</span>
		<span class="badge">{detail.meta.points} pts</span>
		{#if detail.meta.live}<span class="badge">● LIVE</span>{:else}<span class="badge">Stub</span>{/if}
	</p>
	{#if !detail.meta.live}<div class="verdict-error"><strong>LOCKED</strong><p>This room's program is still building. Check back soon.</p></div>{/if}
	{#if detail.target}
		<div class="panel sticky-target">
			<h3>Victim target (stable for your session)</h3>
			{#each detail.target.fields as f}
				<p>{f.k}: <code>{f.v}</code></p>
			{/each}
		</div>
	{/if}
	<h2>Vulnerable</h2>
	<pre class="codepane"><code>{@html highlightRust(detail.vuln)}</code></pre>
	<details class="codepane-wrap" ontoggle={(e) => (showFixed = (e.target as HTMLDetailsElement).open)}>
		<summary>Fixed version (reference: expand to compare)</summary>
		{#if showFixed}
			<pre class="codepane"><code>{@html highlightRust(detail.fixed)}</code></pre>
		{/if}
	</details>
	<div class="lab-side">
		<section aria-label="Exploit editor">
	<h2>Exploit</h2>
	<p class="muted">Work locally if you like: <a href={`/api/rooms/${id}/files`}>download room files (.zip)</a>. Template, source and manifest included. Paste the filled exploit below to submit.</p>
	<textarea bind:value={exploit} rows="12" onkeydown={onKey}></textarea>
			<p class="muted">Run = Ctrl+Enter</p>
			<div>
				<button class="btn" onclick={run}>Run exploit</button>
				{#if running}<span class="muted">{elapsed}</span> <button class="btn-ghost" onclick={cancel}>Cancel</button>{/if}
			</div>
		</section>
		<section aria-label="Terminal output">
			<h2>Terminal</h2>
			<div class="termbar">{#if termlog.length === 0}<span class="muted">output appears here after Run</span>{/if}{#each termlog as line}<div>{line}</div>{/each}</div>
		</section>
	</div>
	{#if result}
		<div class={result.verdict === "pass" ? "verdict-pass reveal-1" : "verdict-fail reveal-1"}>
			<strong>[{result.verdict.toUpperCase()}]</strong>
			{#if result.received_at}<span class="muted"> {result.received_at}</span>{/if}
			{#if result.state_diff}<div class="termbar">{result.state_diff}</div>{/if}
			{#if result.logs}<p>{result.logs}</p>{/if}
			{#if result.verdict === "pass"}
				<p>negative control: the fixed code refused the exploit</p>
			{/if}
			{#if result.reason}<p>{result.reason}</p>{/if}
			{#if result.action}<p class="muted">Next: {result.action}</p>{/if}
		</div>
	{/if}
	<h2>Claim a name</h2>
	<label for="nick">Nickname</label>
	<input id="nick" bind:value={nickname} placeholder="nickname" />
	<div><button class="btn-ghost" onclick={claim}>Claim a name</button></div>
	{#if result?.verdict === "pass"}<a class="btn" href="/finding">Write your finding</a>{/if}
	<h2>Hints</h2>
	{#if lesson}<p class="muted">Stuck? <a href={`/learn/${lesson}`}>Review lesson {lesson}</a> first.</p>{/if}
	<button class="btn-ghost" onclick={() => (hint = Math.min(hint + 1, 3))}>Hint ({hint}/3)</button>
	{#if hint > 0}<div class="panel"><p>{detail.hints[hint - 1]}</p></div>{/if}
{:else if loadError}
	<div class="verdict-error"><strong>LOAD FAILED</strong><p>{loadError}</p></div>
	<div><button class="btn" onclick={() => location.reload()}>Try Again</button></div>
{:else}
	<div class="loading-line">Spawning session… {fmtElapsed(loadSecs)}</div>
	{#if loadSecs >= 10}<div><button class="btn-ghost" onclick={cancelLoad}>Cancel</button></div>{/if}
{/if}
