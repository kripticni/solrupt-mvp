<script lang="ts">
	import "../lib/styles/tokens.css";
	import { setSound, soundEnabled } from "$lib/sfx.js";
	let { children } = $props();
	let sound = $state(false);
	let menu = $state(false);

	$effect(() => {
		sound = soundEnabled();
	});

	function toggle() {
		sound = !sound;
		setSound(sound);
	}
</script>

<svelte:head>
	<title>Solrupt: break Solana programs, prove it</title>
	<meta
		name="description"
		content="Free practical Solana security gym: run guided exploits in your browser and earn a proof URL a stranger can run again."
	/>
</svelte:head>

<nav class="topnav">
	<a class="brand" href="/"><img src="/logo.svg" alt="" />Solrupt</a>
	<button class="menu-btn" onclick={() => (menu = !menu)} aria-expanded={menu} aria-controls="navlinks">Menu</button>
	<div id="navlinks" class="links" class:open={menu}>
		<a href="/learn">Learn</a>
		<a href="/rooms">Rooms</a>
		<a href="/board">Board</a>
		<button class="btn-ghost" onclick={toggle} title="Micro sound cues after clicks">Sound: {sound ? "on" : "off"}</button>
	</div>
</nav>
<main class="wrap">
	{@render children()}
</main>
<footer class="site">
	Training gym for Solana. <a href="mailto:team@nerv.example">support</a>
</footer>
