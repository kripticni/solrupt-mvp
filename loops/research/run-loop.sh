#!/usr/bin/env bash
# run-loop.sh — start an engine worker (`fleet run`) properly contained.
# Usage: run-loop.sh [--print] LOOPDIR
# LOOPDIR must end in loops/research; the project is two levels above it.
# Wraps: setsid + nohup + sandbox (loop + project + rocserve state + cache
# writable, everything else read-only; no prlimit caps and no timeout for
# long-lived workers) + `fleet run`. Logs to <loop>/engine-run.log.
# --print shows the final command without running it.
# Stop with: touch <loop>/STOP (drains between cycles) or kill the fleet pid.
set -u

PRINT=0
if [ "${1:-}" = "--print" ]; then
	PRINT=1
	shift
fi
LOOP="${1:-}"
if [ -z "$LOOP" ]; then
	echo "usage: $0 [--print] LOOPDIR (must end in loops/research)" >&2
	exit 2
fi
case "$LOOP" in
	*/loops/research) ;;
	*)
		echo "refusing: LOOPDIR must end in loops/research, got: $LOOP" >&2
		exit 2
		;;
esac
if [ ! -d "$LOOP" ]; then
	echo "no such dir: $LOOP" >&2
	exit 2
fi
PROJ="$(dirname "$(dirname "$LOOP")")"
# Canonical PATH install (symlink → workspace build output, never a copy).
FLEET_BIN="/home/aleksic/.local/bin/fleet"
# Build-version stamp (operator order 2026-09-18, no hot-reload): the
# worker reads this at boot and once per cycle, exiting cleanly on drift
# so the revive restarts it onto the new build. Deploy step MUST refresh
# it after every rebuild while workers run:
#   git -C <fleet-ops> rev-parse HEAD > ~/.local/state/fleet/version
# (Launch stamps it too, so fresh workers never drift on day one.)
# Fail-safe: an unstamped fleet behaves exactly as before.
FLEET_SRC="$(cd "$(dirname "$0")/../.." && pwd)"
SB="$(cd "$(dirname "$0")" && pwd)/sandbox.sh"
if [ ! -x "$FLEET_BIN" ]; then
	echo "no fleet binary: $FLEET_BIN" >&2
	exit 2
fi

if [ "$PRINT" -eq 1 ]; then
	printf '%q ' "$SB" --writable "$LOOP" --writable "$PROJ" \
		--writable "$HOME/.local/state/rocserve" \
		--writable "$HOME/.local/state/reopencode" \
		--writable "$HOME/.local/state/fleet" \
		--writable "$HOME/.cache" --timeout 0 -- "$FLEET_BIN" run "$LOOP"
	echo
	exit 0
fi
# Own cwd first: engine children and fleet cwd-detection expect the loop dir.
cd "$LOOP" || { echo "cannot cd: $LOOP" >&2; exit 2; }
mkdir -p "$HOME/.local/state/fleet" 2>/dev/null || true
git -C "$FLEET_SRC" rev-parse HEAD > "$HOME/.local/state/fleet/version" 2>/dev/null || true
setsid nohup env SANDBOX_PRLIMIT=0 "$SB" --writable "$LOOP" \
	--writable "$PROJ" --writable "$HOME/.local/state/rocserve" \
	--writable "$HOME/.local/state/reopencode" \
	--writable "$HOME/.local/state/fleet" \
	--writable "$HOME/.cache" --timeout 0 -- "$FLEET_BIN" run "$LOOP" \
	> "$LOOP/engine-run.log" 2>&1 < /dev/null &
echo "started engine worker for $LOOP (launcher $!; log $LOOP/engine-run.log)"
