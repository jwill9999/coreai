# .mulch/

This directory is managed by [mulch](https://github.com/jayminwest/mulch) — a structured expertise layer for coding agents.

## Key Commands

- `mulch init` — Initialize a .mulch directory
- `mulch add` — Add a new domain
- `mulch record` — Record an expertise record
- **`make mulch-record`** (repo root) — Interactive prompts for record type and required fields, then runs `ml`/`mulch record` with safe quoting. If `.mulch/mulch.config.yaml` lists exactly one domain, it is used automatically; otherwise you pick from the list. Optional tags, related files, and evidence bead ID. Offers a dry-run before writing. Needs a Mulch CLI on `PATH` (after `npm install`, see **Install and which binary runs** below). Cancel anytime with **q** or **Ctrl+C** (exits non-zero).
- `mulch edit` — Edit an existing record
- `mulch query` — Query expertise records
- `mulch prime [domain]` — Output a priming prompt (optionally scoped to one domain)
- `mulch search` — Search records across domains
- `mulch status` — Show domain statistics
- `mulch validate` — Validate all records against the schema
- `mulch prune` — Remove expired records

## Structure

- `mulch.config.yaml` — Configuration file
- `expertise/` — JSONL files, one per domain

## Interactive recording from the repo

From the repository root:

```bash
make mulch-record
```

The script lives at `scripts/mulch-record-interactive.sh`. Field requirements match `mulch record --help` (e.g. **failure** needs description + resolution; **decision** needs title + rationale).

### Install and which binary runs

1. **Install dependencies** at the repo root (`npm install`). Mulch’s CLI is pulled in as **`@os-eco/mulch-cli`** via the **`@conscius/agent-plugin-mulch`** workspace package, which exposes **`node_modules/.bin/ml`** and **`node_modules/.bin/mulch`**.
2. **PATH order:** The script resolves the CLI with `command -v ml` / `command -v mulch` — it uses **whichever executable appears first on your `PATH`**, not “repo copy first.” If you also have a **global** `ml`, that one wins when its directory is **before** `node_modules/.bin` on `PATH`.
3. **To prefer this repo’s version:** Put **`./node_modules/.bin`** early on `PATH` for that shell (or run the same flow with **`npx ml record …`** yourself). If neither local nor global `ml`/`mulch` is found, run **`npm install`** and ensure a Mulch CLI is available.

### Automated smoke check

After **`npm install`**, from the repo root:

```bash
npm run test:mulch-record-interactive
```

Runs **`scripts/verify-mulch-record-interactive.sh`**: `bash -n` on the interactive script; single-domain quit/cancel; **temporary git fixture** with **two domains** to exercise the domain menu; **every record type** (convention, pattern, failure, decision, reference, guide) asserted via captured **`--dry-run`** command lines (then cancel — **no writes**). This checks **our script’s prompts and flags**, not Mulch’s internal behavior. The same step runs in **GitHub Actions** after unit tests.
