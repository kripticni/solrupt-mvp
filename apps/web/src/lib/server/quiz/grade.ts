// Quiz grading (Q&A checks): answers graded SERVER-SIDE only. Pure and
// testable; the endpoint is a thin wrapper. Fail-closed: no quiz, no user,
// no full-correct may ever produce a pass. Wrong answers return
// fail with action naming the lesson section to read again, never the letter.
// Passes feed the EXISTING solves/board path (room = quiz id), progress
// display only, zero hiring language.
import { z } from "zod";
import type { DatabaseSync } from "node:sqlite";
import { loadQuizzes } from "$lib/server/quiz/loader.js";

export const QuizSubmit = z.object({
	nickname: z.string().min(1).max(32),
	answers: z.array(z.number().int().min(0).max(3)).min(2).max(4)
});

export interface GradePass {
	verdict: "pass";
	points: number;
}

export interface GradeFail {
	verdict: "fail";
	action: string;
}

export interface GradeErr {
	verdict: "error";
	reason: "QuizMissing" | "BadInput";
	action: string;
}

export function gradeQuiz(db: DatabaseSync, quizId: string, raw: unknown): GradePass | GradeFail | GradeErr {
	const parsed = QuizSubmit.safeParse(raw);
	if (!parsed.success) {
		return { verdict: "error", reason: "BadInput", action: "send a nickname and one choice per question" };
	}
	const { quizzes } = loadQuizzes();
	const quiz = quizzes.find((q) => q.id === quizId);
	if (!quiz) {
		return { verdict: "error", reason: "QuizMissing", action: "pick a quiz from a lesson page" };
	}
	const { nickname, answers } = parsed.data;
	if (answers.length !== quiz.questions.length) {
		return {
			verdict: "error",
			reason: "BadInput",
			action: `answer every question (${quiz.questions.length} choices expected)`
		};
	}
	db.prepare("INSERT OR IGNORE INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
		nickname,
		null,
		new Date().toISOString()
	);
	const firstWrong = quiz.questions.findIndex((q, i) => answers[i] !== q.answer);
	if (firstWrong >= 0) {
		const q = quiz.questions[firstWrong];
		return {
			verdict: "fail",
			action: `question ${firstWrong + 1} missed. Read lesson ${quiz.lesson} "${q.review}" once more and retry`
		};
	}
	const now = new Date().toISOString();
	db.prepare("INSERT OR IGNORE INTO solves(user, room, points, first_at) VALUES(?,?,?,?)").run(
		nickname,
		quiz.id,
		quiz.points_total,
		now
	);
	// Quiz pass marks the lesson done (single source of truth for F3.4
	// "lessons done": completion means demonstrated knowledge, not a click).
	db.prepare("INSERT OR IGNORE INTO lesson_completions(nickname, lesson, at) VALUES(?,?,?)").run(
		nickname,
		quiz.lesson,
		now
	);
	return { verdict: "pass", points: quiz.points_total };
}
