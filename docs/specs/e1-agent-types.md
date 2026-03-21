# E1 — @conscius/agent-types

**Beads ID:** coreai-1ra  
**Status:** as-built (complete)  
**Package:** `packages/agent-types`  
**Import path:** `@conscius/agent-types`

---

## Overview

Shared TypeScript interfaces, type aliases, and exportable constants used across
all packages in the monorepo. No runtime behavior beyond constant exports.

---

## File structure (as-built)

```
packages/agent-types/
└── src/
  ├── index.ts              ← public barrel
  └── lib/
    └── agent-types.ts    ← all interfaces, type aliases, and constants
```

---

## Exported types and interfaces

### `MulchLesson`

Experience lesson shape shared across Mulch-related packages.

Required fields: `id`, `topic`, `summary`, `recommendation`, `created`

Optional fields:

- `type?: MulchLessonType`
- `classification?: MulchLessonClassification`
- `tags?: string[]`
- `task_id?: string`
- `files?: string[]`
- `service?: string`

Related exports:

- `MULCH_LESSON_TYPES`
- `MulchLessonType`
- `MULCH_LESSON_CLASSIFICATIONS`
- `MulchLessonClassification`

### `BeadsTaskStatus`

Union: `'todo' | 'in_progress' | 'review' | 'blocked' | 'done'`

### `BeadsTask`

Active task from Beads. Fields: `id`, `title`, `status`, `description?`, `specPath?`, `dependencies?`, `assignee?`.

> **Note:** `specPath` maps from `external_ref` in `bd show --json` output.

### `ConversationMessage`

`{ role: 'user' | 'assistant' | 'system', content: string }`

### `ConversationSegment`

`{ index: number, topic: string, messages: ConversationMessage[] }`

### `CompressionSummary`

`{ segmentIndex, topic, keyDecisions: string[], constraints: string[], outcome: string }`

### `AgentConfig`

Shape of `.agent/config.json`: `plugins?`, `hooks?`, `permissions?`, `approvedWrites?`.

### `AgentContext`

Passed to every plugin hook:

```ts
{
  repoRoot: string;           // absolute path to repo root
  config: AgentConfig;
  activeTask?: BeadsTask;
  pendingMulchLessons?: MulchLesson[];
  promptSegments: string[];
  conversation: ConversationMessage[];
  compressionSummaries: CompressionSummary[];
}
```

### `AgentPlugin`

```ts
{
  name: string;
  onSessionStart?(context: AgentContext): Promise<void>;
  onTaskStart?(context: AgentContext): Promise<void>;
  onConversationThreshold?(context: AgentContext): Promise<void>;
  onSessionEnd?(context: AgentContext): Promise<void>;
}
```

---

## Key decisions

- Single definition file (`agent-types.ts`) behind a small public barrel (`src/index.ts`)
- `BeadsTaskStatus` does **not** include `'open'` or `'closed'` (Beads native statuses) — mapped in `beadsAdapter.ts`
- `specPath` on `BeadsTask` comes from `external_ref` in Beads JSON — chosen because Beads has no native spec field
- E1 is a contract layer that can be consumed independently of `@conscius/agent-core`

---

## Archive

Original design: `docs/specs/archive/agent_plugin_interface.md`, `docs/specs/archive/agent_architecture_overview.md`
