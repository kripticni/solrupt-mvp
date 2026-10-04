import { j as json } from './index-C5EvGOh5.js';
import { o as openDb } from './client-CZrn9TuC.js';
import { o as objectType, s as stringType } from './types-YoPt2-1h.js';
import 'node:sqlite';
import 'node:fs';
import './paths-BVo4bQLA.js';
import 'node:path';
import 'node:url';

const LessonInput = objectType({
  nickname: stringType().min(1).max(32),
  lesson: stringType().min(1).max(64)
});
const KNOWN_LESSONS = ["101-accounts-signer", "102-owner-pda"];
const POST = async ({ request }) => {
  const db = openDb(process.env.ARENA_DB ?? ":memory:");
  const parsed = LessonInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !KNOWN_LESSONS.includes(parsed.data.lesson)) {
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
//# sourceMappingURL=_server.ts-B99YAyFf.js.map
