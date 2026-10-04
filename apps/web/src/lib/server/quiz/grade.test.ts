import { describe, expect, it } from "vitest";
import { openDb } from "$lib/server/db/client.js";
import { loadQuizzes } from "$lib/server/quiz/loader.js";
import { gradeQuiz } from "$lib/server/quiz/grade.js";

// Grading gate: server-side only, wrong → fail-with-action (never the letter,
// never a pass), right → pass + solve row on the existing board path.
describe("POST /api/quiz/[id]", () => {
	it("fails a wrong answer with action and writes no solve", () => {
		const db = openDb(":memory:");
		const { quizzes } = loadQuizzes();
		const quiz = quizzes.find((q) => q.id === "quiz-101")!;
		const wrong = quiz.questions.map((q) => (q.answer + 1) % 4);
		const out = gradeQuiz(db, "quiz-101", { nickname: "jovan", answers: wrong });
		expect(out.verdict).toBe("fail");
		expect((out as { action: string }).action).toMatch(/Read lesson 101-accounts-signer/);
		const solves = db.prepare("SELECT * FROM solves").all();
		expect(solves).toEqual([]);
	});

	it("passes full-correct, awards points on the board path, idempotent on resubmit", () => {
		const db = openDb(":memory:");
		const { quizzes } = loadQuizzes();
		const quiz = quizzes.find((q) => q.id === "quiz-101")!;
		const right = quiz.questions.map((q) => q.answer);
		const out = gradeQuiz(db, "quiz-101", { nickname: "jovan", answers: right });
		expect(out).toEqual({ verdict: "pass", points: quiz.points_total });
		const again = gradeQuiz(db, "quiz-101", { nickname: "jovan", answers: right });
		expect(again.verdict).toBe("pass");
		const rows = db.prepare("SELECT room, points FROM solves").all();
		expect(rows).toEqual([{ room: "quiz-101", points: quiz.points_total }]);
		const board = db
			.prepare("SELECT SUM(points) AS total FROM solves GROUP BY user")
			.get() as { total: number };
		expect(board.total).toBe(quiz.points_total);
	});

	it("rejects unknown quizzes and short payloads without grading", () => {
		const db = openDb(":memory:");
		expect(gradeQuiz(db, "quiz-999", { nickname: "jovan", answers: [0, 0, 0] })).toEqual({
			verdict: "error",
			reason: "QuizMissing",
			action: "pick a quiz from a lesson page"
		});
		expect(gradeQuiz(db, "quiz-101", { nickname: "jovan", answers: [0, 0] })).toEqual({
			verdict: "error",
			reason: "BadInput",
			action: "answer every question (3 choices expected)"
		});
	});
});
