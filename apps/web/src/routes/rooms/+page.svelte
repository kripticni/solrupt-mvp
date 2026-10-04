<script lang="ts">
	import type { RoomMeta } from "$lib/shared/types.js";

	let data: { rooms: (RoomMeta & { live: boolean; solved: boolean })[]; greyed: string[] } = $state({
		rooms: [],
		greyed: []
	});

	const easy = $derived(data.rooms?.filter((r) => r.tier === "Easy") ?? []);

	$effect(() => {
		const uuid = localStorage.getItem("arena_session") ?? "";
		fetch(`/api/rooms${uuid ? `?session=${uuid}` : ""}`)
			.then((r) => r.json())
			.then((j) => (data = j));
	});
</script>

<h1>Rooms</h1>
<p class="muted">Seven live rooms, Easy to Hard. Every exploit runs against a real program. Pass, then write the finding to score.</p>
{#if easy.length > 0}
	<div class="panel">
		<h3><a href={`/rooms/${easy[0].id}`}>{easy[0].title}</a></h3>
		<p>
			<span class="badge">Easy</span>
			<span class="badge">{easy[0].points} pts</span>
			{#if easy[0].live}<span class="badge">● LIVE</span>{:else}<span class="badge">Stub</span>{/if}
			{#if easy[0].solved}<span class="badge">solved</span>{/if}
		</p>
		<p class="muted">Start here.</p>
		{#if !easy[0].live}<p class="muted">Locked: program building.</p>{/if}
	</div>
{/if}
{#each ["Easy", "Medium", "Hard"] as tier}
	{@const rest = (tier === "Easy" ? easy.slice(1) : data.rooms?.filter((r) => r.tier === tier) ?? [])}
	{#if rest.length > 0}
		<h2>{tier}</h2>
		<div class="cards">
			{#each rest as room}
				<div class="panel">
					{#if room.live}
						<h3><a href={`/rooms/${room.id}`}>{room.title}</a></h3>
						<p>
							<span class="badge">{room.tier}</span>
							<span class="badge">{room.points} pts</span>
							<span class="badge">● LIVE</span>
							{#if room.solved}<span class="badge">solved</span>{/if}
						</p>
					{:else}
						<h3>{room.title}</h3>
						<p class="muted">{room.points} pts · locked: program building</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
{/each}
