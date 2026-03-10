# E1 — @conscius/agent-types

**Beads ID:** coreai-1ra  
**Status:** as-built (complete)  
**Package:** `packages/agent-types`  
**Import path:** `@conscius/agent-types`

---

## Overview

Shared TypeScript interfaces and types used across all packages in the monorepo. No runtime logic — types only.

---

## File structure (as-built)

```
packages/agent-types/
└── src/
    └── lib/
        └── agent-types.ts    ← all interfaces in one file
```

---

## Exported interfaces

### `MulchLesson`

Experience lesson stored in `.mulch/mulch.jsonl`. Required fields: `id`, `topic`, `summary`, `recommendation`, `created`.

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

- Single file (`agent-types.ts`) — no sub-modules, easy to import
- `BeadsTaskStatus` does **not** include `'open'` or `'closed'` (Beads native statuses) — mapped in `beadsAdapter.ts`
- `specPath` on `BeadsTask` comes from `external_ref` in Beads JSON — chosen because Beads has no native spec field

---

## Archive

Original design: `docs/specs/archive/agent_plugin_interface.md`, `docs/specs/archive/agent_architecture_overview.md`
