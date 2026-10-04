// Room files bundle (download-and-hack-locally): README + exploit template +
// program source + Cargo manifest, zipped server-side on every request so the
// bundle can never drift from the live room. Pure and testable; the endpoint
// is a thin wrapper. Both code panes are already public on the room page, so
// the bundle leaks nothing new; it just saves copy-paste.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { strToU8, zipSync } from "fflate";
import { loadRooms } from "$lib/server/rooms/loader.js";
import { contentDir } from "$lib/server/paths.js";

export function buildRoomFiles(id: string): { filename: string; bytes: Uint8Array } | { error: "RoomMissing" } {
	const { rooms } = loadRooms();
	const room = rooms.find((r) => r.id === id);
	if (!room) return { error: "RoomMissing" };
	const base = join(contentDir(), "..");
	const read = (p: string) => readFileSync(join(base, p), "utf8");
	const source = read(room.program.vuln);
	const template = read(room.template);
	let manifest = "";
	try {
		manifest = read(join(dirname(dirname(room.program.vuln)), "Cargo.toml"));
	} catch {
		manifest = "";
	}
	const readme = [
		`${room.title} (${room.tier}, ${room.points} pts)`,
		"",
		"Files:",
		"• exploit-template.txt: fill the TODOs with the target shown on the room page.",
		"• src/lib.rs: the room program (vulnerable plus fixed sides, PANEL markers).",
		manifest ? "• Cargo.toml: the room manifest (anchor 0.32.2)." : "• (no Cargo manifest for this room)",
		"",
		"How to submit:",
		"1. Open the room page and claim a nickname.",
		"2. Paste your filled exploit into the editor and press Run.",
		"3. The verifier checks onchain state, never your logs.",
		"",
		`Prerequisite: ${room.prereq}. Hints live on the room page (3 per room).`
	].join("\n");
	const entries: Record<string, Uint8Array> = {
		[`${id}/README.md`]: strToU8(readme),
		[`${id}/exploit-template.txt`]: strToU8(template),
		[`${id}/src/lib.rs`]: strToU8(source)
	};
	if (manifest) entries[`${id}/Cargo.toml`] = strToU8(manifest);
	return { filename: `${id}-files.zip`, bytes: zipSync(entries) };
}
