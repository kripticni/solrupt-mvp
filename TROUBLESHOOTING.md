# TROUBLESHOOTING — symptom → cause → fix (18 §9: debuggability is shipped)

## Seed / DB

- `seed counts mismatch — not idempotent` → FTS rows lack UNIQUE, re-runs duplicate.
  Fix: seed deletes per-ref before insert (already in `seed.ts`); never INSERT blind into FTS.
- `FOREIGN KEY constraint failed` on sessions/attempts → user row missing.
  Fix: `INSERT OR IGNORE INTO users` before any session (endpoints + seed do this).
- `schema.sql not found … Set ARENA_SCHEMA` → built server can't see source tree.
  Fix: set `ARENA_CONTENT_DIR`/`ARENA_SCHEMA`, or run where `/srv/content` exists (Docker).

## Verdict path

- Every `/api/run` returns `error` → check `reason`: `SessionExpired` (claim a name),
  `RoomMissing` (room UNBUILT or typo — picker greys these), `VerifierUnavailable`
  (Diff 3 harness not wired — expected until the Rust build lands).
- `FixedPassed`-class surprise (exploit passes on fixed) → page the human, log
  CRITICAL: the lab is broken, not the user (19 §5).

## Proof page

- `404 UnknownProof` → hash typo or DB is a different file (check `ARENA_DB`).
- `410 ProofMismatch` → stored fields don't recompute: DB edited by hand or clock
  skew across mint/view. Reseed from evidence; never hand-edit findings.

## Frontend gates

- `svelte-check` `$state(null)` → `never` errors → type page state explicitly.
- TS in `.svelte` flagged as JS → every `<script>` needs `lang="ts"`.
- `*.md` import untyped → `src/ambient.d.ts` declares the Component type.
- `vite-plugin-svelte@^4` vs `vite@^6` eresolve → pin `^5` (PINS.md amendment).

## Network / toolchain

- npm/cargo stall → route through tor: `PROXYCHAINS_CONF_FILE=/tmp/proxychains-fleet.conf`
  (socks5 127.0.0.1:19350) + `proxychains`. crates.io API + static 403 tor exits
  (Cloudflare); use index.crates.io for metadata + docs.rs for bytes (checksums verify).
- `pkill -f <pattern>` killing your own shell → the pattern matches the invoker's
  cmdline. Check `ps` first; kill by PID, never by matching pattern of a running command.
- Anchor/Solana CLI missing → L1/L2 `.so` cannot build yet; rooms stay UNBUILT-greyed
  by design (fail-safe, never 500).

## Debug toggles

Append `?debug=1` to any page for the logs pane + verifier internals (18 §9).
Verdict rows are JSONL-structured: inputs hash + code digest + session — grep the
silent-failure net before blaming the UI.
