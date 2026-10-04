import { describe, expect, it } from "vitest";
import { loadQuizzes, toPublic } from "$lib/server/quiz/loader.js";

// Loader gate: every quiz yaml parses, cross-checks hold, and the public
// shape never carries answers.
describe("quiz loader", () => {
	it("every quiz parses with 2-4 severity-labeled questions and sound points", () => {
		const { quizzes, greyed } = loadQuizzes();
		expect(greyed).toEqual([]);
		expect(quizzes.length).toBeGreaterThanOrEqual(3);
		for (const q of quizzes) {
			expect(q.questions.length).toBeGreaterThanOrEqual(2);
			expect(q.questions.length).toBeLessThanOrEqual(4);
			const sum = q.questions.reduce((n, c) => n + c.points, 0);
			expect(sum).toBe(q.points_total);
			for (const c of q.questions) {
				expect(c.choices).toHaveLength(4);
				expect(c.answer).toBeGreaterThanOrEqual(0);
				expect(c.answer).toBeLessThanOrEqual(3);
				expect(["Critical", "High", "Medium", "Low"]).toContain(c.severity);
			}
		}
	});

	it("public shape strips answer and explain", () => {
		const { quizzes } = loadQuizzes();
		for (const q of quizzes) {
			const pub = toPublic(q) as { questions: Record<string, unknown>[] };
			for (const c of pub.questions) {
				expect("answer" in c).toBe(false);
				expect("explain" in c).toBe(false);
			}
		}
	});
});
