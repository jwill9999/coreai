#!/usr/bin/env bash
# Interactive wrapper for `mulch record` / `ml record`.
# Prompts for record type and required fields per `mulch record --help`.
# Defaults domain from .mulch/mulch.config.yaml when exactly one domain is listed.
# PATH / local vs global CLI: see .mulch/README.md ("Install and which binary runs").

set -euo pipefail

die() {
  echo "error: $*" >&2
  exit 1
}

trim() {
  local s=$1
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

find_mulch() {
  if command -v ml >/dev/null 2>&1; then
    printf '%s' "$(command -v ml)"
    return
  fi
  if command -v mulch >/dev/null 2>&1; then
    printf '%s' "$(command -v mulch)"
    return
  fi
  die "neither 'ml' nor 'mulch' found in PATH (install @os-eco/mulch-cli)"
}

# Read domain names from mulch.config.yaml (simple parser: lines under `domains:` starting with "  - ").
load_domains() {
  local file=$1
  [[ -f "$file" ]] || die "missing $file (run mulch init in this repo)"
  local in_domains=0
  domains=()
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ ^domains:[[:space:]]*$ ]]; then
      in_domains=1
      continue
    fi
    if [[ $in_domains -eq 1 ]]; then
      if [[ "$line" =~ ^[[:space:]]*-[[:space:]]+(.+)$ ]]; then
        local d
        d=$(trim "${BASH_REMATCH[1]}")
        # strip optional quotes
        d="${d#\"}"
        d="${d%\"}"
        d="${d#\'}"
        d="${d%\'}"
        [[ -n "$d" ]] && domains+=("$d")
      elif [[ "$line" =~ ^[[:alpha:]_#] ]] && ! [[ "$line" =~ ^[[:space:]] ]]; then
        break
      fi
    fi
  done <"$file"
}

pick_domain() {
  local count=${#domains[@]}
  ((count > 0)) || die "no domains in .mulch/mulch.config.yaml — use 'mulch add <domain>' first"
  if ((count == 1)); then
    domain=${domains[0]}
    echo "Using domain '$domain' (only domain in .mulch/mulch.config.yaml)."
    return
  fi
  echo "Select domain:"
  local i=1
  for d in "${domains[@]}"; do
    echo "  $i) $d"
    i=$((i + 1))
  done
  echo "  q) quit"
  while true; do
    read -r -p "Choice [1-$count]: " choice || die "cancelled"
    choice=$(trim "$choice")
    [[ "$choice" == "q" || "$choice" == "Q" ]] && die "cancelled"
    if [[ "$choice" =~ ^[0-9]+$ ]] && ((choice >= 1 && choice <= count)); then
      domain=${domains[$((choice - 1))]}
      return
    fi
    echo "Invalid choice." >&2
  done
}

pick_type() {
  echo
  echo "Record type:"
  echo "  1) convention   — description (or content)"
  echo "  2) pattern      — name + description"
  echo "  3) failure      — description + resolution"
  echo "  4) decision     — title + rationale"
  echo "  5) reference    — name + description"
  echo "  6) guide        — name + description"
  echo "  q) quit"
  while true; do
    read -r -p "Choice [1-6]: " c || die "cancelled"
    c=$(trim "$c")
    case "$c" in
    q | Q) die "cancelled" ;;
    1) rectype=convention ;;
    2) rectype=pattern ;;
    3) rectype=failure ;;
    4) rectype=decision ;;
    5) rectype=reference ;;
    6) rectype=guide ;;
    *) echo "Invalid choice." >&2 && continue ;;
    esac
    return
  done
}

read_required() {
  local prompt=$1
  local value
  while true; do
    read -r -p "$prompt" value || die "cancelled"
    value=$(trim "$value")
    if [[ -n "$value" ]]; then
      printf '%s' "$value"
      return
    fi
    echo "Required — enter a value or press Ctrl+C to cancel." >&2
  done
}

read_optional() {
  local prompt=$1
  local value
  read -r -p "$prompt" value || die "cancelled"
  trim "$value"
}

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || die "run from inside the conscius git repository"
cd "$REPO_ROOT"

MULCH=$(find_mulch)
CONFIG="$REPO_ROOT/.mulch/mulch.config.yaml"
domains=()
domain=
rectype=
classification=

load_domains "$CONFIG"
pick_domain
pick_type

echo
read -r -p "Classification [foundational|tactical|observational] (default: tactical): " classification || die "cancelled"
classification=$(trim "${classification:-}")
[[ -z "$classification" ]] && classification=tactical
case "$classification" in
foundational | tactical | observational) ;;
*) die "invalid classification '$classification'" ;;
esac

name=
description=
resolution=
title=
rationale=

case "$rectype" in
convention)
  description=$(read_required "Description: ")
  ;;
pattern)
  name=$(read_required "Name: ")
  description=$(read_required "Description: ")
  ;;
failure)
  description=$(read_required "Description: ")
  resolution=$(read_required "Resolution: ")
  ;;
decision)
  title=$(read_required "Title: ")
  rationale=$(read_required "Rationale: ")
  ;;
reference | guide)
  name=$(read_required "Name: ")
  description=$(read_required "Description: ")
  ;;
esac

tags=$(read_optional "Tags optional, comma-separated (Enter to skip): ")
files=$(read_optional "Related files optional, comma-separated (Enter to skip): ")
bead=$(read_optional "Evidence bead ID optional (Enter to skip): ")

cmd=("$MULCH" record "$domain" --type "$rectype" --classification "$classification")
[[ -n "$name" ]] && cmd+=(--name "$name")
[[ -n "$description" ]] && cmd+=(--description "$description")
[[ -n "$resolution" ]] && cmd+=(--resolution "$resolution")
[[ -n "$title" ]] && cmd+=(--title "$title")
[[ -n "$rationale" ]] && cmd+=(--rationale "$rationale")
[[ -n "$tags" ]] && cmd+=(--tags "$tags")
[[ -n "$files" ]] && cmd+=(--files "$files")
[[ -n "$bead" ]] && cmd+=(--evidence-bead "$bead")

echo
read -r -p "Dry-run first? [Y/n]: " dry_ask || die "cancelled"
dry_ask=$(trim "${dry_ask:-Y}")
if [[ -z "$dry_ask" || "$dry_ask" =~ ^[yY] ]]; then
  echo "Running: ${cmd[*]} --dry-run" >&2
  "${cmd[@]}" --dry-run
  echo
  read -r -p "Apply for real? [y/N]: " confirm || die "cancelled"
  confirm=$(trim "$confirm")
  [[ "$confirm" =~ ^[yY] ]] || die "cancelled"
fi

echo "Recording…" >&2
"${cmd[@]}"
