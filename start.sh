#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
BACKEND_HOST="${BACKEND_HOST:-0.0.0.0}"
FRONTEND_HOST="${FRONTEND_HOST:-0.0.0.0}"
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:${BACKEND_PORT}}"

for command_name in uv pnpm; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$command_name" >&2
    exit 1
  fi
done

printf 'Preparing backend dependencies...\n'
uv sync --project "$ROOT_DIR/backend"

printf 'Preparing frontend dependencies...\n'
(
  cd "$ROOT_DIR/frontend"
  pnpm install --frozen-lockfile
)

backend_pid=""
frontend_pid=""

cleanup() {
  trap - EXIT INT TERM
  [[ -n "$backend_pid" ]] && kill "$backend_pid" 2>/dev/null || true
  [[ -n "$frontend_pid" ]] && kill "$frontend_pid" 2>/dev/null || true
  wait "$backend_pid" "$frontend_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

printf 'Starting API at http://localhost:%s\n' "$BACKEND_PORT"
(
  cd "$ROOT_DIR"
  exec uv run --project "$ROOT_DIR/backend" uvicorn backend.app:app --host "$BACKEND_HOST" --port "$BACKEND_PORT" --reload
) &
backend_pid=$!

printf 'Starting web app at http://localhost:%s\n' "$FRONTEND_PORT"
(
  cd "$ROOT_DIR/frontend"
  exec env NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" pnpm dev --hostname "$FRONTEND_HOST" --port "$FRONTEND_PORT"
) &
frontend_pid=$!

if wait -n "$backend_pid" "$frontend_pid"; then
  exit_code=0
else
  exit_code=$?
fi
printf 'One service stopped (exit %s); stopping the other service.\n' "$exit_code" >&2
exit "$exit_code"
