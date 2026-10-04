<script lang="ts">
	import Lesson from "$content/lessons/105-data-matching.md";
	import Quiz from "$lib/Quiz.svelte";
	import LessonNav from "$lib/LessonNav.svelte";
	import diagram from "$content/lessons/assets/l105-match.svg";
</script>

<Lesson />
<img src={diagram} alt="Valid signature, wrong vault" />
<Quiz quiz="quiz-105" />
<a class="btn" href="/rooms/l5-match">Open the room</a>
<LessonNav prev={{ href: "/learn/104", label: "Lesson 104" }} next={{ href: "/learn/106", label: "Lesson 106" }} />
