# `@conscius/agent-types` API reference

Shared TypeScript types and interfaces used across all Conscius packages. Plugin authors depend on this package for the `AgentPlugin` interface without taking a runtime dependency on `agent-core`.

**Version:** see [npm](https://www.npmjs.com/package/@conscius/agent-types)  
**Import path:** `@conscius/agent-types`

---

## `AgentPlugin`

The core plugin contract. All Conscius plugins implement this interface.

```typescript
export interface AgentPlugin {
  name: string;
  onSessionStart?(context: AgentContext): Promise<void>;
  onTaskStart?(context: AgentContext): Promise<void>;
  onConversationThreshold?(context: AgentContext): Promise<void>;
  onSessionEnd?(context: AgentContext): Promise<void>;
}
```

| Member                    | Required | Description                                                                                   |
| ------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `name`                    | ✅       | Unique plugin identifier used in logging and diagnostics                                      |
| `onSessionStart`          | optional | Called when a new agent session begins. Load baseline context here.                           |
| `onTaskStart`             | optional | Called when a Beads task becomes active. Inject task and spec context.                        |
| `onConversationThreshold` | optional | Called when conversation length exceeds the compression threshold (typically 30–40 messages). |
| `onSessionEnd`            | optional | Called when the session ends. Persist state, write lessons.                                   |

---

## `AgentContext`

Mutable session state passed to every plugin hook. Plugins read from and write to this object.

```typescript
export interface AgentContext {
  repoRoot: string;
  config: AgentConfig;
  activeTask?: BeadsTask;
  pendingMulchLessons?: MulchLesson[];
  promptSegments: string[];
  conversation: ConversationMessage[];
  compressionSummaries: CompressionSummary[];
}
```

| Field                  | Type                         | Description                                                       |
| ---------------------- | ---------------------------- | ----------------------------------------------------------------- |
| `repoRoot`             | `string`                     | Absolute path to the repository root                              |
| `config`               | `AgentConfig`                | Loaded agent configuration (`.agent/config.json`)                 |
| `activeTask`           | `BeadsTask \| undefined`     | The currently active Beads task, if any                           |
| `pendingMulchLessons`  | `MulchLesson[] \| undefined` | Explicit Mulch lessons queued for persistence at session end      |
| `promptSegments`       | `string[]`                   | Compiled prompt segments for the session — plugins append to this |
| `conversation`         | `ConversationMessage[]`      | Full conversation history for the current session                 |
| `compressionSummaries` | `CompressionSummary[]`       | Compression summaries replacing earlier conversation segments     |

---

## `AgentConfig`

Shape of `.agent/config.json`.

```typescript
export interface AgentConfig {
  plugins?: string[];
  hooks?: {
    repoHooksDir?: string;
    globalHooksDir?: string;
  };
  permissions?: {
    allowWrite?: string[];
  };
  approvedWrites?: Record<string, boolean>;
}
```

---

## `BeadsTask`

Represents a task from the Beads task graph.

```typescript
export interface BeadsTask {
  id: string;
  title: string;
  status: BeadsTaskStatus;
  description?: string;
  specPath?: string;
  dependencies?: string[];
  assignee?: string;
}

export type BeadsTaskStatus =
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'blocked'
  | 'done';
```

---

## `MulchLesson`

A persistent lesson stored in Mulch expertise storage. In legacy layouts this
was `.mulch/mulch.jsonl`; upstream Mulch uses `.mulch/expertise/<domain>.jsonl`.

```typescript
export interface MulchLesson {
  id: string;
  topic: string;
  summary: string;
  recommendation: string;
  created: string;
  task_id?: string;
  files?: string[];
  tags?: string[];
  service?: string;
}
```

---

## `CompressionSummary`

A summary that replaces an earlier conversation segment during compression.

```typescript
export interface CompressionSummary {
  segmentIndex: number;
  topic: string;
  keyDecisions: string[];
  constraints: string[];
  outcome: string;
}
```

---

## `ConversationMessage` / `ConversationSegment`

```typescript
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ConversationSegment {
  index: number;
  topic: string;
  messages: ConversationMessage[];
}
```
