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

const demoUsers = [
	"jovan",
	"ognjen",
	"lazar",
	"0xreaper",
	"signer_slayer",
	"cpi_ghost",
	"pda_pirate",
	"vault_drainer",
	"type_spoofer",
	"overflow_owl",
	"deputy_dodger",
	"lamport_leecher",
	"anchor_breaker"
];
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
// Live DBs may hold real claimed nicknames beside the demo users: gate on the
// demo users being present (fail-closed for clean-state repro), never on an
// exact user count — an extra real user must not block reseeding demo history.
const missingDemo = demoUsers.filter(
	(nick) => !db.prepare("SELECT 1 FROM users WHERE nickname = ?").get(nick)
);
if (missingDemo.length > 0 || docs !== rooms.length + lessonFiles.length) {
	throw new Error("seed counts mismatch — not idempotent");
}

// Demo solver history (S8 jury walkthrough): deterministic solves + findings
// for the demo users so /board + /profile/* + /proof/* render full records
// after every reseed. Fixed stamps → fixed hashes → INSERT OR IGNORE =
// idempotent. Demo sessions carry `demo-` uuids so evidence queries exclude
// them (WHERE uuid NOT LIKE 'demo-%'). Findings text ends with an explicit
// demo marker: seeded records must never read as live solves.
// NOTE (duplication ledger): the transcript builder below is the 2nd copy of
// the canonical builder in apps/web/src/lib/server/proof/transcript.ts.
// Kept inline because seed.ts runs under plain node across the TS boundary.
// Consolidate (shared JS fixture) on the 3rd copy, not before.
const PROOF_DOMAIN = "arena/proof/v1";
const VERIFIER_PIN = "litesvm-npm-1.5.0"; // must match transcript.ts; a pin bump 410s seeded proofs (loud, intended)
function tfield(s: string): string {
	return `${s.length}:${s}`;
}
function demoTranscript(f: {
	solver: string;
	room: string;
	code_digest: string;
	attempts: number;
	hints_used: number;
	started_at: string;
	solved_at: string;
}): string {
	return [
		PROOF_DOMAIN,
		tfield(f.solver),
		tfield(f.room),
		tfield(f.code_digest),
		tfield(VERIFIER_PIN),
		tfield(String(f.attempts)),
		tfield(String(f.hints_used)),
		tfield(f.started_at),
		tfield(f.solved_at)
	].join("|");
}
const DEMO_MARK = "Seeded demo record for the jury walkthrough, not a live solve.";
interface DemoSolve {
	user: string;
	room: string;
	points: number;
	severity: string;
	proof: string;
	fix: string;
	started: string;
	solved: string;
	lessons: string[];
}
const demoSolves: DemoSolve[] = [
	{
		user: "ognjen",
		room: "l1-signer",
		points: 100,
		severity: "High",
		proof:
			"The withdraw handler never checks the signer flag, so an unsigned account drains the vault. " +
			"Reproduced locally: unsigned withdraw of 10000000 lamports passes. " +
			DEMO_MARK,
		fix: "Constrain the authority to a signer: check the signer flag before debiting the vault.",
		started: "2026-10-03T12:40:00.000Z",
		solved: "2026-10-03T13:00:00.000Z",
		lessons: ["101-accounts-signer"]
	},
	{
		user: "jovan",
		room: "l1-signer",
		points: 100,
		severity: "High",
		proof:
			"Missing signer check on withdraw lets any caller move vault funds without a signature. " +
			"Unsigned call moved 10000000 lamports in the local run. " +
			DEMO_MARK,
		fix: "Require the authority account to sign the withdraw instruction.",
		started: "2026-10-03T14:00:00.000Z",
		solved: "2026-10-03T14:20:00.000Z",
		lessons: ["101-accounts-signer", "102-owner-pda"]
	},
	{
		user: "jovan",
		room: "l2-owner",
		points: 250,
		severity: "Critical",
		proof:
			"The vault accepts an account with any owner field, so a forged account passes the check. " +
			"Spoofed owner account read vault state in the local run. " +
			DEMO_MARK,
		fix: "Verify the account owner matches the program id before trusting its data.",
		started: "2026-10-03T14:50:00.000Z",
		solved: "2026-10-03T15:10:00.000Z",
		lessons: []
	},
	{
		user: "lazar",
		room: "l1-signer",
		points: 100,
		severity: "Medium",
		proof:
			"Withdraw does not verify a signature from the authority, so unsigned drains succeed. " +
			"Confirmed with an unsigned exploit in the local run. " +
			DEMO_MARK,
		fix: "Add a signer constraint on the authority account in withdraw.",
		started: "2026-10-03T15:45:00.000Z",
		solved: "2026-10-03T16:05:00.000Z",
		lessons: ["101-accounts-signer", "102-owner-pda"]
	},
	{
		user: "0xreaper",
		room: "l1-signer",
		points: 100,
		severity: "High",
		proof:
			"Withdraw skips the signer check entirely, so a crafted unsigned instruction empties the vault. " +
			"Unsigned drain of 10000000 lamports reproduced locally. " +
			DEMO_MARK,
		fix: "Gate withdraw behind a signer check on the authority account.",
		started: "2026-10-03T16:40:00.000Z",
		solved: "2026-10-03T17:00:00.000Z",
		lessons: ["101-accounts-signer"]
	},
	{
		user: "0xreaper",
		room: "l2-owner",
		points: 250,
		severity: "Critical",
		proof:
			"Owner field is trusted without verification, so a forged account with a spoofed owner reads vault state. " +
			"Forged-owner read reproduced locally. " +
			DEMO_MARK,
		fix: "Compare the account owner against the expected program id before use.",
		started: "2026-10-03T17:05:00.000Z",
		solved: "2026-10-03T17:25:00.000Z",
		lessons: []
	},
	{
		user: "0xreaper",
		room: "l3-cpi",
		points: 200,
		severity: "High",
		proof:
			"The CPI path never verifies the deputy signer, so a forged cross-program call runs with vault authority. " +
			"Malicious CPI executed locally. " +
			DEMO_MARK,
		fix: "Verify the deputy signature on every cross-program invocation.",
		started: "2026-10-03T17:30:00.000Z",
		solved: "2026-10-03T17:50:00.000Z",
		lessons: ["103-cpi-deputy"]
	},
	{
		user: "0xreaper",
		room: "l4-cosplay",
		points: 300,
		severity: "Critical",
		proof:
			"Account type is never validated, so an account of one type passes where another is expected. " +
			"Type confusion reproduced with a swapped account. " +
			DEMO_MARK,
		fix: "Validate the account discriminator before trusting its layout.",
		started: "2026-10-03T17:50:00.000Z",
		solved: "2026-10-03T18:10:00.000Z",
		lessons: []
	},
	{
		user: "0xreaper",
		room: "l5-match",
		points: 200,
		severity: "High",
		proof:
			"Related accounts are never matched to each other, so a mismatched pair sails through validation. " +
			"Mismatched pair accepted locally. " +
			DEMO_MARK,
		fix: "Cross-check that paired accounts reference each other explicitly.",
		started: "2026-10-03T18:10:00.000Z",
		solved: "2026-10-03T18:30:00.000Z",
		lessons: []
	},
	{
		user: "0xreaper",
		room: "l6-vault",
		points: 100,
		severity: "Medium",
		proof:
			"The vault release path skips its cap check, so funds above the limit flow out. " +
			"Over-cap release reproduced locally. " +
			DEMO_MARK,
		fix: "Enforce the vault cap before every release of funds.",
		started: "2026-10-03T18:30:00.000Z",
		solved: "2026-10-03T18:50:00.000Z",
		lessons: []
	},
	{
		user: "0xreaper",
		room: "l7-overflow",
		points: 250,
		severity: "High",
		proof:
			"Book-balance arithmetic wraps unchecked, so withdrawing one more than exists succeeds. " +
			"Overflow withdraw reproduced locally. " +
			DEMO_MARK,
		fix: "Use checked arithmetic on balances and reject on overflow.",
		started: "2026-10-03T18:50:00.000Z",
		solved: "2026-10-03T19:10:00.000Z",
		lessons: ["107-overflow-math"]
	},
	{
		user: "signer_slayer",
		room: "l2-owner",
		points: 250,
		severity: "High",
		proof:
			"The owner check compares against attacker-controlled data instead of the program id. " +
			"Spoofed owner accepted locally. " +
			DEMO_MARK,
		fix: "Pin the expected owner to the program id constant, never to input.",
		started: "2026-10-03T16:45:00.000Z",
		solved: "2026-10-03T17:05:00.000Z",
		lessons: []
	},
	{
		user: "signer_slayer",
		room: "l3-cpi",
		points: 200,
		severity: "High",
		proof:
			"Deputy authority is assumed from account order rather than verified, so a reordered CPI call escalates. " +
			"Reordered call executed locally. " +
			DEMO_MARK,
		fix: "Resolve deputy authority by verified signer, never by position.",
		started: "2026-10-03T16:50:00.000Z",
		solved: "2026-10-03T17:10:00.000Z",
		lessons: ["103-cpi-deputy"]
	},
	{
		user: "signer_slayer",
		room: "l4-cosplay",
		points: 300,
		severity: "Critical",
		proof:
			"A forged account with the right size but wrong type passes every gate in the handler. " +
			"Wrong-type account accepted locally. " +
			DEMO_MARK,
		fix: "Check the type tag first; size checks alone prove nothing.",
		started: "2026-10-03T18:00:00.000Z",
		solved: "2026-10-03T18:20:00.000Z",
		lessons: []
	},
	{
		user: "signer_slayer",
		room: "l6-vault",
		points: 100,
		severity: "Medium",
		proof:
			"Release path trusts a caller-supplied amount over the capped balance. " +
			"Inflated release reproduced locally. " +
			DEMO_MARK,
		fix: "Clamp every release to the capped vault balance.",
		started: "2026-10-03T18:35:00.000Z",
		solved: "2026-10-03T18:55:00.000Z",
		lessons: []
	},
	{
		user: "signer_slayer",
		room: "l7-overflow",
		points: 250,
		severity: "High",
		proof:
			"Deposit accounting overflows silently, crediting funds that were never locked. " +
			"Overflow credit reproduced locally. " +
			DEMO_MARK,
		fix: "Check arithmetic on all deposit and balance paths.",
		started: "2026-10-03T19:00:00.000Z",
		solved: "2026-10-03T19:20:00.000Z",
		lessons: []
	},
	{
		user: "cpi_ghost",
		room: "l1-signer",
		points: 100,
		severity: "Medium",
		proof:
			"No signature is required to call withdraw, so anyone can trigger a drain. " +
			"Unauthorized withdraw reproduced locally. " +
			DEMO_MARK,
		fix: "Demand a signer on the withdraw authority.",
		started: "2026-10-03T16:00:00.000Z",
		solved: "2026-10-03T16:20:00.000Z",
		lessons: ["101-accounts-signer"]
	},
	{
		user: "cpi_ghost",
		room: "l3-cpi",
		points: 200,
		severity: "Medium",
		proof:
			"The invoked program id is taken from an unverified account, so the call lands on attacker code. " +
			"Redirected CPI reproduced locally. " +
			DEMO_MARK,
		fix: "Hardcode the callee program id; never read it from accounts.",
		started: "2026-10-03T17:10:00.000Z",
		solved: "2026-10-03T17:30:00.000Z",
		lessons: []
	},
	{
		user: "cpi_ghost",
		room: "l4-cosplay",
		points: 300,
		severity: "High",
		proof:
			"Type confusion between user and admin accounts grants admin-only paths to anyone. " +
			"Escalation reproduced locally. " +
			DEMO_MARK,
		fix: "Separate account types with distinct discriminators and check them.",
		started: "2026-10-03T16:10:00.000Z",
		solved: "2026-10-03T16:30:00.000Z",
		lessons: []
	},
	{
		user: "cpi_ghost",
		room: "l7-overflow",
		points: 250,
		severity: "Medium",
		proof:
			"Balance subtraction underflows on empty books, minting phantom funds. " +
			"Underflow reproduced locally. " +
			DEMO_MARK,
		fix: "Guard every subtraction with an explicit balance check.",
		started: "2026-10-03T19:10:00.000Z",
		solved: "2026-10-03T19:30:00.000Z",
		lessons: []
	},
	{
		user: "pda_pirate",
		room: "l1-signer",
		points: 100,
		severity: "Medium",
		proof:
			"Authority is identified by key alone with no signer flag, so a watched key can be replayed by anyone. " +
			"Replay drain reproduced locally. " +
			DEMO_MARK,
		fix: "Bind authority to a live signature, not just a known key.",
		started: "2026-10-03T16:20:00.000Z",
		solved: "2026-10-03T16:40:00.000Z",
		lessons: []
	},
	{
		user: "pda_pirate",
		room: "l2-owner",
		points: 250,
		severity: "High",
		proof:
			"PDA derivation is skipped and the raw address trusted, so a lookalike account is accepted. " +
			"Lookalike account accepted locally. " +
			DEMO_MARK,
		fix: "Re-derive the PDA onchain and compare before trusting.",
		started: "2026-10-03T16:55:00.000Z",
		solved: "2026-10-03T17:15:00.000Z",
		lessons: ["102-owner-pda"]
	},
	{
		user: "pda_pirate",
		room: "l6-vault",
		points: 100,
		severity: "Medium",
		proof:
			"Cap state lives in an account anyone can rewrite, so the limit is decorative. " +
			"Rewritten cap exploited locally. " +
			DEMO_MARK,
		fix: "Store the cap in program-owned state and verify ownership.",
		started: "2026-10-03T18:40:00.000Z",
		solved: "2026-10-03T19:00:00.000Z",
		lessons: []
	},
	{
		user: "pda_pirate",
		room: "l7-overflow",
		points: 250,
		severity: "Low",
		proof:
			"Off-by-one on the overflow boundary lets a max-value deposit wrap to zero and bypass limits. " +
			"Boundary wrap reproduced locally. " +
			DEMO_MARK,
		fix: "Test boundary values explicitly with checked math.",
		started: "2026-10-03T19:20:00.000Z",
		solved: "2026-10-03T19:40:00.000Z",
		lessons: []
	},
	{
		user: "vault_drainer",
		room: "l2-owner",
		points: 250,
		severity: "High",
		proof:
			"Owner check happens after the state-changing call instead of before it. " +
			"Time-of-check gap exploited locally. " +
			DEMO_MARK,
		fix: "Validate ownership before any state change, never after.",
		started: "2026-10-03T17:15:00.000Z",
		solved: "2026-10-03T17:35:00.000Z",
		lessons: []
	},
	{
		user: "vault_drainer",
		room: "l5-match",
		points: 200,
		severity: "Critical",
		proof:
			"Paired vault accounts are used without confirming they belong together, so a mixed pair drains the wrong vault. " +
			"Mixed pair accepted locally. " +
			DEMO_MARK,
		fix: "Assert both accounts in a pair reference the same vault.",
		started: "2026-10-03T15:40:00.000Z",
		solved: "2026-10-03T16:00:00.000Z",
		lessons: ["105-data-matching"]
	},
	{
		user: "type_spoofer",
		room: "l3-cpi",
		points: 200,
		severity: "High",
		proof:
			"CPI return data is trusted without checking which program produced it. " +
			"Spoofed return data accepted locally. " +
			DEMO_MARK,
		fix: "Verify the callee id before trusting any returned data.",
		started: "2026-10-03T17:35:00.000Z",
		solved: "2026-10-03T17:55:00.000Z",
		lessons: ["104-type-cosplay"]
	},
	{
		user: "type_spoofer",
		room: "l4-cosplay",
		points: 300,
		severity: "High",
		proof:
			"A single handler serves two account types with no branch on the discriminator. " +
			"Cross-type call succeeded locally. " +
			DEMO_MARK,
		fix: "Split handlers per type or branch hard on the discriminator.",
		started: "2026-10-03T18:10:00.000Z",
		solved: "2026-10-03T18:30:00.000Z",
		lessons: []
	},
	{
		user: "overflow_owl",
		room: "l1-signer",
		points: 100,
		severity: "Medium",
		proof:
			"The signer check exists but reads the wrong account index, so it guards nothing. " +
			"Misindexed check bypassed locally. " +
			DEMO_MARK,
		fix: "Index the authority account explicitly and test the negative case.",
		started: "2026-10-03T16:30:00.000Z",
		solved: "2026-10-03T16:50:00.000Z",
		lessons: []
	},
	{
		user: "overflow_owl",
		room: "l3-cpi",
		points: 200,
		severity: "Medium",
		proof:
			"Remaining-accounts CPI input is unbounded, so extra attacker accounts ride along. " +
			"Injected account rode along locally. " +
			DEMO_MARK,
		fix: "Whitelist the exact remaining accounts a CPI may carry.",
		started: "2026-10-03T17:45:00.000Z",
		solved: "2026-10-03T18:05:00.000Z",
		lessons: []
	},
	{
		user: "overflow_owl",
		room: "l6-vault",
		points: 100,
		severity: "High",
		proof:
			"The cap is enforced in one instruction but not in the aliased withdraw path. " +
			"Alias path drained over cap locally. " +
			DEMO_MARK,
		fix: "Route every fund-moving path through the same cap check.",
		started: "2026-10-03T15:50:00.000Z",
		solved: "2026-10-03T16:10:00.000Z",
		lessons: ["106-vault-capstone"]
	},
	{
		user: "deputy_dodger",
		room: "l7-overflow",
		points: 250,
		severity: "Critical",
		proof:
			"Book math uses wrapping operations throughout, so large deposits corrupt every downstream balance. " +
			"Wrapped deposit corrupted state locally. " +
			DEMO_MARK,
		fix: "Replace all balance math with checked operations program-wide.",
		started: "2026-10-03T15:45:00.000Z",
		solved: "2026-10-03T16:05:00.000Z",
		lessons: ["107-overflow-math"]
	},
	{
		user: "lamport_leecher",
		room: "l4-cosplay",
		points: 300,
		severity: "Medium",
		proof:
			"Deserialization ignores trailing bytes, so a padded lookalike account parses as legit. " +
			"Padded account parsed locally. " +
			DEMO_MARK,
		fix: "Reject accounts with unexpected trailing data on deserialize.",
		started: "2026-10-03T18:20:00.000Z",
		solved: "2026-10-03T18:40:00.000Z",
		lessons: []
	},
	{
		user: "anchor_breaker",
		room: "l1-signer",
		points: 100,
		severity: "Low",
		proof:
			"Signer constraint is present on paper but missing in the deployed handler. " +
			"Unsigned call passed locally. " +
			DEMO_MARK,
		fix: "Restore the signer constraint and add a regression test for it.",
		started: "2026-10-03T17:25:00.000Z",
		solved: "2026-10-03T17:45:00.000Z",
		lessons: ["101-accounts-signer"]
	},
	{
		user: "anchor_breaker",
		room: "l6-vault",
		points: 100,
		severity: "Medium",
		proof:
			"Cap comparison uses the wrong direction, capping minimums instead of maximums. " +
			"Inverted check exploited locally. " +
			DEMO_MARK,
		fix: "Flip the comparison and test both sides of the boundary.",
		started: "2026-10-03T18:45:00.000Z",
		solved: "2026-10-03T19:05:00.000Z",
		lessons: []
	}
];
for (const d of demoSolves) {
	const uuid = `demo-${d.user}-${d.room}`;
	const digest = createHash("sha256").update(`demo|${d.user}|${d.room}|exploit`).digest("hex");
	db.prepare(
		"INSERT OR IGNORE INTO sessions(uuid, user, room, created, expires, reaped) VALUES(?,?,?,?,?,0)"
	).run(uuid, d.user, d.room, d.started, "2027-10-03T00:00:00.000Z");
	db.prepare("INSERT OR IGNORE INTO attempts(session, code_hash, verdict, at) VALUES(?,?,?,?)").run(
		uuid,
		digest,
		"fail",
		d.started
	);
	db.prepare("INSERT OR IGNORE INTO attempts(session, code_hash, verdict, at) VALUES(?,?,?,?)").run(
		uuid,
		digest,
		"fail",
		d.started
	);
	db.prepare("INSERT OR IGNORE INTO attempts(session, code_hash, verdict, at) VALUES(?,?,?,?)").run(
		uuid,
		digest,
		"pass",
		d.solved
	);
	db.prepare("INSERT OR IGNORE INTO hints_used(session, hint_n) VALUES(?,?)").run(uuid, 1);
	const hash = createHash("sha256")
		.update(
			demoTranscript({
				solver: d.user,
				room: d.room,
				code_digest: digest,
				attempts: 3,
				hints_used: 1,
				started_at: d.started,
				solved_at: d.solved
			})
		)
		.digest("hex");
	db.prepare(
		"INSERT OR IGNORE INTO findings(user, room, severity, proof, fix, solver_hash, at, attempts, hints_used) VALUES(?,?,?,?,?,?,?,?,?)"
	).run(d.user, d.room, d.severity, d.proof, d.fix, hash, d.solved, 3, 1);
	db.prepare("INSERT OR IGNORE INTO solves(user, room, points, first_at) VALUES(?,?,?,?)").run(
		d.user,
		d.room,
		d.points,
		d.solved
	);
	for (const lesson of d.lessons) {
		db.prepare("INSERT OR IGNORE INTO lesson_completions(nickname, lesson, at) VALUES(?,?,?)").run(
			d.user,
			lesson,
			d.solved
		);
	}
}
const demoFindings = (
	db.prepare("SELECT COUNT(*) AS n FROM findings WHERE user IN ('jovan','ognjen','lazar')").get() as {
		n: number;
	}
).n;
console.log(`SEED demo_solves=${demoSolves.length} demo_user_findings=${demoFindings}`);
