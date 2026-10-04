<script lang="ts">
	import Lesson from "$content/lessons/102-owner-pda.md";
	import Quiz from "$lib/Quiz.svelte";
	import LessonNav from "$lib/LessonNav.svelte";
	import pda from "$content/lessons/assets/l102-pda.svg";
</script>

<Lesson />
<img src={pda} alt="PDA seeds and bump" />
<Quiz quiz="quiz-102" />
<a class="btn" href="/rooms/l2-owner">Open the room</a>
<LessonNav prev={{ href: "/learn/101", label: "Lesson 101" }} next={{ href: "/learn/103", label: "Lesson 103" }} />
