#!/usr/bin/env bash
set -Eeuo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec "$ROOT_DIR/backend/.venv/bin/python" "$ROOT_DIR/backend/tests/capacity_smoke.py" "$@"
