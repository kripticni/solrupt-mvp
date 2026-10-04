import { j as json } from './index-C5EvGOh5.js';
import { o as openDb } from './client-CZrn9TuC.js';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';
import { c as contentDir } from './paths-BVo4bQLA.js';
import { o as objectType, a as arrayType, n as numberType, s as stringType, e as enumType } from './types-YoPt2-1h.js';
import 'node:sqlite';
import 'node:url';

const QuestionSchema = objectType({
  id: stringType(),
  q: stringType(),
  choices: arrayType(stringType()).length(4),
  answer: numberType().int().min(0).max(3),
  points: numberType().positive(),
  severity: enumType(["Critical", "High", "Medium", "Low"]),
  explain: stringType(),
  review: stringType()
});
const QuizSchema = objectType({
  id: stringType(),
  lesson: stringType(),
  points_total: numberType().positive(),
  questions: arrayType(QuestionSchema).min(2).max(4)
});
function quizzesDir() {
  return join(contentDir(), "quizzes");
}
function loadQuizzes(dir = quizzesDir()) {
  const quizzes = [];
  const greyed = [];
  let files = [];
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
      console.warn(`quiz greyed: ${f}: ${e.message.split("\n")[0]}`);
    }
  }
  return { quizzes, greyed };
}
function toPublic(q) {
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
const QuizSubmit = objectType({
  nickname: stringType().min(1).max(32),
  answers: arrayType(numberType().int().min(0).max(3)).min(2).max(4)
});
function gradeQuiz(db, quizId, raw) {
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
    (/* @__PURE__ */ new Date()).toISOString()
  );
  const firstWrong = quiz.questions.findIndex((q, i) => answers[i] !== q.answer);
  if (firstWrong >= 0) {
    const q = quiz.questions[firstWrong];
    return {
      verdict: "fail",
      action: `question ${firstWrong + 1} missed. Re-read lesson ${quiz.lesson} "${q.review}" and retry`
    };
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  db.prepare("INSERT OR IGNORE INTO solves(user, room, points, first_at) VALUES(?,?,?,?)").run(
    nickname,
    quiz.id,
    quiz.points_total,
    now
  );
  db.prepare("INSERT OR IGNORE INTO lesson_completions(nickname, lesson, at) VALUES(?,?,?)").run(
    nickname,
    quiz.lesson,
    now
  );
  return { verdict: "pass", points: quiz.points_total };
}
const GET = async ({ params }) => {
  const { quizzes } = loadQuizzes();
  const quiz = quizzes.find((q) => q.id === params.id);
  if (!quiz) return json({ error: "QuizMissing", action: "pick a quiz from a lesson page" }, { status: 404 });
  return json(toPublic(quiz));
};
const POST = async ({ params, request }) => {
  const db = openDb(process.env.ARENA_DB ?? ":memory:");
  const out = gradeQuiz(db, params.id ?? "", await request.json().catch(() => null));
  if (out.verdict === "error") {
    const status = out.reason === "QuizMissing" ? 404 : 422;
    return json(out, { status });
  }
  return json(out, { status: out.verdict === "pass" ? 201 : 200 });
};

export { GET, POST };
//# sourceMappingURL=_server.ts-vo8It_xx.js.map
