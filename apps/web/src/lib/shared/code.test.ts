import { describe, expect, it } from "vitest";
import { highlightRust } from "$lib/shared/code.js";

describe("highlightRust", () => {
	it("escapes HTML before wrapping spans", () => {
		const out = highlightRust('let x = "<b>"; // <script>');
		expect(out).not.toContain("<b>");
		expect(out).not.toContain("<script>");
		expect(out).toContain("tok-kw");
		expect(out).toContain("tok-str");
		expect(out).toContain("tok-com");
	});

	it("marks macros, attributes, fn names, numbers", () => {
		const out = highlightRust('#[program]\nmsg!("hi");\nwithdraw(ctx, 40u64);');
		expect(out).toContain("tok-mac");
		expect(out).toContain("tok-fn");
		expect(out).toContain("tok-num");
	});

	it("round-trips plain text without spans when nothing matches", () => {
		expect(highlightRust("   \n  ")).toBe("   \n  ");
	});

	it("keeps lifetimes plain instead of opening runaway strings", () => {
		const out = highlightRust("pub authority: Signer<'info>,");
		expect(out).not.toContain("tok-str");
		expect(out).toContain("tok-kw");
		expect(out).toContain("'info");
	});

	it("still marks char literals as strings", () => {
		expect(highlightRust("let c = 'a';")).toContain("tok-str");
		expect(highlightRust("let c = '\\n';")).toContain("tok-str");
	});

	it("never lets a stray quote swallow the rest of the file", () => {
		const out = highlightRust("it's a test\nlet x = 1;");
		expect(out).not.toContain("tok-str");
		expect(out).toContain("tok-kw");
		expect(out).toContain("tok-num");
	});
});
