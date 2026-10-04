// Room loader (19 §3, data > code): reads + validates every *.yaml at boot.
// Fail-closed: bad file → greyed card + log line, never 500.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";
import { z } from "zod";
import type { RoomMeta } from "$lib/shared/types.js";
import { contentDir } from "$lib/server/paths.js";

const RoomSchema = z.object({
	id: z.string(),
	title: z.string(),
	tier: z.enum(["Easy", "Medium", "Hard"]),
	points: z.number(),
	prereq: z.string(),
	program: z.object({
		vuln: z.string(),
		fixed: z.string(),
		so: z.string().optional(),
		so_digest: z.string()
	}),
	template: z.string(),
	hints: z.array(z.string()).length(3),
	checks: z.object({ pass_when: z.string(), negative_control: z.string() }),
	pins: z.object({ anchor: z.string(), litesvm: z.string(), rust: z.string() })
});

export type Room = z.infer<typeof RoomSchema> & { live: boolean };

export function roomsDir(): string {
	return join(contentDir(), "rooms");
}

export function loadRooms(dir: string = roomsDir()): { rooms: Room[]; greyed: string[] } {
	const rooms: Room[] = [];
	const greyed: string[] = [];
	for (const f of readdirSync(dir)) {
		if (!f.endsWith(".yaml")) continue;
		try {
			const parsed = RoomSchema.parse(yaml.load(readFileSync(join(dir, f), "utf8")));
			rooms.push({ ...parsed, live: parsed.program.so_digest !== "UNBUILT" });
		} catch (e) {
			greyed.push(f);
			console.warn(`room greyed: ${f}: ${(e as Error).message.split("\n")[0]}`);
		}
	}
	return { rooms, greyed };
}

export function toMeta(r: Room): RoomMeta {
	return { id: r.id, title: r.title, tier: r.tier, points: r.points, prereq: r.prereq };
}

/** Split a single-file program into pane sides at explicit `// PANEL:` markers.
 * Markers (`both|vuln|fixed`) are authored in OUR ported sources and switch the
 * side for all following lines until the next marker. Lines before the first
 * marker go to both. No markers → whole file both sides (fail-safe, never
 * empty). Heuristic banner-sniffing is banned (it leaked both sides). */
export function splitSections(src: string): { vuln: string; fixed: string } {
	const lines = src.split("\n");
	const vuln: string[] = [];
	const fixed: string[] = [];
	let side: "both" | "vuln" | "fixed" = "both";
	let marked = false;
	for (const line of lines) {
		const m = line.match(/^\s*\/\/\s*PANEL:\s*(both|vuln|fixed)\s*$/);
		if (m) {
			side = m[1] as "both" | "vuln" | "fixed";
			marked = true;
			continue;
		}
		if (side === "both") {
			vuln.push(line);
			fixed.push(line);
		} else if (side === "vuln") {
			vuln.push(line);
		} else {
			fixed.push(line);
		}
	}
	if (!marked) return { vuln: src, fixed: src };
	const v = vuln.join("\n").trim();
	const f = fixed.join("\n").trim();
	if (!v || !f || v === f) return { vuln: src, fixed: src };
	return { vuln: v, fixed: f };
}
