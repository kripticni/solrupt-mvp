#!/usr/bin/env bash
# S6 gate-readiness probe — H02 build 2026-10-03 (standing order S5->S11)
# Scope: notes/mvp-scope-2026-10-03.md | Freeze: Sat 19:00 scope, Sun 11:00 code+evidence
# Read-only probe: no builds, no network, no chrome. Exit 0 = all checks ran.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0; FAIL=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }
[ -f "$ROOT/GOALS.md" ] && ok "GOALS.md present" || bad "GOALS.md missing"
[ -f "$ROOT/CURRENT.md" ] && ok "CURRENT.md present" || bad "CURRENT.md missing"
[ -f "$ROOT/queue.txt" ] && ok "queue.txt present" || bad "queue.txt missing"
[ -f "$ROOT/notes/mvp-scope-2026-10-03.md" ] && ok "scope notes/mvp-scope-2026-10-03.md present" || bad "scope file missing"
# S6 brief pinned path (inference: brief name pattern notes/<goal>-agent-brief.md)
if ls "$ROOT"/notes/*s6*brief*.md >/dev/null 2>&1 || ls "$ROOT"/notes/*S6*brief*.md >/dev/null 2>&1; then
  ok "S6 brief present in notes/"
else
  bad "S6 brief not found (expected notes/<goal>-agent-brief.md pattern)"
fi
# Evidence recency check (rows from 11:00 Sat per standing order) — presence only, no content claim
if ls "$ROOT"/notes/evidence*.md >/dev/null 2>&1; then
  ok "evidence note(s) present"
else
  bad "no evidence notes found"
fi
echo "---"
echo "S6 gate-readiness: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]
