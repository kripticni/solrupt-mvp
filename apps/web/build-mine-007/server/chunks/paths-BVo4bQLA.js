import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

let contentCache = null;
let schemaCache = null;
function sourceMvp() {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "..", "..", "..", "..", "..");
}
function firstExisting(cands, what, hint) {
  for (const c of cands) {
    if (c && existsSync(c)) return c;
  }
  throw new Error(`${what} not found (tried: ${cands.filter(Boolean).join(", ")}). Set ${hint}.`);
}
function contentDir() {
  if (!contentCache) {
    contentCache = firstExisting(
      [process.env.ARENA_CONTENT_DIR ?? "", "/srv/content", join(sourceMvp(), "content")],
      "content dir",
      "ARENA_CONTENT_DIR"
    );
  }
  return contentCache;
}
function schemaFile() {
  if (!schemaCache) {
    schemaCache = firstExisting(
      [process.env.ARENA_SCHEMA ?? "", "/srv/schema.sql", join(sourceMvp(), "schema.sql")],
      "schema.sql",
      "ARENA_SCHEMA"
    );
  }
  return schemaCache;
}

export { contentDir as c, schemaFile as s };
//# sourceMappingURL=paths-BVo4bQLA.js.map
