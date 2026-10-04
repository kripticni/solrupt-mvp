import { describe, expect, it } from "vitest";
import { openDb } from "$lib/server/db/client.js";
import { createSession } from "$lib/server/sessions/manager.js";
import { handleRun } from "$lib/server/verifier/run.js";
import { fakeFor, ledgerFor, noteFor, victimFor, victimForProgram } from "$lib/server/verifier/harness.js";
import { loadRooms } from "$lib/server/rooms/loader.js";

const L3_PROGRAM = "HuKUtxW8Y6BWhfyXftZMS1BqENagBJzZFWMzjhx1tCFf";
const L4_PROGRAM = "9QrjdkjrnFXC2kaqB7pb3zUMSDRDmQZrQysiCYRvERZA";
const L5_PROGRAM = "8BGViQLBtPwZccPwccmTG7QCEnVekmWcitnzM6hydx2J";
const L6_PROGRAM = "2UDFFUhGnvuvSmzTaUC726TmB4MEQVGEVR79v3NApXib";
const L7_PROGRAM = "392HD9NFyhZpR45PcBAJRNrQZ1EAifUSJARCDxW3oEmK";

describe("rooms loader", () => {
	it("loads l1-signer LIVE and l2-owner LIVE", () => {
		const { rooms, greyed } = loadRooms();
		expect(greyed).toEqual([]);
		const l1 = rooms.find((r) => r.id === "l1-signer");
		expect(l1?.tier).toBe("Easy");
		expect(l1?.points).toBe(100);
		expect(l1?.hints).toHaveLength(3);
		expect(l1?.live).toBe(true); // .so pinned 2026-10-04
		const l2 = rooms.find((r) => r.id === "l2-owner");
		expect(l2?.tier).toBe("Medium");
		expect(l2?.live).toBe(true); // .so pinned 2026-10-04
		const l3 = rooms.find((r) => r.id === "l3-cpi");
		expect(l3?.tier).toBe("Medium");
		expect(l3?.points).toBe(200);
		expect(l3?.hints).toHaveLength(3);
		expect(l3?.live).toBe(true); // .so pinned 2026-10-04
		const l4 = rooms.find((r) => r.id === "l4-cosplay");
		expect(l4?.tier).toBe("Hard");
		expect(l4?.points).toBe(300);
		expect(l4?.hints).toHaveLength(3);
		expect(l4?.live).toBe(true); // .so pinned 2026-10-04
		const l5 = rooms.find((r) => r.id === "l5-match");
		expect(l5?.tier).toBe("Medium");
		expect(l5?.points).toBe(200);
		expect(l5?.hints).toHaveLength(3);
		expect(l5?.live).toBe(true); // .so pinned 2026-10-04
		const l6 = rooms.find((r) => r.id === "l6-vault");
		expect(l6?.tier).toBe("Easy");
		expect(l6?.points).toBe(100);
		expect(l6?.hints).toHaveLength(3);
		expect(l6?.live).toBe(true); // .so pinned 2026-10-04, challenge capstone
		const l7 = rooms.find((r) => r.id === "l7-overflow");
		expect(l7?.tier).toBe("Hard");
		expect(l7?.points).toBe(250);
		expect(l7?.hints).toHaveLength(3);
		expect(l7?.live).toBe(true); // .so pinned 2026-10-04
	});
});

describe("POST /run contracts (real L1 verifier)", () => {
	function liveSession(db: ReturnType<typeof openDb>) {
		db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
			"jovan",
			null,
			"2026-10-03"
		);
		const s = createSession(db, "jovan", "l1-signer", "127.0.0.1");
		if (!("uuid" in s)) throw new Error("session setup failed");
		return s.uuid;
	}

	it("rejects bad input without touching the DB", async () => {
		const out = await handleRun(openDb(":memory:"), { nonsense: 1 });
		expect(out).toEqual({
			verdict: "error",
			reason: "BadInput",
			action: "retry with session, room and exploit code"
		});
	});

	it("rejects unknown sessions", async () => {
		const out = await handleRun(openDb(":memory:"), {
			session_uuid: "00000000-0000-4000-8000-000000000000",
			room_id: "l1-signer",
			exploit_code: "x"
		});
		expect(out.verdict).toBe("error");
	});

	it("rejects unknown room ids", async () => {
		const db = openDb(":memory:");
		const out = await handleRun(db, {
			session_uuid: liveSession(db),
			room_id: "no-such-room",
			exploit_code: "x".repeat(10)
		});
		expect(out).toEqual({
			verdict: "error",
			reason: "RoomMissing",
			action: "pick a live room from the picker"
		});
	});

	it("fails unparsable exploits with an action, recording the attempt", async () => {
		const db = openDb(":memory:");
		const out = await handleRun(db, {
			session_uuid: liveSession(db),
			room_id: "l1-signer",
			exploit_code: "just some words"
		});
		expect(out.verdict).toBe("fail");
		const n = (
			db.prepare("SELECT COUNT(*) AS n FROM attempts").get() as { n: number }
		).n;
		expect(n).toBe(1);
	});

	it("passes a real exploit end to end (LiteSVM, state moved, control refused)", async () => {
		const db = openDb(":memory:");
		const uuid = liveSession(db);
		const { victim, vault } = await victimFor(uuid);
		const exploit = [
			`vault: ${vault}`,
			`authority: ${victim.address}`,
			"instruction: withdraw_insecure",
			"amount: 10000000"
		].join("\n");
		const out = await handleRun(db, {
			session_uuid: uuid,
			room_id: "l1-signer",
			exploit_code: exploit
		});
		expect(out.verdict).toBe("pass");
		if (out.verdict === "pass") {
			expect(out.state_diff).toContain("attacker gained 10000000");
			expect(out.attempts_used).toBe(1);
		}
	}, 60000);

	it("passes a real L2 exploit (fabrication trusted, both secure refused)", async () => {
		const db = openDb(":memory:");
		db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
			"jovan",
			null,
			"2026-10-03"
		);
		const s = createSession(db, "jovan", "l2-owner", "127.0.0.1");
		if (!("uuid" in s)) throw new Error("session setup failed");
		const { fake } = await fakeFor(s.uuid);
		const exploit = [
			`fake_account: ${fake}`,
			"fake_balance: 1000000",
			"instruction: check_balance_insecure"
		].join("\n");
		const out = await handleRun(db, {
			session_uuid: s.uuid,
			room_id: "l2-owner",
			exploit_code: exploit
		});
		expect(out.verdict).toBe("pass");
		if (out.verdict === "pass") {
			expect(out.state_diff).toContain("1000000");
			expect(out.state_diff).toContain("both secure variants refused");
		}
	}, 60000);

	it("passes a real L3 exploit (fake callee trusted, both secure refused)", async () => {
		const db = openDb(":memory:");
		db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
			"jovan",
			null,
			"2026-10-03"
		);
		const s = createSession(db, "jovan", "l3-cpi", "127.0.0.1");
		if (!("uuid" in s)) throw new Error("session setup failed");
		const { vault } = await victimForProgram(s.uuid, L3_PROGRAM);
		const exploit = [
			`vault: ${vault}`,
			`token_program: ${L3_PROGRAM}`,
			"instruction: release_insecure",
			"amount: 10000000"
		].join("\n");
		const out = await handleRun(db, {
			session_uuid: s.uuid,
			room_id: "l3-cpi",
			exploit_code: exploit
		});
		expect(out.verdict).toBe("pass");
		if (out.verdict === "pass") {
			expect(out.state_diff).toContain("10000000");
			expect(out.state_diff).toContain("both secure variants refused");
		}
	}, 60000);

	it("passes a real L4 exploit (costume trusted, secure refused)", async () => {
		const db = openDb(":memory:");
		db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
			"jovan",
			null,
			"2026-10-03"
		);
		const s = createSession(db, "jovan", "l4-cosplay", "127.0.0.1");
		if (!("uuid" in s)) throw new Error("session setup failed");
		const { note } = await noteFor(s.uuid);
		const { ledger } = await ledgerFor(s.uuid);
		const exploit = [`user: ${note}`, `ledger: ${ledger}`, "instruction: claim_insecure"].join("\n");
		const out = await handleRun(db, {
			session_uuid: s.uuid,
			room_id: "l4-cosplay",
			exploit_code: exploit
		});
		expect(out.verdict).toBe("pass");
		if (out.verdict === "pass") {
			expect(out.state_diff).toContain("claims 0 to 1");
			expect(out.state_diff).toContain("secure refused the costume");
		}
	}, 60000);

	it("passes a real L5 exploit (stranger signature, secure refused)", async () => {
		const db = openDb(":memory:");
		db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
			"jovan",
			null,
			"2026-10-03"
		);
		const s = createSession(db, "jovan", "l5-match", "127.0.0.1");
		if (!("uuid" in s)) throw new Error("session setup failed");
		const { vault } = await victimForProgram(s.uuid, L5_PROGRAM);
		const exploit = [`vault: ${vault}`, "instruction: withdraw_insecure", "amount: 5000000"].join("\n");
		const out = await handleRun(db, {
			session_uuid: s.uuid,
			room_id: "l5-match",
			exploit_code: exploit
		});
		expect(out.verdict).toBe("pass");
		if (out.verdict === "pass") {
			expect(out.state_diff).toContain("stranger's signature moved victim funds");
			expect(out.state_diff).toContain("secure refused");
		}
	}, 60000);

	it("passes a real L6 raid (100% drained, secure refused)", async () => {
		const db = openDb(":memory:");
		db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
			"jovan",
			null,
			"2026-10-03"
		);
		const s = createSession(db, "jovan", "l6-vault", "127.0.0.1");
		if (!("uuid" in s)) throw new Error("session setup failed");
		const { vault } = await victimForProgram(s.uuid, L6_PROGRAM);
		const exploit = [`vault: ${vault}`, "instruction: withdraw_insecure", "amount: 100000000"].join("\n");
		const out = await handleRun(db, {
			session_uuid: s.uuid,
			room_id: "l6-vault",
			exploit_code: exploit
		});
		expect(out.verdict).toBe("pass");
		if (out.verdict === "pass") {
			expect(out.state_diff).toContain("100% drained in one transaction");
			expect(out.state_diff).toContain("secure refused");
		}
	}, 60000);

	it("fails an L6 partial drain (capstone demands 100%)", async () => {
		const db = openDb(":memory:");
		db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
			"jovan",
			null,
			"2026-10-03"
		);
		const s = createSession(db, "jovan", "l6-vault", "127.0.0.1");
		if (!("uuid" in s)) throw new Error("session setup failed");
		const { vault } = await victimForProgram(s.uuid, L6_PROGRAM);
		const exploit = [`vault: ${vault}`, "instruction: withdraw_insecure", "amount: 1"].join("\n");
		const out = await handleRun(db, {
			session_uuid: s.uuid,
			room_id: "l6-vault",
			exploit_code: exploit
		});
		expect(out.verdict).toBe("fail");
		if (out.verdict === "fail") {
			expect(out.logs).toContain("capstone demands 100%");
		}
	}, 60000);

	it("passes a real L7 wrap (100 minus 101 is u64::MAX, secure refused)", async () => {
		const db = openDb(":memory:");
		db.prepare("INSERT INTO users(nickname, wallet, created) VALUES(?,?,?)").run(
			"jovan",
			null,
			"2026-10-03"
		);
		const s = createSession(db, "jovan", "l7-overflow", "127.0.0.1");
		if (!("uuid" in s)) throw new Error("session setup failed");
		const { vault } = await victimForProgram(s.uuid, L7_PROGRAM);
		const exploit = [`vault: ${vault}`, "instruction: withdraw_insecure", "amount: 101"].join("\n");
		const out = await handleRun(db, {
			session_uuid: s.uuid,
			room_id: "l7-overflow",
			exploit_code: exploit
		});
		expect(out.verdict).toBe("pass");
		if (out.verdict === "pass") {
			expect(out.state_diff).toContain("18446744073709551615");
			expect(out.state_diff).toContain("secure refused");
		}
	}, 60000);
});
