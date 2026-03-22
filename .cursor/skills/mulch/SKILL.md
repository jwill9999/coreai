---
name: mulch
description: "Mulch expertise workflow for the Conscius project. USE WHEN: the user wants to initialize Mulch, record lessons learned, query prior expertise, prime agent context, compact/prune records, inspect Mulch health, or manage `.mulch/` knowledge safely across agents. EXAMPLES: 'record this learning in mulch', 'search mulch for testing advice', 'prime mulch context', 'set up mulch in this repo', 'compact mulch records', 'doctor the mulch store'."
---

# Mulch expertise workflow

## Current state

- **Branch:** !`git branch --show-current`
- **Mulch directory:** !`test -d .mulch && echo present || echo missing`
- **Mulch files:** !`find .mulch -maxdepth 3 -type f 2>/dev/null | sort | head -20`

## User instructions

$ARGUMENTS

---

## Purpose

Use Mulch as the project's persistent expertise layer: agents read accumulated lessons before working and record new lessons before finishing.

Mulch is **passive storage**, not an LLM. The agent is responsible for deciding what to record and when to query it.

---

## Version check first

This repository has some older local references to the legacy `mulch` CLI and `.mulch/mulch.jsonl`, while the upstream Mulch README uses:

- `ml` as the primary command
- `.mulch/expertise/<domain>.jsonl` as the storage layout
- `.mulch/mulch.config.yaml` as config

Before editing code or automation around Mulch, verify the actual installed CLI and repository layout:

```bash
ml --help
ml status --json
find .mulch -maxdepth 3 -type f | sort
```

If `ml` is unavailable but `mulch` exists, treat that as a legacy installation and avoid assuming full command parity without checking `mulch --help`.

---

## Quick start

```bash
ml init
ml add <domain>
ml record <domain> --type <type> "short lesson"
ml query <domain>
ml prime
```

Examples:

```bash
ml init
ml add testing
ml record testing --type convention "Use nx targets instead of direct tool invocations"
ml record testing --type failure \
  --description "Jest failed because tsconfig.spec.json inherited incompatible customConditions" \
  --resolution "Set customConditions to null in tsconfig.spec.json for Jest/CommonJS configs"
ml query testing --json
ml prime testing
```

---

## Core commands

| Command                            | Use                                                      |
| ---------------------------------- | -------------------------------------------------------- |
| `ml init`                          | Create `.mulch/` for the current project                 |
| `ml add <domain>`                  | Create a new expertise domain                            |
| `ml record <domain> --type <type>` | Add a record to a domain                                 |
| `ml edit <domain> <id>`            | Edit an existing record                                  |
| `ml delete <domain> [id]`          | Delete records                                           |
| `ml query [domain]`                | View expertise for one domain or all domains             |
| `ml prime [domains...]`            | Output agent-optimized context for prompt injection      |
| `ml search [query]`                | Search across domains                                    |
| `ml compact [domain]`              | Analyze or apply compaction                              |
| `ml ready`                         | Show recently added or updated records                   |
| `ml status`                        | Show expertise freshness and counts                      |
| `ml validate`                      | Validate schemas                                         |
| `ml doctor`                        | Run health checks and optionally fix issues              |
| `ml sync`                          | Validate, stage, and commit `.mulch/` changes            |
| `ml learn`                         | Suggest domains for new learnings based on changed files |
| `ml onboard`                       | Generate AGENTS.md / CLAUDE.md snippets                  |
| `ml setup [provider]`              | Install provider-specific hooks                          |

All commands support `--json` for structured output. Prefer `--json` when the result will be parsed or fed back into tooling.

---

## Record types

| Type         | Required fields             | Best for                                        |
| ------------ | --------------------------- | ----------------------------------------------- |
| `convention` | `content`                   | Stable project rules and norms                  |
| `pattern`    | `name`, `description`       | Reusable implementation approaches              |
| `failure`    | `description`, `resolution` | Mistakes and how to avoid them                  |
| `decision`   | `title`, `rationale`        | Architectural choices and tradeoffs             |
| `reference`  | `name`, `description`       | Important files, endpoints, or resources        |
| `guide`      | `name`, `description`       | Recurring procedures and step-by-step workflows |

Use classification deliberately:

- `foundational` — long-lived, broadly reusable
- `tactical` — useful for current architecture or tooling
- `observational` — temporary findings likely to expire

---

## Default workflows

### Query before work

When the task mentions a domain, subsystem, or recurring problem, query or search Mulch first:

```bash
ml query <domain> --json
ml search "<topic>" --json
ml prime <domain>
```

### Record after work

Before ending a task, look for reusable insight:

- a convention the repo now follows
- a failure mode that caused debugging time
- a decision with rationale
- a guide for a recurring workflow

Then record it:

```bash
ml record <domain> --type convention "..."
ml record <domain> --type failure --description "..." --resolution "..."
ml record <domain> --type decision --title "..." --rationale "..."
```

### Prime for agent context

When assembling context for an agent or session handoff, use:

```bash
ml prime
ml prime <domain> --budget 4000
```

---

## Multi-agent safety

From the upstream Mulch README:

- **Read-only / fully safe in parallel:** `prime`, `query`, `search`, `status`, `validate`, `learn`, `ready`
- **Locked writes / safe:** `record`, `edit`, `delete`, `compact`, `prune`, `doctor`
- **Serialize setup operations:** `init`, `add`, `onboard`, `setup`

In swarm or multi-agent work:

- freely parallelize read commands
- allow normal locked writes for recording lessons
- serialize setup commands that modify config or external files
- coordinate `ml sync` on shared branches because git ref locking can still contend

---

## Good recording heuristics

Record a lesson when it is likely to help a future agent avoid re-learning something expensive.

Good candidates:

- root causes that were non-obvious
- repo-specific conventions
- fragile tooling behavior
- repeatable fix procedures
- architectural decisions with constraints

Do **not** record:

- secrets or credentials
- trivial observations with no reuse value
- speculative guesses you have not verified
- noisy duplicates of existing records without a supersession reason

---

## Recommended commands by scenario

### New repo setup

```bash
ml init
ml add architecture
ml add testing
ml add release
ml status --json
```

### Find prior knowledge

```bash
ml search "typescript jest customConditions" --json
ml query testing --json
```

### Record a debugging lesson

```bash
ml record testing --type failure \
  --description "Nx Jest config failed because spec tsconfig inherited incompatible customConditions" \
  --resolution "Override customConditions to null in tsconfig.spec.json for Jest/CommonJS" \
  --classification tactical \
  --tag jest \
  --tag typescript
```

### Health check and maintenance

```bash
ml validate
ml doctor
ml compact --analyze
ml ready --limit 20 --json
```

---

## Conscius-specific notes

- Prefer `ml` commands when working from the current upstream Mulch CLI documentation.
- If repo code still integrates with legacy `mulch` commands or `.mulch/mulch.jsonl`, do **not** silently rewrite behavior. First verify the installed CLI and stored data format.
- Keep recorded expertise focused on durable engineering value: conventions, failures, decisions, references, and guides that help future sessions.
- Use `--json` whenever the result will drive code changes, automation, or further tool calls.

---

## Output style

When using this skill:

1. Check whether `.mulch/` already exists and what layout it uses.
2. Prefer read/query commands before making changes.
3. Record only verified, reusable lessons.
4. Use `ml sync` only when the user wants Mulch changes committed.
5. Call out any mismatch between local legacy Mulch usage and upstream README guidance before proceeding.
