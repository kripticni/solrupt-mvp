<script lang="ts">
	import { page } from "$app/stores";

	const hash = $page.params.hash;

	interface ProofRecord {
		solver?: unknown;
		nickname?: unknown;
		user?: unknown;
		room?: unknown;
		severity?: unknown;
		proof?: unknown;
		fix?: unknown;
		attempts?: unknown;
		hints_used?: unknown;
		solved_at?: unknown;
		code_digest?: unknown;
		verifier_pin?: unknown;
		grade?: unknown;
		solver_hash?: unknown;
		[key: string]: unknown;
	}

	interface BoardEntry {
		nickname: string;
		points: number;
		rooms: string[];
	}

	interface FirstSolver {
		room: string;
		nickname: string;
	}

	interface Board {
		entries: BoardEntry[];
		first_solvers: FirstSolver[];
	}

	let proof: ProofRecord | null = $state(null);
	let board: Board = $state({ entries: [], first_solvers: [] });
	let copied = $state(false);

	async function reverify() {
		const r = await fetch(`/api/proof/${hash}`);
		proof = (await r.json()) as ProofRecord;
	}

	function copyHash() {
		const h: string = asText(proof?.solver_hash) ?? hash ?? "";
		navigator.clipboard.writeText(h).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}

	$effect(() => {
		fetch(`/api/proof/${hash}`)
			.then((r) => r.json())
			.then((j) => (proof = j as ProofRecord));
		fetch("/api/board")
			.then((r) => r.json())
			.then((j) => (board = j as Board));
	});

	function asText(v: unknown): string | null {
		return typeof v === "string" && v.length > 0 ? v : null;
	}

	const solverNickname: string | null = $derived.by(() => {
		if (!proof) return null;
		return asText(proof.solver) ?? asText(proof.nickname) ?? asText(proof.user);
	});
	const roomsSolved: string[] = $derived(
		solverNickname ? (board.entries.find((e) => e.nickname === solverNickname)?.rooms ?? []) : []
	);
</script>

<h1>Proof</h1>
{#if proof}
	<div class="verdict-pass">
		<strong>PROOF</strong> <span class="muted">{asText(proof.solved_at) ?? ""}</span>
		<p><strong>Solver:</strong> {asText(proof.solver) ?? "unknown"}</p>
		<p><strong>Room:</strong> {asText(proof.room) ?? "unknown"}</p>
		<p><strong>Severity:</strong> {asText(proof.severity) ?? "unknown"}</p>
		<p><strong>Proof:</strong> {asText(proof.proof) ?? "unknown"}</p>
		<p><strong>Fix:</strong> {asText(proof.fix) ?? "unknown"}</p>
		<p>negative control: the fixed code refused the exploit</p>
		<p class="muted">
			Attempts: {typeof proof.attempts === "number" ? proof.attempts : "unknown"} · Hints used: {typeof proof.hints_used ===
			"number"
				? proof.hints_used
				: "unknown"}
		</p>
		<p class="muted">Verifier: {asText(proof.verifier_pin) ?? "unknown"} · Grade: {asText(proof.grade) ?? "unknown"}</p>
		<p class="hashrow">
			<code>{asText(proof.solver_hash)?.slice(0, 4) ?? ""}…{asText(proof.solver_hash)?.slice(-2) ?? ""}</code>
			<button class="btn-ghost" onclick={copyHash}>{copied ? "Copied" : "Copy hash"}</button>
			<button class="btn-ghost" onclick={reverify}>Verify again</button>
		</p>
	</div>
{/if}

<section>
	<h2>Solver progress</h2>
	<p class="muted">Read only summary of recorded work. Points track practice progress only.</p>
	{#if solverNickname}
		<p>Solver: {solverNickname}</p>
		{#if roomsSolved.length > 0}
			<p>Rooms with recorded work:</p>
			<ul>
				{#each roomsSolved as room}
					<li>{room}</li>
				{/each}
			</ul>
		{:else}
			<p class="muted">No recorded solves yet.</p>
		{/if}
	{:else}
		<p class="muted">Solver details appear with the proof record.</p>
	{/if}
</section>
