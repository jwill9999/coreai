# E3 — @conscius/agent-plugin-beads

**Beads ID:** coreai-e2o  
**Status:** as-built (complete)  
**Package:** `packages/agent-plugin-beads`  
**Import path:** `@conscius/agent-plugin-beads`

---

## Overview

Plugin that injects Beads task metadata and spec file content into the agent context at `onTaskStart`. When a task becomes active, the plugin fetches full task details from `bd show --json`, then reads the linked spec file (if any) and appends both as prompt segments.

---

## File structure (as-built)

```
packages/agent-plugin-beads/
└── src/
    ├── index.ts                    ← exports beadsPlugin (default) + fetchBeadsTask, loadSpecContent
    └── lib/
        ├── beadsAdapter.ts         ← fetchBeadsTask() — calls `bd show --json`
        ├── contextLoader.ts        ← loadSpecContent() — reads spec file safely
        ├── hooks.ts                ← beadsPlugin: AgentPlugin implementation
        └── __tests__/
            ├── beadsAdapter.spec.ts
            ├── contextLoader.spec.ts
            └── hooks.spec.ts
```

---

## Module responsibilities

### `beadsAdapter.ts`

```ts
fetchBeadsTask(taskId: string, repoRoot: string): Promise<BeadsTask>
```

- Runs `bd show --json <taskId>` via `execFile` with `cwd: repoRoot`
- Maps `external_ref` → `BeadsTask.specPath`
- Maps raw Beads status strings to `BeadsTaskStatus` union (normalises spaces/dashes to underscores; unknown statuses default to `'todo'`)
- `bd show --json` may return either a single object or an array — handles both

**Critical: manual Promise wrapper** — uses `new Promise(...)` wrapping `execFile` directly, **not** `util.promisify(execFile)`. Reason: `promisify` loses the `.custom` symbol under Jest mock transforms, causing test failures.

### `contextLoader.ts`

```ts
loadSpecContent(specPath: string, repoRoot: string): Promise<string | null>
```

- Resolves `specPath` relative to `repoRoot`
- Path traversal check: relative path must not start with `..`
- Symlink resolution via `realpath` (second traversal check after symlink resolution)
- Cap: 50 KB maximum; returns content + `\n\n[...truncated at 50 KB]` if exceeded
- Returns `null` on `ENOENT` (missing spec file is not an error)

### `hooks.ts`

```ts
export const beadsPlugin: AgentPlugin;
```

`onTaskStart(context)`:

1. Reads `context.activeTask?.id` or falls back to `process.env.BD_TASK_ID`
2. If no task ID — returns silently
3. Calls `fetchBeadsTask(taskId, context.repoRoot)`
4. Sets `context.activeTask = task`
5. Appends `## Active Beads Task` block to `context.promptSegments`
6. If `task.specPath` is set — calls `loadSpecContent`, appends `## Task Specification (path)` block

---

## Prompt segments injected

```
## Active Beads Task
**ID**: coreai-x3b.1
**Title**: Implement mulch adapter
**Status**: in_progress
**Description**: ...
**Assignee**: ...
**Depends on**: coreai-x3b

## Task Specification (docs/specs/e4-agent-plugin-mulch.md)

<full spec content>
```

---

## Key decisions

- `execFile` not `exec` — prevents shell injection; args passed as array
- Manual Promise wrapper (not `util.promisify`) — required for Jest mock compatibility
- `specPath` stored in Beads `external_ref` field — no dedicated spec field in Beads CLI
- `loadSpecContent` returns `null` for missing files (graceful degradation — task continues without spec)
- Plugin exported as both default and named export for flexibility

---

## tsconfig notes

`tsconfig.spec.json` must set:

```json
{
  "compilerOptions": {
    "customConditions": null
  }
}
```

Required to avoid TS5098 conflict with `moduleResolution: nodenext` in base `tsconfig.base.json` when compiling test files under `node10` resolution (Jest/CommonJS).

Also requires:

```json
{
  "include": ["src/**/*.ts"],
  "references": [{ "path": "./tsconfig.lib.json" }]
}
```

---

## Implementation pattern for E4+

This package is the **reference implementation** for all future plugin epics (E4–E7). All future plugins must follow:

1. Same file structure: `{adapter}.ts`, `hooks.ts`, `{loader/reader}.ts`, `index.ts`
2. Manual Promise wrapper around `execFile` (not `util.promisify`)
3. `tsconfig.spec.json` with `"customConditions": null`
4. Plugin exported as `export const {name}Plugin: AgentPlugin` in `hooks.ts`, re-exported as default from `index.ts`
5. Graceful degradation — plugins must not throw when optional data is unavailable

---

## Archive

Original design: `docs/specs/archive/agent_architecture_overview.md` (Beads layer), `docs/specs/archive/ECOSYSTEM_REPO_STRUCTURE.md`
