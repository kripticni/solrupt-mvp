import { j as json } from './index-C5EvGOh5.js';
import { readdirSync } from 'node:fs';
import { o as openDb } from './client-CZrn9TuC.js';
import { c as contentDir } from './paths-BVo4bQLA.js';
import { join } from 'node:path';
import { o as objectType, s as stringType } from './types-YoPt2-1h.js';
import 'node:sqlite';
import 'node:url';

const LessonInput = objectType({
  nickname: stringType().min(1).max(32),
  lesson: stringType().min(1).max(64)
});
const POST = async ({ request }) => {
  const db = openDb(process.env.ARENA_DB ?? ":memory:");
  const parsed = LessonInput.safeParse(await request.json().catch(() => null));
  const knownLessons = readdirSync(join(contentDir(), "lessons")).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
  if (!parsed.success || !knownLessons.includes(parsed.data.lesson)) {
    return json({ error: "BadInput", action: "nickname + known lesson id" }, { status: 422 });
  }
  const { nickname, lesson } = parsed.data;
  db.prepare("INSERT OR IGNORE INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
    nickname,
    null,
    (/* @__PURE__ */ new Date()).toISOString()
  );
  db.prepare("INSERT OR IGNORE INTO lesson_completions(nickname, lesson, at) VALUES(?,?,?)").run(
    nickname,
    lesson,
    (/* @__PURE__ */ new Date()).toISOString()
  );
  return json({ nickname, lesson, done: true }, { status: 201 });
};

export { POST };
//# sourceMappingURL=_server.ts-SJBF8knw.js.map
