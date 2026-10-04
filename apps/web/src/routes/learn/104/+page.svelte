<script lang="ts">
	import Lesson from "$content/lessons/104-type-cosplay.md";
	import Quiz from "$lib/Quiz.svelte";
	import LessonNav from "$lib/LessonNav.svelte";
	import diagram from "$content/lessons/assets/l104-cosplay.svg";
</script>

<Lesson />
<img src={diagram} alt="Same bytes, different costume" />
<Quiz quiz="quiz-104" />
<a class="btn" href="/rooms/l4-cosplay">Open the room</a>
<LessonNav prev={{ href: "/learn/103", label: "Lesson 103" }} next={{ href: "/learn/105", label: "Lesson 105" }} />
