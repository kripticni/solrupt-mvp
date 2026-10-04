-- P0.2 schema (idempotent re-run; scope mvp-scope-2026-10-03 §4b + 19 §4.5).
-- The SQLite file IS the production database (P0.10): no migrations, back up by copy.
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS users (
	nickname TEXT PRIMARY KEY,
	wallet TEXT NULL,
	created TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
	uuid TEXT PRIMARY KEY,
	user TEXT NOT NULL REFERENCES users(nickname),
	room TEXT NOT NULL,
	created TEXT NOT NULL,
	expires TEXT NOT NULL,
	reaped INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS attempts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	session TEXT NOT NULL REFERENCES sessions(uuid),
	code_hash TEXT NOT NULL,
	verdict TEXT NOT NULL,
	at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hints_used (
	session TEXT NOT NULL REFERENCES sessions(uuid),
	hint_n INTEGER NOT NULL,
	PRIMARY KEY (session, hint_n)
);

CREATE TABLE IF NOT EXISTS solves (
	user TEXT NOT NULL REFERENCES users(nickname),
	room TEXT NOT NULL,
	points INTEGER NOT NULL,
	first_at TEXT NOT NULL,
	PRIMARY KEY (user, room)
);

CREATE TABLE IF NOT EXISTS findings (
	user TEXT NOT NULL REFERENCES users(nickname),
	room TEXT NOT NULL,
	severity TEXT NOT NULL,
	proof TEXT NOT NULL,
	fix TEXT NOT NULL,
	solver_hash TEXT NOT NULL UNIQUE,
	at TEXT NOT NULL,
	attempts INTEGER NOT NULL DEFAULT 0,
	hints_used INTEGER NOT NULL DEFAULT 0
); -- attempts/hints_used frozen at mint: the public proof recomputes the transcript exactly (19 §4.4); live counts would drift after mint. Proposed S5-lock amendment to P0.2.

-- F3.4 lesson tracking (proposed S5-lock amendment): one row per nickname per
-- lesson completed (quizzes land here post-H02; lesson-page "mark done" now).
CREATE TABLE IF NOT EXISTS lesson_completions (
	nickname TEXT NOT NULL REFERENCES users(nickname),
	lesson TEXT NOT NULL,
	at TEXT NOT NULL,
	PRIMARY KEY (nickname, lesson)
);

-- F1.5 search: FTS5 over rooms + lessons, diacritic-insensitive (house style).
CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
	title, body, kind, ref,
	tokenize = "unicode61 remove_diacritics 2"
);
