# @conscius/agent-plugin-mulch

Injects [Mulch](https://github.com/os-eco/mulch) experience lessons into the agent prompt at session start.

[![CI](https://github.com/jwill9999/conscius/actions/workflows/ci.yml/badge.svg)](https://github.com/jwill9999/conscius/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@conscius/agent-plugin-mulch)](https://www.npmjs.com/package/@conscius/agent-plugin-mulch)

## What it does

At `onSessionStart`, the plugin:

1. Resolves `ml` on `$PATH` and throws with install instructions if missing.
2. Verifies Bun is installed (required to run `ml`) and throws with Bun install instructions if missing.
3. Auto-initialises `.mulch/` via `ml init` if `mulch.config.yaml` is absent.
4. Runs `ml prime` (all domains, budget-limited ~4000 tokens) and pushes the raw markdown output into `context.memorySegments` as type `experience`.

The plugin has **no `onSessionEnd`** hook; lesson recording remains an explicit engineer action (see below).

## Prerequisites

| Requirement                      | How to install                              |
| -------------------------------- | ------------------------------------------- |
| **Bun >= 1.0**                   | `curl -fsSL https://bun.sh/install \| bash` |
| **`@os-eco/mulch-cli` >= 0.6.3** | Installed automatically via `npm install`   |

`@os-eco/mulch-cli` is declared as a package dependency so `npm install` handles it automatically. Bun is the only external prerequisite.

## First-time setup (automatic)

```bash
# 1. Ensure Bun is installed (one-time, system-wide)
curl -fsSL https://bun.sh/install | bash

# 2. Install the package (`@os-eco/mulch-cli` is bundled)
npm install @conscius/agent-plugin-mulch

# 3. ml init runs automatically when mulch.config.yaml is absent on first onSessionStart
```

## Usage

```ts
import { createRuntime } from '@conscius/runtime';
import { mulchPlugin } from '@conscius/agent-plugin-mulch';

// In-process registration
const runtime = createRuntime({ plugins: [mulchPlugin] });

// Or load module paths from `.agent/config.json` (relative paths resolve from repo root):
// const runtime = createRuntime();
// await runtime.loadFromConfig(config.plugins ?? [], repoRoot);
```

Export surface:

- `@conscius/agent-plugin-mulch` re-exports named symbols from `mulchAdapter`, `hooks`, and `lessonWriter`.
- `mulchPlugin` is the primary named plugin export.
- `hooks.ts` also defines a default export, but consumers should prefer the named `mulchPlugin` export from the package root.

`memorySegments` will include the raw `ml prime` markdown after `onSessionStart` completes.
No additional heading is prepended by this plugin.

## Recording lessons (engineer's responsibility)

Recording lessons is a manual step; the plugin does not write lessons automatically.

```bash
# Record a lesson after a hard-won discovery
ml record --topic "jest mocking" \
  --summary "util.promisify loses its custom symbol under Jest transforms" \
  --recommendation "Use a manual Promise wrapper around execFile instead"

# Record with optional metadata
ml record --topic "typescript" \
  --summary "tsconfig.spec.json needs customConditions: null" \
  --recommendation "Set customConditions to null in Jest tsconfig" \
  --type failure \
  --classification tactical

# View stored lessons
ml list
```

Lessons are stored in `.mulch/expertise/<domain>.jsonl` and injected by `ml prime` in future sessions.

## Programmatic usage

```ts
import { queryMulch, writeMulchLesson } from '@conscius/agent-plugin-mulch';

// Get ml prime output directly
const markdown = await queryMulch(process.cwd());

// Stage a lesson to candidates.jsonl for human review
await writeMulchLesson(
  {
    id: 'lesson-1',
    topic: 'typescript',
    summary: 'Jest tsconfig needs customConditions set to null',
    recommendation: 'Override customConditions in tsconfig.spec.json',
    created: new Date().toISOString(),
  },
  process.cwd(),
);
```

## Errors and troubleshooting

| Error                                           | Cause                        | Fix                                                               |
| ----------------------------------------------- | ---------------------------- | ----------------------------------------------------------------- |
| `ml is required but was not found on PATH`      | `ml` not installed           | `npm install -g @os-eco/mulch-cli`                                |
| `ml requires Bun to run, but Bun was not found` | Bun not installed            | `curl -fsSL https://bun.sh/install \| bash` then restart terminal |
| `ml init failed in <path>`                      | `ml init` returned non-zero  | Check stderr; ensure write access to the repo directory           |
| `ml prime failed`                               | `ml prime` returned non-zero | Check stderr; try running `ml doctor`                             |

## What is NOT automated

- **Lesson recording:** use `ml record` manually after discoveries.
- **Candidate promotion:** lessons staged to `.mulch/candidates.jsonl` require human review before promotion to `.mulch/expertise/`.
- **Domain selection:** `ml prime` injects all domains; domain management is done via `ml` directly.
