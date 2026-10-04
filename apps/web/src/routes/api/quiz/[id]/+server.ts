import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { openDb } from "$lib/server/db/client.js";
import { loadQuizzes, toPublic } from "$lib/server/quiz/loader.js";
import { gradeQuiz } from "$lib/server/quiz/grade.js";

// Q&A checks (TryHackMe-style tasks): GET returns questions WITHOUT answers
// (stripped server-side); POST grades server-side and awards completion
// points through the existing solves path on a full pass.
export const GET: RequestHandler = async ({ params }) => {
	const { quizzes } = loadQuizzes();
	const quiz = quizzes.find((q) => q.id === params.id);
	if (!quiz) return json({ error: "QuizMissing", action: "pick a quiz from a lesson page" }, { status: 404 });
	return json(toPublic(quiz));
};

export const POST: RequestHandler = async ({ params, request }) => {
	const db = openDb(process.env.ARENA_DB ?? ":memory:");
	const out = gradeQuiz(db, params.id ?? "", await request.json().catch(() => null));
	if (out.verdict === "error") {
		const status = out.reason === "QuizMissing" ? 404 : 422;
		return json(out, { status });
	}
	return json(out, { status: out.verdict === "pass" ? 201 : 200 });
};
