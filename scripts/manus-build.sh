#!/bin/sh
# The sole Manus build entry point. Keep provider settings free of copied bootstrap code.
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
if [ "${1:-}" != --pinned-runtime ]; then
  exec sh scripts/manus-node.sh -- sh scripts/manus-build.sh --pinned-runtime
fi
actual=$(node --version)
[ "$actual" = v22.23.4 ] || { echo "JCEE runtime mismatch: $actual (expected v22.23.4)" >&2; exit 1; }
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
actual_pnpm=$(corepack pnpm@10.4.1 --version)
[ "$actual_pnpm" = 10.4.1 ] || { echo "JCEE pnpm mismatch: $actual_pnpm (expected 10.4.1)" >&2; exit 1; }
echo "JCEE build runtime: node=$actual pnpm=$actual_pnpm" >&2
corepack pnpm@10.4.1 install --frozen-lockfile
corepack pnpm@10.4.1 build
