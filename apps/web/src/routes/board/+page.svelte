<script lang="ts">
	let board: {
		entries: { nickname: string; points: number; rooms?: string[] }[];
		first_solvers: { room: string; nickname: string }[];
	} = $state({ entries: [], first_solvers: [] });
	let loaded = $state(false);

	$effect(() => {
		fetch("/api/board")
			.then((r) => r.json())
			.then((j) => {
				board = j;
				loaded = true;
			});
	});
</script>

<h1>Board</h1>
<p class="muted">Practice progress only. Never a hiring signal.</p>
<ol class="board-rows">
	{#each board.entries as e, i}
		<li>
			<span class="rank">{String(i + 1).padStart(2, "0")}</span>
			<a href={`/profile/${encodeURIComponent(e.nickname)}`}><strong>{e.nickname}</strong></a> · {e.points} pts · {(e.rooms ?? []).length} rooms
		</li>
	{:else}
		{#if loaded}<li class="muted">
				No solvers yet. <a href="/rooms/l1-signer">Open L1 and claim the first row</a>.
			</li>{/if}
	{/each}
</ol>
<h2>First solvers</h2>
<ul>
	{#each board.first_solvers as f}
		<li>{f.room}: <a href={`/profile/${encodeURIComponent(f.nickname)}`}>{f.nickname}</a></li>
	{:else}
		{#if loaded}<li class="muted">No first solvers recorded yet.</li>{/if}
	{/each}
</ul>
