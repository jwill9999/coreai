# @coreai/agent-plugin-beads

Wraps the `bd` CLI to inject [Beads](https://github.com/bead-tools/beads) task context into an agent session.

## What it does

When `onTaskStart` fires, the plugin:

1. Runs `bd show --json <taskId>` to fetch the active task.
2. Populates `context.activeTask` with the parsed `BeadsTask`.
3. Appends a formatted task summary to `context.promptSegments`.
4. If the task has a `specPath` (set via `external_ref` in Beads), reads the spec file and appends its content to `context.promptSegments`.

## Usage

```ts
import { beadsPlugin } from '@coreai/agent-plugin-beads';

// Register via agent-core plugin loader
export default beadsPlugin;
```

Or add `@coreai/agent-plugin-beads` to your `.agent/config.json` plugins list.

## Environment

- `BD_TASK_ID` — fallback task ID if `context.activeTask.id` is not pre-set.

## Requirements

- `bd` CLI must be installed and on `$PATH`.
- A `.beads` database must exist in the repository (auto-discovered by `bd`).
