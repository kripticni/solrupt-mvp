import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { splitSections } from "$lib/server/rooms/loader.js";

const ROOMS: { file: string; insecure: string[]; secure: string[] }[] = [
	{
		file: "/home/aleksic/spacestation/mvp/content/programs/l1-signer/src/lib.rs",
		insecure: ["withdraw_insecure"],
		secure: ["withdraw_secure"]
	},
	{
		file: "/home/aleksic/spacestation/mvp/content/programs/l2-owner/src/lib.rs",
		insecure: ["check_balance_insecure", "get_user_level_insecure"],
		secure: ["check_balance_secure_manual", "check_balance_secure_anchor", "get_user_level_secure"]
	},
	{
		file: "/home/aleksic/spacestation/mvp/content/programs/l3-cpi/src/lib.rs",
		insecure: ["release_insecure"],
		secure: ["release_secure_manual", "release_secure"]
	},
	{
		file: "/home/aleksic/spacestation/mvp/content/programs/l4-cosplay/src/lib.rs",
		insecure: ["claim_insecure"],
		secure: ["claim_secure"]
	},
	{
		file: "/home/aleksic/spacestation/mvp/content/programs/l5-match/src/lib.rs",
		insecure: ["withdraw_insecure"],
		secure: ["withdraw_secure"]
	},
	{
		file: "/home/aleksic/spacestation/mvp/content/programs/l6-vault/src/lib.rs",
		insecure: ["withdraw_insecure"],
		secure: ["withdraw_secure"]
	},
	{
		file: "/home/aleksic/spacestation/mvp/content/programs/l7-overflow/src/lib.rs",
		insecure: ["withdraw_insecure"],
		secure: ["withdraw_secure"]
	}
];

const L1 = readFileSync(ROOMS[0].file, "utf8");

describe("pane section split", () => {
	it("separates vuln from fixed without losing shared state", () => {
		const { vuln, fixed } = splitSections(L1);
		expect(vuln).not.toBe(fixed);
		expect(vuln).toContain("withdraw_insecure");
		expect(vuln).not.toContain("withdraw_secure");
		expect(fixed).toContain("withdraw_secure");
		expect(fixed).not.toContain("withdraw_insecure");
		expect(fixed).toContain("pub struct Vault");
		expect(vuln).toContain("pub struct Vault");
	});

	it("marker lines never leak into either pane", () => {
		const { vuln, fixed } = splitSections(L1);
		expect(vuln).not.toContain("PANEL:");
		expect(fixed).not.toContain("PANEL:");
	});

	it("every room keeps insecure names out of the fixed pane and vice versa", () => {
		for (const r of ROOMS) {
			const src = readFileSync(r.file, "utf8");
			const { vuln, fixed } = splitSections(src);
			for (const name of r.insecure) {
				expect(vuln, `${r.file} vuln pane`).toContain(name);
				expect(fixed, `${r.file} fixed pane`).not.toContain(name);
			}
			for (const name of r.secure) {
				expect(fixed, `${r.file} fixed pane`).toContain(name);
				expect(vuln, `${r.file} vuln pane`).not.toContain(name);
			}
		}
	});

	it("degrades to whole-file both sides without markers", () => {
		const plain = "line one\nline two\n";
		expect(splitSections(plain)).toEqual({ vuln: plain, fixed: plain });
	});
});
