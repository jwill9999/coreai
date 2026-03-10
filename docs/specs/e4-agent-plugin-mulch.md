# E4 — @conscius/agent-plugin-mulch

**Beads ID:** coreai-x3b  
**Status:** implementation brief (not started)  
**Package:** `packages/agent-plugin-mulch`  
**Import path:** `@conscius/agent-plugin-mulch`

---

## Overview

Plugin that injects relevant experience lessons from Mulch (`.mulch/mulch.jsonl`) into the agent context at `onSessionStart`. Mulch is the system's experience memory — it stores engineering lessons discovered during development to prevent repeating solved problems.

---

## Target file structure

```
packages/agent-plugin-mulch/
└── src/
    ├── index.ts                    ← exports mulchPlugin (default) + queryMulch, loadMulchLessons
    └── lib/
        ├── mulchAdapter.ts         ← queryMulch() — calls `mulch query` CLI or reads JSONL directly
        ├── lessonWriter.ts         ← writeMulchLesson() — appends to .mulch/mulch.jsonl
        ├── hooks.ts                ← mulchPlugin: AgentPlugin implementation
        └── __tests__/
            ├── mulchAdapter.spec.ts
            ├── lessonWriter.spec.ts
            └── hooks.spec.ts
```

---

## Module responsibilities

### `mulchAdapter.ts`

```ts
queryMulch(topic: string, repoRoot: string): Promise<MulchLesson[]>
```

Query order (project → global):

1. `{repoRoot}/.mulch/mulch.jsonl` — project lessons
2. `~/.mulch/mulch.jsonl` — global lessons

If the `mulch` CLI is available, prefer `mulch query <topic> --json`. Otherwise read and filter JSONL directly. Return lessons whose `topic` or `summary` contains the query string (case-insensitive).

**Pattern:** Use same manual Promise wrapper as `beadsAdapter.ts` when calling CLI via `execFile`.

### `lessonWriter.ts`

```ts
writeMulchLesson(lesson: MulchLesson, repoRoot: string): Promise<void>
```

Appends a lesson to `{repoRoot}/.mulch/mulch.jsonl`. Validates required fields: `id`, `topic`, `summary`, `recommendation`, `created`. Creates the `.mulch/` directory if it does not exist.

### `hooks.ts`

```ts
export const mulchPlugin: AgentPlugin;
```

`onSessionStart(context)`:

1. Read `context.activeTask?.description` or task title for topic hint
2. Query project mulch then global mulch for relevant lessons
3. Append `## Experience Lessons` block to `context.promptSegments`
4. Return silently if no lessons found (graceful degradation)

---

## MulchLesson interface (from `@conscius/agent-types`)

```ts
{
  id: string;
  topic: string;
  summary: string;
  recommendation: string;
  created: string;        // ISO 8601
  severity?: 'low' | 'medium' | 'high';
  tags?: string[];
}
```

---

## Prompt segment injected

```
## Experience Lessons

### util.promisify loses .custom symbol under Jest
**Topic**: jest mocking
**Recommendation**: Use manual Promise wrapper around execFile instead of util.promisify when the test suite uses Jest mock transforms.
**Created**: 2025-01-15

### tsconfig.spec.json needs customConditions: null
**Topic**: typescript configuration
...
```

---

## Implementation notes

- Follow `packages/agent-plugin-beads/` file structure **exactly**
- Manual Promise wrapper (not `util.promisify`) for any CLI calls
- `tsconfig.spec.json` must set `"customConditions": null`
- `lessonWriter.ts` must only write to `.mulch/mulch.jsonl` (approved write path in `AgentConfig`)
- Plugin exported as `mulchPlugin` (named) + default export from `index.ts`

---

## Acceptance criteria

- [ ] `queryMulch` reads both project and global mulch, returns ordered array
- [ ] `writeMulchLesson` appends valid JSONL; fails with clear error if required fields missing
- [ ] `mulchPlugin.onSessionStart` injects lesson block into `context.promptSegments`
- [ ] Plugin returns silently when no lessons found
- [ ] All functions have unit tests with Jest mocks
- [ ] `npx nx run-many -t typecheck,lint,test --projects=agent-plugin-mulch` passes

---

## Tasks (Beads)

| Beads ID     | Task                                                 |
| ------------ | ---------------------------------------------------- |
| coreai-x3b.1 | Implement mulch adapter (JSONL reader + CLI wrapper) |
| coreai-x3b.2 | Implement lesson writer                              |
| coreai-x3b.3 | Implement hooks (onSessionStart)                     |
| coreai-x3b.4 | Unit tests for all modules                           |

---

## Archive

Original design: `docs/specs/archive/mulch_experience_layer_spec.md`
