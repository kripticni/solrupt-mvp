<script lang="ts">
	import Lesson from "$content/lessons/107-overflow-math.md";
	import Quiz from "$lib/Quiz.svelte";
	import LessonNav from "$lib/LessonNav.svelte";
	import diagram from "$content/lessons/assets/l107-overflow.svg";
</script>

<Lesson />
<img src={diagram} alt="The number line that bites its tail" />
<Quiz quiz="quiz-107" />
<a class="btn" href="/rooms/l7-overflow">Open the room</a>
<LessonNav prev={{ href: "/learn/106", label: "Lesson 106" }} next={null} />
