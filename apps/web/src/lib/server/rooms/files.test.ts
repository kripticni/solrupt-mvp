import { describe, expect, it } from "vitest";
import { unzipSync } from "fflate";
import { buildRoomFiles } from "$lib/server/rooms/files.js";

// Bundle gate: fresh zip per request, real contents, nothing for bad ids.
describe("GET /api/rooms/[id]/files", () => {
	it("zips README + template + source for a live room", () => {
		const out = buildRoomFiles("l1-signer");
		expect("error" in out).toBe(false);
		if ("error" in out) return;
		expect(out.filename).toBe("l1-signer-files.zip");
		expect(out.bytes[0]).toBe(0x50);
		expect(out.bytes[1]).toBe(0x4b);
		const files = unzipSync(out.bytes);
		const names = Object.keys(files).sort();
		expect(names).toEqual([
			"l1-signer/Cargo.toml",
			"l1-signer/README.md",
			"l1-signer/exploit-template.txt",
			"l1-signer/src/lib.rs"
		]);
		const text = (n: string) => Buffer.from(files[n]).toString("utf8");
		expect(text("l1-signer/exploit-template.txt")).toContain("TODO");
		expect(text("l1-signer/README.md")).toContain("How to submit:");
		expect(text("l1-signer/src/lib.rs")).toContain("withdraw_insecure");
	});

	it("refuses unknown rooms without touching the disk", () => {
		expect(buildRoomFiles("no-such-room")).toEqual({ error: "RoomMissing" });
	});
});
