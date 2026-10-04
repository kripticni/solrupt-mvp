#!/usr/bin/env bash
# S6 verify-state probe — H02 build 2026-10-03, S6 (Verifier + 2 rooms green).
# Read-only: reports state, changes nothing. Run from loop dir.
# Usage: bash notes/s6-verify-state-probe.sh
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "=== S6-VERIFY-STATE $(date -u +%FT%TZ) ==="
echo "--- git ---"
git -C "$ROOT" log --oneline -5 2>&1 | head -10
git -C "$ROOT" status --short 2>&1 | head -20
echo "--- app dir? ---"
ls "$ROOT" 2>&1 | head -30
echo "--- verifier / rooms / .so hunt (top 3 levels) ---"
find "$ROOT" -maxdepth 3 \( -name '*.so' -o -name '*verif*' -o -name '*rooms*' -o -name 'content' \) -not -path '*/node_modules/*' -not -path '*/.git/*' 2>/dev/null | head -20
echo "--- s6 living probe note? ---"
ls "$ROOT/notes/" 2>&1 | grep -i -E 's6|verif|probe' | head -10
echo "=== END ==="
