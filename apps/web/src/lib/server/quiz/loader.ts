// Quiz loader (data > code): reads + validates every quiz yaml at request time.
// Fail-closed: bad file → greyed + log line, never 500. Answers live here
// server-side only; the GET endpoint strips them before responding.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";
import { z } from "zod";
import { contentDir } from "$lib/server/paths.js";

const QuestionSchema = z.object({
	id: z.string(),
	q: z.string(),
	choices: z.array(z.string()).length(4),
	answer: z.number().int().min(0).max(3),
	points: z.number().positive(),
	severity: z.enum(["Critical", "High", "Medium", "Low"]),
	explain: z.string(),
	review: z.string()
});

const QuizSchema = z.object({
	id: z.string(),
	lesson: z.string(),
	points_total: z.number().positive(),
	questions: z.array(QuestionSchema).min(2).max(4)
});

export type Quiz = z.infer<typeof QuizSchema>;

export function quizzesDir(): string {
	return join(contentDir(), "quizzes");
}

/** Load + cross-validate every quiz: schema, points sum, lesson file exists. */
export function loadQuizzes(dir: string = quizzesDir()): { quizzes: Quiz[]; greyed: string[] } {
	const quizzes: Quiz[] = [];
	const greyed: string[] = [];
	let files: string[] = [];
	try {
		files = readdirSync(dir);
	} catch {
		return { quizzes, greyed: ["quizzes-dir-missing"] };
	}
	for (const f of files) {
		if (!f.endsWith(".yaml")) continue;
		try {
			const parsed = QuizSchema.parse(yaml.load(readFileSync(join(dir, f), "utf8")));
			const sum = parsed.questions.reduce((n, q) => n + q.points, 0);
			if (sum !== parsed.points_total) throw new Error(`points_total ${parsed.points_total} != sum ${sum}`);
			if (!existsSync(join(contentDir(), "lessons", `${parsed.lesson}.md`))) {
				throw new Error(`lesson missing: ${parsed.lesson}.md`);
			}
			quizzes.push(parsed);
		} catch (e) {
			greyed.push(f);
			console.warn(`quiz greyed: ${f}: ${(e as Error).message.split("\n")[0]}`);
		}
	}
	return { quizzes, greyed };
}

/** Public shape: everything except answer/explain (never shipped to clients). */
export function toPublic(q: Quiz) {
	return {
		id: q.id,
		lesson: q.lesson,
		points_total: q.points_total,
		questions: q.questions.map(({ id, q: text, choices, points, severity }) => ({
			id,
			q: text,
			choices,
			points,
			severity
		}))
	};
}
