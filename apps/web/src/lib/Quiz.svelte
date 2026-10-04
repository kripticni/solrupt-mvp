<script lang="ts">
	// Q&A checks island (client only: fetch, never lib/server; see
	// no-server-import.test.ts). Questions come answer-free from GET; POST
	// grades server-side and awards completion points on a full pass.
	let { quiz }: { quiz: string } = $props();

	interface Question {
		id: string;
		q: string;
		choices: string[];
		points: number;
		severity: string;
	}
	let questions: Question[] = $state([]);
	let total = $state(0);
	let picked: (number | null)[] = $state([]);
	let nickname = $state("");
	let verdict: string | null = $state(null);
	let action = $state("");
	let points = $state(0);
	let loadError: string | null = $state(null);
	const answered = $derived(picked.filter((p) => p !== null).length);
	const ready = $derived(picked.length > 0 && answered === picked.length && nickname.trim().length > 0);

	$effect(() => {
		fetch(`/api/quiz/${quiz}`)
			.then((r) => {
				if (!r.ok) throw new Error(`quiz ${r.status}`);
				return r.json();
			})
			.then((j) => {
				questions = j.questions;
				total = j.points_total;
				picked = questions.map(() => null);
			})
			.catch((e) => (loadError = `${e.message}. Try Again below.`));
	});

	async function submit() {
		const r = await fetch(`/api/quiz/${quiz}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ nickname, answers: picked })
		});
		const j = await r.json();
		verdict = j.verdict;
		action = j.action ?? "";
		points = j.points ?? 0;
	}
</script>

<section aria-label="Lesson check" class="quiz">
	<h2>Check ({total} pts)</h2>
	{#if questions.length > 0}<p class="muted">Answered {answered}/{questions.length}</p>{/if}
	{#if loadError}
		<p class="muted">{loadError}</p>
	{:else}
		{#each questions as q, i}
			<fieldset>
				<legend>{q.q} <span class="badge">{q.severity}</span></legend>
				{#each q.choices as c, k}
					<label>
						<input type="radio" name="{quiz}-{q.id}" checked={picked[i] === k} onchange={() => (picked[i] = k)} />
						{c}
					</label>
				{/each}
			</fieldset>
		{/each}
		<label for="quiz-nick-{quiz}">Nickname</label>
		<input id="quiz-nick-{quiz}" bind:value={nickname} placeholder="nickname" />
		<div><button class="btn-ghost" onclick={submit} disabled={!ready}>Submit answers</button></div>
		{#if !ready && questions.length > 0}<p class="muted">Pick one choice per question and a nickname to submit.</p>{/if}
		{#if verdict === "pass"}
			<div class="verdict-pass"><strong>PASS</strong>: +{points} pts on the board.</div>
		{:else if verdict === "fail"}
			<div class="verdict-fail"><strong>FAIL</strong>: {action}</div>
		{:else if verdict === "error"}
			<div class="verdict-error"><strong>ERROR</strong>: {action}</div>
		{/if}
	{/if}
</section>
