// Runtime paths (Docker-proof): env wins, then /srv (image layout), then the
// source tree (dev/test). import.meta.url survives bundling for the source
// fallback; the built server never guesses silently: missing paths throw
// naming the exact env var. Cached per process.
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

let contentCache: string | null = null;
let schemaCache: string | null = null;

// This file: mvp/apps/web/src/lib/server/paths.ts → mvp/ is five levels up.
function sourceMvp(): string {
	const here = dirname(fileURLToPath(import.meta.url));
	return join(here, "..", "..", "..", "..", "..");
}

function firstExisting(cands: string[], what: string, hint: string): string {
	for (const c of cands) {
		if (c && existsSync(c)) return c;
	}
	throw new Error(`${what} not found (tried: ${cands.filter(Boolean).join(", ")}). Set ${hint}.`);
}

export function contentDir(): string {
	if (!contentCache) {
		contentCache = firstExisting(
			[process.env.ARENA_CONTENT_DIR ?? "", "/srv/content", join(sourceMvp(), "content")],
			"content dir",
			"ARENA_CONTENT_DIR"
		);
	}
	return contentCache;
}

export function schemaFile(): string {
	if (!schemaCache) {
		schemaCache = firstExisting(
			[process.env.ARENA_SCHEMA ?? "", "/srv/schema.sql", join(sourceMvp(), "schema.sql")],
			"schema.sql",
			"ARENA_SCHEMA"
		);
	}
	return schemaCache;
}
