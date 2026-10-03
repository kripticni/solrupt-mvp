#!/usr/bin/env bash
# sandbox.sh — minimal sandbox, strongest available level wins.
# Prints "LEVEL=<name> REASON=<why>" on stdout first line every run,
# then execs the payload at that level. No containment → refuse (exit 99).
# Levels (strongest first):
#   contain.bwrap     — full isolation (root read-only, scratch writable,
#                        fresh /tmp + /proc + /dev, own pids). Needs bwrap.
#   confine.landlock  — kernel path confinement, no namespaces needed.
#                        Needs Landlock ABI + helper (see SANDBOX_LANDLOCK_HELPER).
#   compat.proot      — userspace copy-jail for stock Android/Termux.
#                        Inputs are COPIED in, originals never mapped. Needs proot.
# Usage: sandbox.sh [--readable DIR]... [--writable DIR]... [--timeout SECS] -- CMD [ARGS...]
#   --readable: expose read-only inside (repeatable). Later --readable wins over
#           --writable on overlap, so `--writable PROJ --readable PROJ/.git`
#           gives a writable project with an undeletable .git.
#           (--tree is an old alias for --readable.)
#   --writable: keep writable inside, writes survive on host (repeatable).
#           (--scratch is an old alias for --writable.)
# Env: SANDBOX_TIMEOUT (60; 0 disables — for long-lived supervised workers),
#   SANDBOX_PRLIMIT (1; 0 skips prlimit — same audience),
#   SANDBOX_LANDLOCK_HELPER (path).
# Limits: nice -n 19, timeout 60 default, prlimit --as --cpu when present
# (never required: prlimit is 64-bit-only; Termux must work without it).
set -u

TIMEOUT="${SANDBOX_TIMEOUT:-60}"
LANDLOCK_HELPER="${SANDBOX_LANDLOCK_HELPER:-}"
TREES=""
SCRATCHES=""

while [ $# -gt 0 ]; do
	case "$1" in
		--readable|--read|--ro|--tree)
			[ $# -ge 2 ] || { echo "usage: $0 [--readable DIR] [--writable DIR] [--timeout SECS] -- CMD..." >&2; exit 2; }
			TREES="$TREES	$2"
			shift 2
			;;
		--writable|--write|--rw|--scratch)
			[ $# -ge 2 ] || { echo "usage: $0 [--readable DIR] [--writable DIR] [--timeout SECS] -- CMD..." >&2; exit 2; }
			SCRATCHES="$SCRATCHES	$2"
			shift 2
			;;
		--timeout)
			[ $# -ge 2 ] || { echo "usage: $0 [--readable DIR] [--writable DIR] [--timeout SECS] -- CMD..." >&2; exit 2; }
			TIMEOUT="$2"
			shift 2
			;;
		--help|-h)
			echo "usage: $0 [--readable DIR] [--writable DIR] [--timeout SECS] -- CMD [ARGS...]" >&2
			exit 0
			;;
		--double-dash|--)
			shift
			break
			;;
		--*)
			echo "unknown flag: $1 (usage: $0 [--readable DIR] [--writable DIR] [--timeout SECS] -- CMD...)" >&2
			exit 2
			;;
		*)
			break
			;;
	esac
done

if [ $# -eq 0 ]; then
	echo "usage: $0 [--readable DIR] [--writable DIR] [--timeout SECS] -- CMD [ARGS...]" >&2
	exit 2
fi

# Fail fast on a bad timeout: otherwise `timeout "$TIMEOUT"` dies with
# rc=125 AFTER the LEVEL line prints, which misreports a working rung
# as green while the payload never ran (found live 2026-09-17:
# `--timeout foo` printed LEVEL=contain.bwrap then RC=125 from timeout).
# 0 disables (passed straight to timeout); suffixes smhd allowed.
# Validate one decimal number and an optional unit before probing a level.
# Multiple separated dots (e.g. 1.2.3) must not reach timeout after LEVEL.
if [[ ! "$TIMEOUT" =~ ^[0-9]+([.][0-9]+)?[smhd]?$ ]]; then
	echo "invalid timeout: '$TIMEOUT' (usage: $0 [--timeout SECS] -- CMD...)" >&2
	exit 2
fi

# Resource wrap: nice + timeout always (timeout 0 disables); prlimit only when
# present AND SANDBOX_PRLIMIT != 0 (Termux-safe; long-lived workers opt out).
# NOTE: no --nproc cap — RLIMIT_NPROC counts ALL user processes, so a tight cap
# starves fork on busy boxes. Fork containment comes from timeout (+ pidns at
# contain.bwrap) instead.
wrap_exec() {
	if [ "${SANDBOX_PRLIMIT:-1}" != "0" ] && command -v prlimit >/dev/null 2>&1; then
		exec nice -n 19 timeout "$TIMEOUT" prlimit --as=2000000000 --cpu=60 "$@"
	else
		exec nice -n 19 timeout "$TIMEOUT" "$@"
	fi
}

probe_bwrap() {
	command -v bwrap >/dev/null 2>&1 || return 1
	# Order matters: --ro-bind / / FIRST, then --proc/--dev/--tmpfs over
	# it. Reversed, the read-only root covers /dev and /dev/null ends
	# up read-only inside, which breaks every 2>/dev/null in payloads
	# (found live 2026-09-15: driver lock guard refused on exact that).
	nice -n 19 timeout 60 bwrap --ro-bind / / --proc /proc --dev /dev --tmpfs /tmp /bin/true >/dev/null 2>&1 || return 1
	nice -n 19 timeout 60 bwrap --ro-bind / / --proc /proc --dev /dev --tmpfs /tmp /bin/sh -c 'echo x > /dev/null' >/dev/null 2>&1
}

landlock_abi() {
	# Landlock has no securityfs ABI file and is not a filesystem.
	# Query the kernel; optional Python is diagnostic, never a dependency
	# for the namespace rung. Unknown architectures must not guess syscall IDs.
	if ! command -v python3 >/dev/null 2>&1; then
		echo "unknown-python3-missing"
		return
	fi
	local result
	if result="$(nice -n 19 timeout 60 python3 - <<'PY'
import ctypes
import platform

machine = platform.machine().lower()
if machine not in ('x86_64', 'amd64', 'aarch64', 'arm64', 'armv7l', 'armv8l', 'i386', 'i686', 'riscv64'):
    print('unknown-architecture')
else:
    libc = ctypes.CDLL(None, use_errno=True)
    libc.syscall.restype = ctypes.c_long
    # These Linux ABIs use __NR_landlock_create_ruleset = 444.
    # Exclude x32, whose syscall numbers have an additional ABI bit.
    if machine in ('x86_64', 'amd64') and ctypes.sizeof(ctypes.c_void_p) != 8:
        print('unknown-x32-abi')
    else:
        version = libc.syscall(ctypes.c_long(444), ctypes.c_void_p(),
                               ctypes.c_size_t(0), ctypes.c_uint(1))
        print(version if version > 0 else 'unavailable-errno-%d' % ctypes.get_errno())
PY
	)"; then
		printf '%s\n' "${result:-unknown-empty-result}"
	else
		echo "unknown-query-failed"
	fi
}

probe_proot() {
	command -v proot >/dev/null 2>&1 || return 1
	unset LD_PRELOAD
	nice -n 19 timeout 60 proot /bin/true >/dev/null 2>&1
}

# ---- contain.bwrap: full isolation (strongest) ----
if probe_bwrap; then
	# Flag order is load-bearing (see probe_bwrap): root read-only
	# first, then fresh /proc + /dev + /tmp over it, then scratch
	# dirs writable, then tree dirs read-only (so --readable wins on
	# overlap).
	BARGS=(--die-with-parent --unshare-pid --unshare-uts --unshare-ipc
		--ro-bind / / --proc /proc --dev /dev --tmpfs /tmp)
	OLDIFS="$IFS"; IFS="	"
	for s in $SCRATCHES; do
		[ -n "$s" ] || continue
		mkdir -p "$s" 2>/dev/null || true
		BARGS+=(--bind "$s" "$s")
	done
	for t in $TREES; do
		[ -n "$t" ] || continue
		BARGS+=(--ro-bind "$t" "$t")
	done
	IFS="$OLDIFS"
	echo "LEVEL=contain.bwrap REASON=bwrap-probe-passed-root-ro-scratch-rw"
	# shellcheck disable=SC2086
	if [ "${SANDBOX_PRLIMIT:-1}" != "0" ] && command -v prlimit >/dev/null 2>&1; then
		exec nice -n 19 timeout "$TIMEOUT" prlimit --as=2000000000 --cpu=60 bwrap "${BARGS[@]}" -- "$@"
	else
		exec nice -n 19 timeout "$TIMEOUT" bwrap "${BARGS[@]}" -- "$@"
	fi
	echo "sandbox: contain.bwrap exec failed rc=$?" >&2
	exit 73
fi
BWRAPWHY="bwrap-probe-failed-or-missing"
# Emit at the transition, not only at final refusal: a successful lower
# level must not hide why the stronger level was skipped.
printf 'DOWNGRADE=contain.bwrap REASON=%s\n' "$BWRAPWHY" >&2

# ---- confine.landlock: kernel path confinement where namespaces are off ----
_ABI="$(landlock_abi)"
_HELPER="${LANDLOCK_HELPER:-$(command -v landlock-restrict 2>/dev/null || true)}"
case "$_ABI" in
	''|*[!0-9]*|0) _ABI_OK=0 ;;
	*) _ABI_OK=1 ;;
esac
if [ "$_ABI_OK" = 1 ] && [ -n "$_HELPER" ] && [ -x "$_HELPER" ]; then
	echo "LEVEL=confine.landlock REASON=abi-${_ABI}-helper-present"
	wrap_exec "$_HELPER" ${TREES:+--ro $TREES} ${SCRATCHES:+--rw $SCRATCHES} -- "$@"
	echo "sandbox: confine.landlock exec failed rc=$?" >&2
	exit 73
fi
if [ "$_ABI_OK" != 1 ]; then
	LANDLOCKWHY="landlock-abi-${_ABI}"
elif [ -z "$_HELPER" ]; then
	LANDLOCKWHY="landlock-helper-missing(abi=${_ABI})"
else
	LANDLOCKWHY="landlock-helper-not-executable(abi=${_ABI})"
fi
printf 'DOWNGRADE=confine.landlock REASON=%s\n' "$LANDLOCKWHY" >&2

# abspath: absolute path without readlink -f (absent on Termux).
abspath() {
	case "$1" in
		/*) _p="$1" ;;
		*) _p="$PWD/$1" ;;
	esac
	# strip trailing slashes (keep root).
	while [ "${_p%/}" != "$_p" ] && [ "$_p" != "/" ]; do _p="${_p%/}"; done
	printf '%s\n' "$_p"
}

# stage_text_tree SRC DST — text-only minimum set for the copy-jail.
# Recreates dirs, preserves symlinks, copies empty + text regular files
# (cp -p, keeps exec bit). Skips: .git/objects, *.pack, files >= 5 MB,
# non-empty files grep -I calls binary. Everything else stays out, so no
# binaries or pack blobs bloat /tmp.
stage_text_tree() {
	_src="$1"; _dst="$2"
	[ -d "$_src" ] || return 0
	mkdir -p "$_dst" 2>/dev/null || return 1
	# dirs (minus object store).
	(cd "$_src" 2>/dev/null && find . -mindepth 1 -type d ! -path './.git/objects*' -print0 2>/dev/null || true) |
	while IFS= read -r -d '' _d; do
		mkdir -p "$_dst/$_d" 2>/dev/null || true
	done
	# symlinks as-is (cheap, no content copied).
	(cd "$_src" 2>/dev/null && find . -mindepth 1 -type l ! -path './.git/objects*' -print0 2>/dev/null || true) |
	while IFS= read -r -d '' _l; do
		mkdir -p "$_dst/$(dirname "$_l")" 2>/dev/null || true
		cp -P "$_src/$_l" "$_dst/$_l" 2>/dev/null || true
	done
	# text + empty regular files under 5 MB.
	(cd "$_src" 2>/dev/null && find . -mindepth 1 -type f ! -path './.git/objects*' ! -name '*.pack' -size -5M -print0 2>/dev/null || true) |
	while IFS= read -r -d '' _f; do
		if [ ! -s "$_src/$_f" ]; then
			mkdir -p "$_dst/$(dirname "$_f")" 2>/dev/null || true
			cp -p "$_src/$_f" "$_dst/$_f" 2>/dev/null || true
		elif grep -Iq '^' "$_src/$_f" 2>/dev/null; then
			mkdir -p "$_dst/$(dirname "$_f")" 2>/dev/null || true
			cp -p "$_src/$_f" "$_dst/$_f" 2>/dev/null || true
		fi
	done
}

# ---- compat.proot: userspace copy-jail (stock Android/Termux) ----
if probe_proot; then
	unset LD_PRELOAD
	JAIL="$(mktemp -d /tmp/sandbox-proot-XXXXXX 2>/dev/null)" || {
		PROOTWHY="proot-jail-mktemp-failed"
		JAIL=""
	}
	if [ -n "${JAIL:-}" ]; then
		OLDIFS="$IFS"; IFS="	"
		# Array, not a string: tree/scratch paths may contain spaces
		# (the probe uses "read only tree" / "writable scratch"), and an
		# unquoted $PBARGS word-splits every -b bind at spaces. Found by
		# inspection 2026-09-18; proot is absent on Gentoo so no live-fire
		# here — verified with a stub proot below instead.
		PBARGS=(-r "$JAIL" -w /)
		for t in $TREES; do
			[ -n "$t" ] || continue
			# Mirror absolute path inside the jail so the model sees the real
			# layout; text-only stage, originals never mapped (proot has no
			# read-only bind).
			_tabs="$(abspath "$t")"
			mkdir -p "$JAIL$_tabs" 2>/dev/null || true
			stage_text_tree "$_tabs" "$JAIL$_tabs"
		done
		for s in $SCRATCHES; do
			[ -n "$s" ] || continue
			mkdir -p "$s" 2>/dev/null || true
			_sabs="$(abspath "$s")"
			mkdir -p "$JAIL$_sabs" 2>/dev/null || true
			PBARGS+=(-b "$_sabs:$_sabs")
		done
		# Runtime dirs so payload binaries resolve inside the new root.
		for _r in /bin /lib /lib64 /usr /etc /tmp /dev /proc; do
			[ -e "$_r" ] || continue
			PBARGS+=(-b "$_r:$_r")
		done
		IFS="$OLDIFS"
		echo "LEVEL=compat.proot REASON=proot-present-text-only-mirror-scratch-bound"
		if [ "${SANDBOX_PRLIMIT:-1}" != "0" ] && command -v prlimit >/dev/null 2>&1; then
			nice -n 19 timeout "$TIMEOUT" prlimit --as=2000000000 --cpu=60 proot "${PBARGS[@]}" -- "$@"
			RC=$?
		else
			nice -n 19 timeout "$TIMEOUT" proot "${PBARGS[@]}" -- "$@"
			RC=$?
		fi
		rm -rf "$JAIL" 2>/dev/null || true
		exit $RC
	fi
else
	PROOTWHY="proot-missing-or-probe-failed"
fi

printf 'DOWNGRADE=compat.proot REASON=%s\n' "${PROOTWHY:-unknown}" >&2

# ---- deny: no confinement available — refuse, never run exposed ----
echo "LEVEL=deny REASON=no-level-available(bwrap:${BWRAPWHY};landlock:${LANDLOCKWHY:-unknown};proot:${PROOTWHY:-unknown})" >&2
echo "LEVEL=deny REASON=no-level-available"
echo "E_SANDBOX_UNAVAILABLE: refusing to run without containment" >&2
exit 99
