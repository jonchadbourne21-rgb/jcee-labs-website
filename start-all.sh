#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
MOBILE_PORT="${MOBILE_PORT:-8081}"
BACKEND_HOST="${BACKEND_HOST:-0.0.0.0}"
FRONTEND_HOST="${FRONTEND_HOST:-0.0.0.0}"
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:${BACKEND_PORT}}"
EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-$NEXT_PUBLIC_API_URL}"
VOW_ASSURANCE_DIR="${VOW_ASSURANCE_DIR:-$ROOT_DIR/backend/.data/vow}"
VOW_SWEEP_INTERVAL_SECONDS="${VOW_SWEEP_INTERVAL_SECONDS:-60}"
export VOW_ASSURANCE_DIR VOW_SWEEP_INTERVAL_SECONDS

for command_name in uv pnpm; do
  command -v "$command_name" >/dev/null 2>&1 || { printf 'Missing required command: %s\n' "$command_name" >&2; exit 1; }
done

uv sync --project "$ROOT_DIR/backend"
pnpm --dir "$ROOT_DIR/frontend" install --frozen-lockfile
pnpm --dir "$ROOT_DIR/mobile" install --frozen-lockfile

backend_pid=""; worker_pid=""; frontend_pid=""; mobile_pid=""
cleanup() {
  trap - EXIT INT TERM
  for pid in "$backend_pid" "$worker_pid" "$frontend_pid" "$mobile_pid"; do
    [[ -n "$pid" ]] && kill "$pid" 2>/dev/null || true
  done
  wait "$backend_pid" "$worker_pid" "$frontend_pid" "$mobile_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

(
  cd "$ROOT_DIR"
  exec uv run --project "$ROOT_DIR/backend" uvicorn backend.app:app --host "$BACKEND_HOST" --port "$BACKEND_PORT" --reload
) & backend_pid=$!
(
  cd "$ROOT_DIR"
  exec uv run --project "$ROOT_DIR/backend" python -m backend.vow_worker
) & worker_pid=$!
(
  cd "$ROOT_DIR/frontend"
  exec env NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" pnpm dev --hostname "$FRONTEND_HOST" --port "$FRONTEND_PORT"
) & frontend_pid=$!
(
  cd "$ROOT_DIR/mobile"
  exec env EXPO_PUBLIC_API_URL="$EXPO_PUBLIC_API_URL" pnpm expo start --web --host lan --port "$MOBILE_PORT"
) & mobile_pid=$!

printf 'API:     http://localhost:%s\nWeb:     http://localhost:%s\nExpo:    http://localhost:%s\n' "$BACKEND_PORT" "$FRONTEND_PORT" "$MOBILE_PORT"
wait -n "$backend_pid" "$worker_pid" "$frontend_pid" "$mobile_pid"
