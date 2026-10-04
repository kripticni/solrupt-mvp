#!/bin/bash
# S6 turn probe 2026-10-04 — verifier + 2 rooms green re-check (read-only, hermetic)
# Caps: nice -n 19, timeout 60, no chrome, no network, failures verbatim.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/notes/s6-active-probe-2026-10-04.md"
echo "=== S6 verify $(date -u +%FT%TZ) ==="
echo "root=$ROOT"
echo "--- P0.1 pins / L1-L2 .so (find, max 60s) ---"
timeout 60 find "$ROOT" -maxdepth 4 \( -name '*.so' -o -name '*pin*' -o -name '*verif*' \) -print 2>&1 | head -n 40 || echo "FIND_EXIT=$? (verbatim)"
echo "--- endpoints grep (P0.4 five endpoints, read-only) ---"
timeout 60 grep -rn --include='*.ts' --include='*.js' --include='*.py' -E '/health|/verify|/run|/rooms|/evidence' "$ROOT" 2>&1 | head -n 30 || echo "GREP_EXIT=$? (verbatim)"
echo "--- negative-control marker grep ---"
timeout 60 grep -rni --include='*.md' -E 'negative.?control|NEGATIVE CONTROL' "$ROOT/notes" 2>&1 | head -n 20 || echo "NEG_EXIT=$? (verbatim)"
echo "=== done (no mutations; see $OUT living note) ==="
