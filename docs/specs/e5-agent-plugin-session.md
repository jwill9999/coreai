# E5 — @conscius/agent-plugin-session

**Beads ID:** coreai-vq3  
**Status:** implementation brief (not started)  
**Package:** `packages/agent-plugin-session`  
**Import path:** `@conscius/agent-plugin-session`

---

## Overview

Plugin that manages `SESSION.md` — the primary session handoff document at the repo root. At `onSessionStart` it reads `SESSION.md` and injects it as a prompt segment so the agent can resume without needing conversation history. At `onSessionEnd` it writes an updated `SESSION.md` reflecting the current state.

---

## Target file structure

```
packages/agent-plugin-session/
└── src/
    ├── index.ts
    └── lib/
        ├── sessionReader.ts        ← readSession() — reads SESSION.md from repo root
        ├── sessionWriter.ts        ← writeSession() — writes SESSION.md atomically
        ├── hooks.ts                ← sessionPlugin: AgentPlugin implementation
        └── __tests__/
            ├── sessionReader.spec.ts
            ├── sessionWriter.spec.ts
            └── hooks.spec.ts
```

---

## Module responsibilities

### `sessionReader.ts`

```ts
readSession(repoRoot: string): Promise<string | null>
```

Reads `{repoRoot}/SESSION.md`. Returns content as string, or `null` if the file does not exist (graceful degradation — first session).

### `sessionWriter.ts`

```ts
writeSession(content: string, repoRoot: string): Promise<void>
```

Writes to `{repoRoot}/SESSION.md`. Must be an approved write path (checked via `AgentContext` or direct write — `SESSION.md` is in the default `permissions.allowWrite` list). Write atomically using a temp file + rename to avoid partial writes.

### `hooks.ts`

```ts
export const sessionPlugin: AgentPlugin;
```

`onSessionStart(context)`:

1. Read `SESSION.md`
2. If content exists, append `## Session Context (SESSION.md)` block to `context.promptSegments`
3. Return silently if file not found

`onSessionEnd(context)`:

1. Generate updated `SESSION.md` from `context` (active task, recent decisions, next steps)
2. Write to repo root

---

## SESSION.md required sections

When writing `SESSION.md`, the plugin must produce (at minimum):

```markdown
# SESSION.md

## Current Objective

## Active Task

## Progress Since Last Session

## Decisions Made

## Open Issues

## Next Steps

## Epic and Task Status
```

The plugin should preserve existing content structure where possible and update only changed sections. If generating from scratch, use the template above.

---

## Prompt segment injected

```
## Session Context (SESSION.md)

# SESSION.md
...full file content...
```

---

## Implementation notes

- Follow `packages/agent-plugin-beads/` file structure **exactly**
- Manual Promise wrapper (not `util.promisify`) for any async file ops that use callbacks
- `tsconfig.spec.json` must set `"customConditions": null`
- `SESSION.md` is in the default `permissions.allowWrite` — no additional approval needed
- Plugin must not fail if `SESSION.md` is missing (first session scenario)
- Atomic write: write to temp file → `rename` to `SESSION.md`

---

## Acceptance criteria

- [ ] `readSession` returns content or null when file absent
- [ ] `writeSession` writes atomically; existing file replaced cleanly
- [ ] `onSessionStart` injects SESSION.md as prompt segment
- [ ] `onSessionEnd` writes updated SESSION.md
- [ ] All functions have unit tests
- [ ] `npx nx run-many -t typecheck,lint,test --projects=agent-plugin-session` passes

---

## Tasks (Beads)

| Beads ID     | Task                                            |
| ------------ | ----------------------------------------------- |
| coreai-vq3.1 | Implement session reader                        |
| coreai-vq3.2 | Implement session writer (atomic)               |
| coreai-vq3.3 | Implement hooks (onSessionStart + onSessionEnd) |
| coreai-vq3.4 | Unit tests for all modules                      |

---

## Archive

Original design: `docs/specs/archive/session_continuity_layer_spec_v2.md`
