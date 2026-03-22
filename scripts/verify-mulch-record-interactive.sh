#!/usr/bin/env bash
# Smoke checks for scripts/mulch-record-interactive.sh (non-interactive, no writes).
# Asserts our script’s wiring only: quit/cancel exits, dry-run command line (domain menu, --type, flags).
# Uses a temp git repo with two domains for multi-domain paths. Does not test Mulch CLI semantics upstream.
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

# Expected substrings in captured `ml record … --dry-run` output (avoid duplicated literals)
readonly RECORD_ALPHA='record alpha'
readonly FLAG_DESCRIPTION='--description'

assert_contains() {
  local label=$1
  local haystack=$2
  shift 2
  local m
  for m in "$@"; do
    # Literal substring match (avoid [[ ]] glob semantics for *, ?, [ in m)
    if ! grep -Fq -- "$m" <<<"$haystack"; then
      echo "FAIL: $label — missing expected substring '$m'" >&2
      echo "--- output ---" >&2
      echo "$haystack" >&2
      exit 1
    fi
  done
  echo "ok: $label"
  return 0
}

expect_nonzero() {
  local name=$1
  shift
  set +e
  # Capture stdout+stderr so intentional "error: cancelled" lines do not look like failures
  # when callers redirect only stdout (e.g. npm run … >/dev/null).
  local captured
  captured=$("$@" 2>&1)
  local code=$?
  set -e
  if [[ $code -eq 0 ]]; then
    echo "FAIL: expected non-zero exit for: $name" >&2
    echo "$captured" >&2
    exit 1
  fi
  echo "ok: $name (exit $code)"
  return 0
}

# --- Single-domain repo (this workspace): quit / cancel paths ---
expect_nonzero "quit at type menu" bash -c "printf 'q\n' | bash '$SCRIPT'"

expect_nonzero "cancel after dry-run (single domain)" bash -c "printf '1\n\ndesc\n\n\n\ny\nn\n' | bash '$SCRIPT'"

# --- Temporary git repo with two domains (multi-domain menu + type flags) ---
FIXTURE=$(mktemp -d)
cleanup() {
  rm -rf "$FIXTURE"
  return 0
}
trap cleanup EXIT

(
  cd "$FIXTURE"
  git init -q
  mkdir -p .mulch
  cat >.mulch/mulch.config.yaml <<'YAML'
version: '1'
domains:
  - alpha
  - beta
governance:
  max_entries: 100
  warn_entries: 150
  hard_limit: 200
classification_defaults:
  shelf_life:
    tactical: 14
    observational: 30
YAML
  git add .mulch/mulch.config.yaml
  git -c user.email=verify@local -c user.name=verify commit -q -m init
)

run_in_fixture() {
  local input=$1
  local out rc
  out=$(
    cd "$FIXTURE"
    export PATH="$ROOT/node_modules/.bin:$PATH"
    printf '%b' "$input" | bash "$SCRIPT" 2>&1
  )
  rc=$?
  printf '%s' "$out"
  return "$rc"
}

expect_cancel_output() {
  local label=$1
  local out=$2
  local code=$3
  if [[ "$code" -eq 0 ]]; then
    echo "FAIL: $label — expected non-zero exit after cancel" >&2
    echo "$out" >&2
    exit 1
  fi
  echo "ok: $label (exit $code)"
  return 0
}

# domain 1=alpha, convention, default classification, dry-run then cancel
set +e
OUT=$(run_in_fixture '1\n1\n\nconv_desc\n\n\n\ny\nn\n')
CODE=$?
set -e
expect_cancel_output "fixture: cancel after dry-run (convention / alpha)" "$OUT" "$CODE"
assert_contains "fixture: convention uses domain alpha + description" "$OUT" \
  "$RECORD_ALPHA" '--type convention' "$FLAG_DESCRIPTION" 'conv_desc' '--dry-run'

# domain 2=beta, decision
set +e
OUT=$(run_in_fixture '2\n4\ntactical\nMyTitle\nMyRat\n\n\n\ny\nn\n')
CODE=$?
set -e
expect_cancel_output "fixture: cancel after dry-run (decision / beta)" "$OUT" "$CODE"
assert_contains "fixture: decision flags on beta" "$OUT" \
  'record beta' '--type decision' '--title' 'MyTitle' '--rationale' 'MyRat'

# domain 2=beta, failure
set +e
OUT=$(run_in_fixture '2\n3\ntactical\nfdesc\nfres\n\n\n\ny\nn\n')
CODE=$?
set -e
expect_cancel_output "fixture: cancel after dry-run (failure / beta)" "$OUT" "$CODE"
assert_contains "fixture: failure flags" "$OUT" \
  'record beta' '--type failure' "$FLAG_DESCRIPTION" 'fdesc' '--resolution' 'fres'

# domain 1=alpha, pattern
set +e
OUT=$(run_in_fixture '1\n2\ntactical\npatname\npatdesc\n\n\n\ny\nn\n')
CODE=$?
set -e
expect_cancel_output "fixture: cancel after dry-run (pattern / alpha)" "$OUT" "$CODE"
assert_contains "fixture: pattern flags" "$OUT" \
  "$RECORD_ALPHA" '--type pattern' '--name' 'patname' "$FLAG_DESCRIPTION" 'patdesc'

# domain 1=alpha, reference (same required fields as guide)
set +e
OUT=$(run_in_fixture '1\n5\ntactical\nrefname\nrefdesc\n\n\n\ny\nn\n')
CODE=$?
set -e
expect_cancel_output "fixture: cancel after dry-run (reference / alpha)" "$OUT" "$CODE"
assert_contains "fixture: reference flags" "$OUT" \
  "$RECORD_ALPHA" '--type reference' '--name' 'refname' "$FLAG_DESCRIPTION" 'refdesc'

# domain 1=alpha, guide (same prompts as reference)
set +e
OUT=$(run_in_fixture '1\n6\ntactical\nguide_name\nguide_desc\n\n\n\ny\nn\n')
CODE=$?
set -e
expect_cancel_output "fixture: cancel after dry-run (guide / alpha)" "$OUT" "$CODE"
assert_contains "fixture: guide flags" "$OUT" \
  "$RECORD_ALPHA" '--type guide' '--name' 'guide_name' "$FLAG_DESCRIPTION" 'guide_desc'

echo "verify-mulch-record-interactive: all checks passed"
