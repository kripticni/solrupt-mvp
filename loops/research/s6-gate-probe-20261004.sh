#!/bin/bash
# S6 gate probe 2026-10-04 — verifier + 2 rooms green (GOALS.md S6 target)
# Verdict-lines only, read-only, no history re-read. Run: nice -n 19 bash s6-gate-probe-20261004.sh
set -u
echo "== S6 gate probe 2026-10-04 =="
echo "--- P0.1 pins (grep) ---"
grep -r --include="*.md" --include="*.json" --include="*.yaml" -l "P0.1\|pin" . 2>/dev/null | head -20 || echo "NO_PIN_REFS"
echo "--- L1/L2 .so prebuilt ---"
find . -maxdepth 5 -name "*.so" 2>/dev/null | head -20
echo "--- so count: $(find . -maxdepth 5 -name '*.so' 2>/dev/null | wc -l) ---"
echo "--- verify(session,room,exploit) refs ---"
grep -rn "verify" --include="*.py" --include="*.ts" --include="*.js" --include="*.rs" . 2>/dev/null | grep -i "session.*room\|room.*exploit\|def verify\|function verify" | head -20 || echo "NO_VERIFY_FN"
echo "--- NEGATIVE CONTROL refs ---"
grep -rni "negative.control\|NEGATIVE" . 2>/dev/null | head -10 || echo "NO_NEGCTRL"
echo "--- P0.2 schema refs ---"
grep -rln "P0.2\|schema" --include="*.md" --include="*.json" --include="*.yaml" --include="*.sql" . 2>/dev/null | head -20 || echo "NO_SCHEMA_REFS"
echo "--- P0.4 endpoints (5) refs ---"
grep -rn "endpoint\|/api/\|GET \|POST " --include="*.py" --include="*.ts" --include="*.js" . 2>/dev/null | head -20 || echo "NO_ENDPOINTS"
echo "--- F2.2 lab shell refs ---"
grep -rln "F2.2\|lab.*shell\|lab_shell" . 2>/dev/null | head -10 || echo "NO_LABSHELL"
echo "== probe done =="
