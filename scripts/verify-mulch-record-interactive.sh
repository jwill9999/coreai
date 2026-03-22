#!/usr/bin/env bash
# Smoke checks for scripts/mulch-record-interactive.sh (non-interactive, no writes).
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"
export PATH="$ROOT/node_modules/.bin:$PATH"

if ! command -v ml >/dev/null 2>&1; then
  echo "error: ml not found — run npm install at repo root (needs @os-eco/mulch-cli)" >&2
  exit 1
fi

SCRIPT="$ROOT/scripts/mulch-record-interactive.sh"
bash -n "$SCRIPT"

expect_nonzero() {
  local name=$1
  shift
  set +e
  "$@"
  local code=$?
  set -e
  if [[ $code -eq 0 ]]; then
    echo "FAIL: expected non-zero exit for: $name" >&2
    exit 1
  fi
  echo "ok: $name (exit $code)"
}

# Quit at record-type menu
expect_nonzero "quit at type menu" bash -c "printf 'q\n' | bash '$SCRIPT'"

# Dry-run then decline to apply (no write)
expect_nonzero "cancel after dry-run" bash -c "printf '1\n\ndesc\n\n\n\ny\nn\n' | bash '$SCRIPT'"

echo "verify-mulch-record-interactive: all checks passed"
