# E4 — @conscius/agent-plugin-mulch

**Beads ID:** coreai-x3b  
**Status:** implemented  
**Package:** `packages/agent-plugin-mulch`  
**Import path:** `@conscius/agent-plugin-mulch`

---

## Overview

Plugin that injects relevant experience lessons from Mulch into the agent context at `onSessionStart` and persists explicit pending lessons at `onSessionEnd`. For this repository, upstream `ml` is the canonical direction for docs and new integration work, while any legacy `mulch` compatibility should remain lightweight.

Current implementation snapshot:

- `mulchAdapter.ts` exists and currently shells out to legacy `mulch search`
- `hooks.ts` exists and injects lessons during `onSessionStart`
- `lessonWriter.ts` now supports explicit writing of supplied `MulchLesson` records
- adapter and hook tests exist
- `onSessionEnd` now persists explicit lessons from `AgentContext.pendingMulchLessons`

---

## Target file structure

```
packages/agent-plugin-mulch/
└── src/
    ├── index.ts                    ← exports mulchPlugin (default) + queryMulch
    └── lib/
        ├── mulchAdapter.ts         ← queryMulch() — current implementation
        ├── lessonWriter.ts         ← writeMulchLesson() — explicit helper implemented
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

Current implementation: if legacy `mulch` is available, use `mulch search <topic>`. Otherwise read and filter JSONL directly.

Direction for future work: prefer upstream `ml` for new integration work, but do not build a broad dual-command abstraction layer just to support both CLIs at parity. Keep any legacy compatibility minimal.

**Pattern:** Use same manual Promise wrapper as `beadsAdapter.ts` when calling CLI via `execFile`.

### `lessonWriter.ts`

```ts
writeMulchLesson(lesson: MulchLesson, repoRoot: string): Promise<void>
```

Current implementation. Preferred direction:

- use upstream `ml` semantics as the canonical path for new integration work
- keep any legacy `mulch` compatibility lightweight
- explicitly review whether upstream `ml` storage paths require changes to approved write-path assumptions before implementing writer behavior

Current task-scoped decision:

- implement explicit `writeMulchLesson()` support for the existing
  `MulchLesson` shape
- do **not** invent automatic lesson discovery from `AgentContext`
- use `AgentContext.pendingMulchLessons` as the explicit lesson source for
  `onSessionEnd`

### `hooks.ts`

```ts
export const mulchPlugin: AgentPlugin;
```

`onSessionStart(context)`:

1. Read `context.activeTask?.description` or task title for topic hint
2. Query project mulch then global mulch for relevant lessons
3. Append `## Experience Lessons` block to `context.promptSegments`
4. Return silently if no lessons found (graceful degradation)

`onSessionEnd(context)`:

1. Read `context.pendingMulchLessons ?? []`
2. Persist each supplied lesson with `writeMulchLesson()`
3. Return silently when there are no pending lessons

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
- Explicit session-end persistence uses `AgentContext.pendingMulchLessons`
- Writer behavior remains intentionally explicit; no heuristic lesson extraction
- Plugin exported as `mulchPlugin` (named) + default export from `index.ts`

---

## Acceptance criteria

- [ ] `queryMulch` reads both project and global mulch, returns ordered array
- [ ] Remaining persistence work follows upstream `ml` as the canonical direction, with only lightweight legacy compatibility if needed
- [ ] `mulchPlugin.onSessionStart` injects lesson block into `context.promptSegments`
- [ ] Plugin returns silently when no lessons found
- [ ] All functions have unit tests with Jest mocks
- [ ] `npx nx run-many -t typecheck,lint,test --projects=agent-plugin-mulch` passes

---

## Tasks (Beads)

| Beads ID     | Task                                                   |
| ------------ | ------------------------------------------------------ |
| coreai-x3b.1 | Implement mulch adapter (JSONL reader + CLI wrapper)   |
| coreai-x3b.2 | Implement hooks (onSessionStart)                       |
| coreai-btc   | Align upstream `ml` storage and write-path assumptions |
| coreai-x3b.3 | Implement explicit lesson writer helper                |
| coreai-ljm   | Wire explicit lessons into `onSessionEnd`              |
| coreai-x3b.4 | Unit tests for all modules                             |

---

## Archive

Original design: `docs/specs/archive/mulch_experience_layer_spec.md`
