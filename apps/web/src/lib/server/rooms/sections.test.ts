import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { splitSections } from "$lib/server/rooms/loader.js";

const L1 = readFileSync(
	"/home/aleksic/spacestation/mvp/content/programs/l1-signer/src/lib.rs",
	"utf8"
);

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

	it("degrades to whole-file both sides without markers", () => {
		const plain = "line one\nline two\n";
		expect(splitSections(plain)).toEqual({ vuln: plain, fixed: plain });
	});
});
