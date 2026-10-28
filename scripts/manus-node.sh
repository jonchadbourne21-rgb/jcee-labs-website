#!/bin/sh
# JCEE Labs: pinned Node bootstrap for supported Linux build environments.
set -eu
version=22.23.4
if [ "${1:-}" = "--" ]; then shift; fi
[ "$#" -gt 0 ] || { echo 'Missing downstream command' >&2; exit 2; }
if command -v node >/dev/null 2>&1 && [ "${JCEE_FORCE_NODE_BOOTSTRAP:-0}" != 1 ]; then
  actual=$(node --version 2>&1) || { echo "System node cannot run: $actual" >&2; exit 1; }
  if [ "$actual" = "v$version" ]; then exec "$@"; fi
fi
[ "$(uname -s)" = Linux ] || { echo 'Unsupported OS; configure provider runtime' >&2; exit 1; }
case "$(uname -m)" in x86_64|amd64) arch=x64 ;; aarch64|arm64) arch=arm64 ;; *) echo 'Unsupported architecture' >&2; exit 1 ;; esac
libcinfo=$(getconf GNU_LIBC_VERSION 2>/dev/null || true)
case "$libcinfo" in 'glibc '*) libc=glibc ;; *) libc=unknown ;; esac
if [ "$libc" = unknown ]; then
  libcinfo=$(ldd --version 2>&1 || true)
  case "$libcinfo" in *musl*) libc=musl ;; *GLIBC*|*'GNU libc'*) libc=glibc ;; *) echo 'Unknown libc; configure provider runtime' >&2; exit 1 ;; esac
fi
case "$arch:$libc" in
  x64:glibc) platform=linux-x64; checksum=b8492284c76a54baf58d61668dd0e41ee0fc98adabf9503d30f05d08f55b4406 ;;
  x64:musl) platform=linux-x64-musl; checksum=63189402eaa222aabf51b4983e512592131cd2d4a9efc3ad9bf291fe74e3e4de ;;
  arm64:glibc) platform=linux-arm64; checksum=f7a1e486dbc8b286847815b477d4fb5e9fb963ed4489c3e1588853d685f589f9 ;;
  *) echo 'Unsupported architecture/libc; configure provider runtime' >&2; exit 1 ;;
esac
for tool in curl sha256sum tar gzip mktemp; do command -v "$tool" >/dev/null 2>&1 || { echo "Missing prerequisite: $tool" >&2; exit 1; }; done
# Existing release source checker excludes .pnpm-store; never mutate tracked source.
base="$PWD/.pnpm-store/jcee-node"
mkdir -p "$base"
if command -v findmnt >/dev/null 2>&1; then
  opts=$(findmnt -n -o OPTIONS -T "$base" 2>/dev/null || true)
  case ",$opts," in *,noexec,*) echo "Build workspace forbids execution: $base" >&2; exit 1 ;; esac
fi
stage=$(mktemp -d "$base/stage.XXXXXXXX")
cleanup() { rm -rf "$stage"; }
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
archive="node-v$version-$platform.tar.gz"
echo "JCEE node bootstrap: arch=$arch libc=$libc archive=$archive" >&2
curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' --max-time 180 "https://nodejs.org/dist/v$version/$archive" -o "$stage/$archive"
printf '%s  %s\n' "$checksum" "$stage/$archive" | sha256sum -c -
tar -xzf "$stage/$archive" -C "$stage"
binary="$stage/node-v$version-$platform/bin/node"
[ -x "$binary" ] || { echo 'Extracted binary missing or not executable' >&2; exit 1; }
if actual=$("$binary" --version 2>&1); then :; else
  code=$?
  echo "Node execution failed (exit $code): $actual" >&2
  if command -v file >/dev/null 2>&1; then file "$binary" >&2 || true; fi
  if command -v readelf >/dev/null 2>&1; then readelf -l "$binary" 2>/dev/null | grep interpreter >&2 || true; fi
  echo 'Provider must support this executable; no mount-policy workaround attempted' >&2
  exit "$code"
fi
[ "$actual" = "v$version" ] || { echo "Node version mismatch: $actual" >&2; exit 1; }
echo "JCEE node-verified: $actual" >&2
PATH="$(dirname "$binary"):$PATH"
export PATH
"$@"
