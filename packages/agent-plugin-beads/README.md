# @conscius/agent-plugin-beads

Wraps the `bd` CLI to inject [Beads](https://github.com/bead-tools/beads) task context into an agent session.

[![CI](https://github.com/jwill9999/conscius/actions/workflows/ci.yml/badge.svg)](https://github.com/jwill9999/conscius/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@conscius/agent-plugin-beads)](https://www.npmjs.com/package/@conscius/agent-plugin-beads)

## What it does

When `onTaskStart` fires, the plugin:

1. Runs `bd show --json <taskId>` to fetch the active task.
2. Populates `context.activeTask` with the parsed `BeadsTask`.
3. Pushes a formatted task summary to `context.memorySegments` (`instruction`).
4. If the task has a `specPath` (set via `external_ref` in Beads), reads the spec file and pushes its content as `memorySegments` (`context`).

## Usage

```ts
import { beadsPlugin } from '@conscius/agent-plugin-beads';

// Register via @conscius/runtime plugin loader / .agent/config.json
export default beadsPlugin;
```

Or add `@conscius/agent-plugin-beads` to your `.agent/config.json` plugins list.

## Environment

- `BD_TASK_ID` — fallback task ID if `context.activeTask.id` is not pre-set.

## Requirements

- `bd` CLI must be installed and on `$PATH`.
- A `.beads` database must exist in the repository (auto-discovered by `bd`).
