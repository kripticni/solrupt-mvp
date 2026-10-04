<script lang="ts">
	import Lesson from "$content/lessons/106-vault-capstone.md";
	import Quiz from "$lib/Quiz.svelte";
	import LessonNav from "$lib/LessonNav.svelte";
	import diagram from "$content/lessons/assets/l106-vault.svg";
</script>

<Lesson />
<img src={diagram} alt="The door that was never built" />
<Quiz quiz="quiz-106" />
<a class="btn" href="/rooms/l6-vault">Open the room</a>
<LessonNav prev={{ href: "/learn/105", label: "Lesson 105" }} next={{ href: "/learn/107", label: "Lesson 107" }} />
