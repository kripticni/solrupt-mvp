<script lang="ts">
	import Lesson from "$content/lessons/103-cpi-deputy.md";
	import Quiz from "$lib/Quiz.svelte";
	import LessonNav from "$lib/LessonNav.svelte";
	import diagram from "$content/lessons/assets/l103-cpi.svg";
</script>

<Lesson />
<img src={diagram} alt="Confused deputy: the callee is attacker chosen" />
<Quiz quiz="quiz-103" />
<a class="btn" href="/rooms/l3-cpi">Open the room</a>
<LessonNav prev={{ href: "/learn/102", label: "Lesson 102" }} next={{ href: "/learn/104", label: "Lesson 104" }} />
