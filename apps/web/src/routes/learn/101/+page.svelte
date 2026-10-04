<script lang="ts">
	import Lesson from "$content/lessons/101-accounts-signer.md";
	import Quiz from "$lib/Quiz.svelte";
	import LessonNav from "$lib/LessonNav.svelte";
	import account from "$content/lessons/assets/l101-account.svg";
	import signer from "$content/lessons/assets/l101-signer.svg";
</script>

<div class="prose"><Lesson /></div>
<img src={account} alt="Solana account anatomy" />
<img src={signer} alt="Signer versus pubkey" />
<Quiz quiz="quiz-101" />
<a class="btn" href="/rooms/l1-signer">Open the room</a>
<LessonNav prev={null} next={{ href: "/learn/102", label: "Lesson 102" }} />
