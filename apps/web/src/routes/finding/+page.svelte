<script lang="ts">
	let severity = $state("High");
	let proof = $state("");
	let fix = $state("");
	interface FindingResult {
		proof_url?: string;
		error?: string;
		action?: string;
		received_at?: string;
	}
	let result: FindingResult | null = $state(null);

	async function submit() {
		const uuid = localStorage.getItem("arena_session") ?? "";
		const r = await fetch("/api/finding", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ session_uuid: uuid, severity, proof, fix })
		});
		result = { ...(await r.json()), received_at: new Date().toISOString() };
	}
</script>

<h1>Finding</h1>
<p class="muted">Last step: describe the bug and its fix in your own words to mint your proof URL.</p>
<div class="panel">
	<label for="sev">Severity</label>
	<select id="sev" bind:value={severity}>
		<option>Critical</option>
		<option>High</option>
		<option>Medium</option>
		<option>Low</option>
	</select>
	<label for="proof">Proof: what the exploit did (2 to 3 sentences)</label>
	<textarea id="proof" bind:value={proof} rows="4"></textarea>
	<label for="fix">Fix (1 to 2 sentences)</label>
	<textarea id="fix" bind:value={fix} rows="3"></textarea>
	<div><button class="btn" onclick={submit}>Publish proof</button></div>
</div>
{#if result}
	{#if result.proof_url}
		<div class="verdict-pass">
			<strong>[PASS]</strong> <span class="muted">{result.received_at}</span>
			<p>negative control: the fixed code refused the exploit</p>
			<p><a href={result.proof_url}>Open your proof</a></p>
		</div>
	{:else}
		<div class="verdict-fail"><strong>{result.error}</strong><p>{result.action}</p></div>
	{/if}
{/if}
