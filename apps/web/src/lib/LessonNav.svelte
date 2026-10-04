<script lang="ts">
	// Lesson path navigation (client-only, no data fetching).
	let {
		prev,
		next
	}: {
		prev: { href: string; label: string } | null;
		next: { href: string; label: string } | null;
	} = $props();
</script>

<nav aria-label="Lesson path" class="lesson-nav">
	{#if prev}
		<a class="btn-ghost" href={prev.href}>← {prev.label}</a>
	{:else}
		<span></span>
	{/if}
	<a class="btn-ghost" href="/learn">Path</a>
	{#if next}
		<a class="btn-ghost" href={next.href}>{next.label} →</a>
	{/if}
</nav>
