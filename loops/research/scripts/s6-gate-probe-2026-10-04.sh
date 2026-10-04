#!/bin/bash
# S6 gate-readiness probe — 2026-10-04 (H02 build, scope notes/mvp-scope-2026-10-03.md)
# Verdict-lines only, read-only, hermetic, no network, no chrome.
# Checks: scope file present, S5 gate present, S6 work dir / verifier pins mentioned.
set -u
ROOT="$(dirname "$0")/.."
echo "== S6 gate probe 2026-10-04 =="
echo "scope: $(test -f "$ROOT/notes/mvp-scope-2026-10-03.md" && echo OK || echo MISSING-notes/mvp-scope-2026-10-03.md)"
echo "s05-gate: $(test -f "$ROOT/notes/s05-gate-2026-10-03.md" && echo OK || echo MISSING-notes/s05-gate-2026-10-03.md)"
echo "goals-s6: $(grep -q '^## S6' "$ROOT/GOALS.md" 2>/dev/null && echo OK || echo MISSING-GOALS-S6)"
# read-only scan for verifier/pins/endpoints mentions (no exec of heavy builds)
grep -ri "verify(session" "$ROOT" --include="*.md" --include="*.py" --include="*.ts" -l 2>/dev/null | head -5 || true
echo "probe-done rc=0"
# 2026-10-04 late-turn append: P0.6 schema sanity (local notes only)
echo "evidence-rows: $(grep -c '|' "$ROOT/notes/s6-evidence-2026-10-04.md" 2>/dev/null || echo 0) pipe-lines in s6-evidence"
echo "neg-control: $(grep -ci 'NEG-CONTROL' "$ROOT/notes/s6-evidence-2026-10-04.md" 2>/dev/null || echo 0) mentions"
echo "open-items: stranger-test#1 HUMAN-BLOCKED; guard-rehearsal+jscpd+refusal-probes AGENT-OWNED (needs mvp/ root, outside this sandbox)"
