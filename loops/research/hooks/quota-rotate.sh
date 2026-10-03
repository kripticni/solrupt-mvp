#!/usr/bin/env bash
# quota-rotate.sh — spacestation quota hook: thin wrapper over the tor-egress module.
# Zero logic fork (DRY): all rotation semantics live in
# /home/aleksic/ideas/tor-egress/egress/egress-rotate.sh (policy: notes/r06-lever-policy.md).
# Tor-first: EGRESS_ORDER defaults to "tor"; C90_CMD empty here = tor-only
# (skipped levers are logged by the module, never faked).
# Usage: quota-rotate.sh [iter] [out_file] (same $1/$2 hook contract as the module).
set -e
export TOR_SOCKS="${TOR_SOCKS:-127.0.0.1:19350}"
export EGRESS_ORDER="${EGRESS_ORDER:-tor}"
export TOR_TRIES="${TOR_TRIES:-3}"
export LOG="${LOG:-/tmp/spacestation_egress.log}"
exec /home/aleksic/ideas/tor-egress/egress/egress-rotate.sh "$@"
