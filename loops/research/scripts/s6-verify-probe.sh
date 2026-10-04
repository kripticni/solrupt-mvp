#!/usr/bin/env bash
# S6 gate probe — verifier + 2 rooms green (H02 build 2026-10-03/04).
# Scope: notes/mvp-scope-2026-10-03.md. Read-only: never builds, only asserts presence + verdicts.
# Usage: bash scripts/s6-verify-probe.sh
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "PASS: $1"; }
fail() { FAIL=$((FAIL+1)); echo "FAIL: $1"; }

# 1. Scope file exists (S5 lock input)
[ -f "$ROOT/notes/mvp-scope-2026-10-03.md" ] && ok "scope file present" || fail "scope file MISSING notes/mvp-scope-2026-10-03.md"

# 2. GOALS.md S6 still pending (first pending = active per standing order)
if grep -q '## S6' "$ROOT/GOALS.md" 2>/dev/null; then
  S6LINE=$(grep -A2 '## S6' "$ROOT/GOALS.md" | grep -o 'Status:[^\\]*' | head -1 | tr -d '*`')
  echo "INFO: S6 $S6LINE"
  echo "$S6LINE" | grep -q pending && ok "S6 pending = active" || fail "S6 status unexpected: $S6LINE"
else
  fail "GOALS.md has no S6 section"
fi

# 3. Verifier surface: look for verify(session,room,exploit) implementation
if grep -rl 'def verify\|function verify\|verify(session' "$ROOT" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=archive 2>/dev/null | head -5 | grep -q .; then
  ok "verify() implementation found:"
  grep -rl 'def verify\|function verify\|verify(session' "$ROOT" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=archive 2>/dev/null | head -5
else
  fail "no verify(session,room,exploit) implementation found (excl. archive)"
fi

# 4. L1/L2 prebuilt .so with digests (P0.1 pins)
SO_COUNT=$(find "$ROOT" -name '*.so' -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/archive/*' 2>/dev/null | wc -l)
[ "$SO_COUNT" -ge 2 ] && ok "$SO_COUNT .so files present" || fail "only $SO_COUNT .so files (need >=2 L1/L2)"
find "$ROOT" -name '*.sha256' -o -name 'SHA256SUMS*' -not -path '*/node_modules/*' 2>/dev/null | grep -v archive | head -5

# 5. Negative control evidence (exploit vs fixed MUST fail, logged)
if grep -rli 'negative.control\|NEGATIVE' "$ROOT/notes" 2>/dev/null | head -5 | grep -q .; then
  ok "negative-control evidence referenced in notes:"
  grep -rli 'negative.control\|NEGATIVE' "$ROOT/notes" 2>/dev/null | head -5
else
  fail "no negative-control evidence in notes/"
fi

# 6. Stranger-test / gate-note state (CURRENT.md says S6 technically complete pending stranger test + gate note)
grep -i 'stranger' "$ROOT/CURRENT.md" 2>/dev/null | head -3
GATE_FOUND=0
for g in "$ROOT"/notes/s06-gate-*.md "$ROOT"/notes/s6-gate-*.md; do
  [ -e "$g" ] && { echo "$g"; GATE_FOUND=1; }
done
if [ "$GATE_FOUND" -eq 1 ]; then
  ok "S6 gate note present"
else
  fail "no S6 gate note yet (notes/s06-gate-*.md)"
fi

echo "---"
echo "S6-PROBE verdict: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ] && echo "GATE: READY" || echo "GATE: NOT-READY"
exit "$FAIL"
