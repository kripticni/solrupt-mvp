import { describe, expect, it } from "vitest";
import { digestOf, logVerdict } from "$lib/server/evidence/log.js";

describe("evidence logger", () => {
	it("digests stably and never throws without a path", () => {
		expect(digestOf("x")).toBe(digestOf("x"));
		expect(digestOf("x")).not.toBe(digestOf("y"));
		expect(() =>
			logVerdict({
				ts: new Date().toISOString(),
				session: "s",
				room: "l1-signer",
				verdict: "pass",
				code_digest: "abc",
				attempts_used: 1
			})
		).not.toThrow();
	});
});
