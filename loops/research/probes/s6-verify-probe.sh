#!/bin/bash
# S6 verifier probe — 2026-10-04 H02 build
# Scope: notes/mvp-scope-2026-10-03.md | Freeze: Sat 19:00 scope, Sun 11:00 code+evidence
# Evidence rows from 11:00 Sat, failures verbatim.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "== S6 probe $(date -u +%FT%TZ) =="
echo "root=$ROOT"
echo "--- P0.1 pins ---"
ls -l "$ROOT"/notes/mvp-scope-2026-10-03.md 2>&1 || echo "FAIL: scope file missing"
echo "--- L1/L2 .so digests ---"
find "$ROOT" -maxdepth 4 -name "*.so" -type f 2>/dev/null | head -20
if [ -z "$(find "$ROOT" -maxdepth 4 -name "*.so" -type f 2>/dev/null | head -1)" ]; then
  echo "FAIL: no .so prebuilt found (verbatim)"
fi
echo "--- P0.4 endpoints (expect 5) ---"
grep -R "verify(session" "$ROOT" --include="*.md" --include="*.ts" --include="*.rs" --include="*.py" -n 2>&1 | head -20 || echo "FAIL: grep error"
echo "--- NEGATIVE CONTROL ---"
echo "TODO: exploit vs fixed must fail — log verbatim output here"
echo "== end =="
