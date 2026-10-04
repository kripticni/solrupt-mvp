import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { s as schemaFile } from './paths-BVo4bQLA.js';

let db = null;
function schemaPath() {
  return schemaFile();
}
function openDb(path = ":memory:") {
  if (path === ":memory:" || db === null) {
    const fresh = new DatabaseSync(path);
    fresh.exec("PRAGMA journal_mode=WAL;");
    const schema = readFileSync(schemaPath(), "utf8");
    fresh.exec(schema);
    if (path !== ":memory:") db = fresh;
    return fresh;
  }
  return db;
}

export { openDb as o };
//# sourceMappingURL=client-CZrn9TuC.js.map
