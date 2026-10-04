// P-SEED (19): clean-state repro — wipes tables → demo nicknames/rooms metadata →
// counts. Idempotent: run twice = same state, no dupes (UNIQUE + delete-then-insert).
// `.so` digests verified against the pinned value in each room yaml (UNBUILT =
// loud warning, digest mismatch = hard failure).
// Usage: node seed.ts (Node 22) from mvp/.
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MVP = dirname(fileURLToPath(import.meta.url));

const db = new DatabaseSync(process.env.ARENA_DB ?? ":memory:");
db.exec("PRAGMA journal_mode=WAL;");
db.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));

const demoUsers = ["jovan", "ognjen", "lazar"];
for (const nick of demoUsers) {
	db.prepare("INSERT OR IGNORE INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
		nick,
		null,
		new Date().toISOString()
	);
}

const rooms = ["l1-signer", "l2-owner", "l3-cpi", "l4-cosplay", "l5-match", "l6-vault", "l7-overflow"];
for (const room of rooms) {
	const yaml = readFileSync(new URL(`./content/rooms/${room}.yaml`, import.meta.url), "utf8");
	const digest = yaml.split("\n").find((l) => l.trim().startsWith("so_digest:"))?.split("so_digest:")[1].trim().split(/\s/)[0] ?? "UNBUILT";
	const soRel = yaml.split("\n").find((l) => l.trim().startsWith("so:"))?.split("so:")[1].trim().split(/\s/)[0];
	if (!digest || digest === "UNBUILT" || !soRel || soRel === "UNBUILT") {
		console.warn(`WARN: ${room} .so UNBUILT — digest verification deferred`);
	} else {
		const soPath = join(MVP, soRel);
		if (!existsSync(soPath)) throw new Error(`seed: ${room} .so missing at ${soRel}`);
		const actual = createHash("sha256").update(readFileSync(soPath)).digest("hex");
		if (actual !== digest) {
			throw new Error(`seed: ${room} .so digest mismatch (file ${actual} != pin ${digest})`);
		}
		console.log(`SEED-VERIFY ${room} .so sha256=${actual.slice(0, 12)}… ok`);
	}
	db.prepare("DELETE FROM search_fts WHERE ref = ?").run(room);
	db.prepare("INSERT INTO search_fts(title, body, kind, ref) VALUES(?,?,?,?)").run(
		room,
		yaml.slice(0, 4000),
		"room",
		room
	);
}

const lessonFiles = readdirSync(new URL("./content/lessons/", import.meta.url)).filter((f) =>
	f.endsWith(".md")
);
for (const file of lessonFiles) {
	const ref = file.replace(/\.md$/, "");
	const body = readFileSync(new URL(`./content/lessons/${file}`, import.meta.url), "utf8");
	const title = body.split("\n").find((l) => l.startsWith("# "))?.replace(/^# /, "") ?? ref;
	db.prepare("DELETE FROM search_fts WHERE ref = ?").run(ref);
	db.prepare("INSERT INTO search_fts(title, body, kind, ref) VALUES(?,?,?,?)").run(
		title,
		body.slice(0, 4000),
		"lesson",
		ref
	);
}

const users = (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
const docs = (db.prepare("SELECT COUNT(*) AS n FROM search_fts").get() as { n: number }).n;
console.log(`SEED users=${users} docs=${docs}`);
if (users !== demoUsers.length || docs !== rooms.length + lessonFiles.length) {
	throw new Error("seed counts mismatch — not idempotent");
}
