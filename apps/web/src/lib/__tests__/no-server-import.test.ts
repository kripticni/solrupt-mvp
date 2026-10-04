import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "vitest";

// Import-lint (18 §1, 19 §1): lower layers never reach up; no CLIENT side
// module may import `$lib/server`. `+server.ts` endpoints are server by
// SvelteKit construction, so they are exempt; pages and shared are not.
// Static, offline, loud on violation.
const roots = ["src/routes", "src/lib/shared"];
const offenders: string[] = [];

for (const root of roots) {
	let files: string[] = [];
	try {
		files = readdirSync(root, { recursive: true }) as string[];
	} catch {
		continue;
	}
	for (const f of files) {
		if (!f.endsWith(".ts") && !f.endsWith(".svelte")) continue;
		if (f.endsWith("+server.ts")) continue; // server by construction
		const body = readFileSync(`${root}/${f}`, "utf8");
		if (body.includes("lib/server")) offenders.push(`${root}/${f}`);
	}
}

test("no client module imports lib/server", () => {
	expect(offenders).toEqual([]);
});
