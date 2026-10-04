import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import { z } from "zod";
import { readdirSync } from "node:fs";
import { openDb } from "$lib/server/db/client.js";
import { contentDir } from "$lib/server/paths.js";
import { join } from "node:path";

// Mark a lesson done for a nickname (F3.4 "lessons done"). Identity = claimed
// nickname only (F3.1: no passwords/OAuth). Idempotent: re-marking is a no-op.
// Lesson must exist in content/lessons (fail-closed, never free text).
const LessonInput = z.object({
	nickname: z.string().min(1).max(32),
	lesson: z.string().min(1).max(64)
});

export const POST: RequestHandler = async ({ request }) => {
	const db = openDb(process.env.ARENA_DB ?? ":memory:");
	const parsed = LessonInput.safeParse(await request.json().catch(() => null));
	// Read at request time (never module top-level): SvelteKit imports every
	// endpoint during the build analyse phase, where content paths don't exist.
	const knownLessons = readdirSync(join(contentDir(), "lessons"))
		.filter((f) => f.endsWith(".md"))
		.map((f) => f.replace(/\.md$/, ""));
	if (!parsed.success || !knownLessons.includes(parsed.data.lesson)) {
		return json({ error: "BadInput", action: "nickname + known lesson id" }, { status: 422 });
	}
	const { nickname, lesson } = parsed.data;
	db.prepare("INSERT OR IGNORE INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
		nickname,
		null,
		new Date().toISOString()
	);
	db.prepare("INSERT OR IGNORE INTO lesson_completions(nickname, lesson, at) VALUES(?,?,?)").run(
		nickname,
		lesson,
		new Date().toISOString()
	);
	return json({ nickname, lesson, done: true }, { status: 201 });
};
