<script lang="ts">
	import { page } from "$app/stores";

	const nickname = $page.params.nickname ?? "";

	interface RoomSolve {
		room: string;
		points: number;
		first_at: string;
	}
	interface LessonDone {
		lesson: string;
		at: string;
	}
	interface ProofRef {
		solver_hash: string;
		room: string;
		severity: string;
		at: string;
		url: string;
	}
	interface Profile {
		nickname: string;
		since: string;
		points: number;
		rooms: RoomSolve[];
		lessons: LessonDone[];
		proofs: ProofRef[];
	}

	let profile: Profile | null = $state(null);
	let missing = $state(false);

	$effect(() => {
		fetch(`/api/users/${encodeURIComponent(nickname)}`)
			.then((r) => {
				if (!r.ok) {
					missing = true;
					return null;
				}
				return r.json();
			})
			.then((j) => {
				profile = j as Profile;
			});
	});
</script>

{#if profile}
	<h1>{profile.nickname}</h1>
	<p class="muted">Solver since {profile.since.slice(0, 10)} · {profile.points} pts practice progress</p>
	<h2>Rooms solved ({profile.rooms.length})</h2>
	{#if profile.rooms.length === 0}
		<p class="muted">No rooms yet: <a href="/rooms">open the rooms</a>.</p>
	{:else}
		<ul class="board-rows">
			{#each profile.rooms as r, i}
				<li>
					<span class="rank">{String(i + 1).padStart(2, "0")}</span>
					<strong>{r.room}</strong> · {r.points} pts
					<span class="muted">· {r.first_at.slice(0, 10)}</span>
				</li>
			{/each}
		</ul>
	{/if}
	<h2>Lessons done ({profile.lessons.length})</h2>
	{#if profile.lessons.length === 0}
		<p class="muted">No lessons marked done: <a href="/learn">open the path</a>.</p>
	{:else}
		<ul>
			{#each profile.lessons as l}
				<li><code>{l.lesson}</code> <span class="muted">· {l.at.slice(0, 10)}</span></li>
			{/each}
		</ul>
	{/if}
	<h2>Proofs ({profile.proofs.length})</h2>
	{#if profile.proofs.length === 0}
		<p class="muted">No proofs minted yet. Proofs appear after a passing run plus a finding.</p>
	{:else}
		<ul>
			{#each profile.proofs as p}
				<li>
					<a href={p.url}><code>{p.solver_hash.slice(0, 4)}…{p.solver_hash.slice(-2)}</code></a>
					· {p.room} · {p.severity} · <span class="muted">{p.at.slice(0, 10)}</span>
				</li>
			{/each}
		</ul>
	{/if}
{:else if missing}
	<div class="verdict-error"><strong>UNKNOWN USER</strong><p>Check the board for solvers.</p></div>
	<p><a class="btn-ghost" href="/board">Back to board</a></p>
{:else}
	<div class="skeleton"><p>Loading profile…</p></div>
{/if}
