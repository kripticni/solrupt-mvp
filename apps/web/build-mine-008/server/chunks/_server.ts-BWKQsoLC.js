import { j as json } from './index-C5EvGOh5.js';
import { o as openDb } from './client-CZrn9TuC.js';
import { o as objectType, s as stringType } from './types-YoPt2-1h.js';
import 'node:sqlite';
import 'node:fs';
import './paths-BVo4bQLA.js';
import 'node:path';
import 'node:url';

const SearchInput = objectType({ q: stringType().min(1).max(100) });
const GET = async ({ url }) => {
  const parsed = SearchInput.safeParse({ q: url.searchParams.get("q") ?? "" });
  if (!parsed.success) return json({ results: [] });
  const db = openDb(process.env.ARENA_DB ?? ":memory:");
  const rows = db.prepare("SELECT title, kind, ref FROM search_fts WHERE search_fts MATCH ? LIMIT 20").all(parsed.data.q);
  return json({ results: rows });
};

export { GET };
//# sourceMappingURL=_server.ts-BWKQsoLC.js.map
