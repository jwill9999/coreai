# Conscius Runtime v3 — Canonical specification

**Status:** in-progress  
**Replaces as public surface:** Epic 1 (`@conscius/agent-types`) + Epic 2 (`@conscius/agent-core`) with `@conscius/runtime` and `@conscius/cli`.

This document merges [`docs/planning/conscius-master-pack-v3-FULL-fixed/`](../planning/conscius-master-pack-v3-FULL-fixed/) with the **FINAL** product contracts and **implementation addenda** agreed for this repo.

---

## 1. RuntimeContext and prompt ownership

### Public model (plugins)

Plugins receive only **`RuntimeContext`**: host fields (see addendum A) plus **`memorySegments`**. They must not receive **`promptSegments`**.

### Internal model (runtime only, not exported)

```ts
type InternalRuntimeContext = RuntimeContext & {
  promptSegments: string[];
};
```

`promptSegments` is populated only by the runtime when building the final prompt string. Plugins **must not** read or write it.

---

## 2. Public API (allow-listed)

```ts
export { createRuntime, definePlugin };

export type {
  RuntimeContext,
  MemorySegment,
  Plugin,
  // Domain types required by plugins (former agent-types surface)
  AgentConfig,
  BeadsTask,
  MulchLesson,
  ConversationMessage,
  CompressionSummary,
  // …other exports from runtime `domain` module as needed
};
```

Only the runtime package entry barrel may export these; **`internal/*` is never exported.**

---

## 3. `definePlugin` — validation and normalisation

### Structure

- **`name`**: required, non-empty string.
- **Hooks**: only allow-listed keys; unknown keys rejected; values must be functions or omitted.

### Allowed hooks

```ts
onSessionStart;
onTaskStart;
onMemoryCompose;
onSessionEnd;
```

### `MemorySegment`

```ts
type MemorySegment = {
  type: 'system' | 'instruction' | 'context' | 'experience';
  content: string;
  priority?: number;
  source?: string;
};
```

**Rules:**

- `content`: non-empty string.
- `priority`: default `0`; range **-100 … +100** (inclusive).
- `source`: optional; defaults to **plugin `name`** when missing (after each hook, normalise new segments).

**Out of scope (MVP):** semver capability negotiation, plugin dependency resolution, feature flags.

---

## 4. Lifecycle

### Hooks

| Hook              | Purpose                   |
| ----------------- | ------------------------- |
| `onSessionStart`  | Initialise session memory |
| `onTaskStart`     | Task-specific context     |
| `onMemoryCompose` | Primary memory pipeline   |
| `onSessionEnd`    | Persist / emit learnings  |

### Definition of **cycle**

A **cycle** = one runtime execution pass (typically one user message, one `runtime.run()` / compose call, or one tool round-trip — **host-defined**).

### Execution rules

- **`onMemoryCompose`** runs **every** cycle.
- Other hooks run on **lifecycle transitions** only (as invoked by the host / CLI).

### Shell hooks

Repo/global hook scripts align to: `session-start`, `task-start`, `memory-compose`, `session-end` (see runtime `HookRunner`).

---

## 5. Legacy adapter (single)

**Input shapes (exact):**

```ts
promptChunks: string[];
promptSegments: string[];
```

**Conversion:** each string → `MemorySegment` with `type: 'context'`, `priority: 0`.

**Merge rule when both arrays are non-empty:** **`promptChunks` first, then `promptSegments`** (concatenation order).

There is **one** adapter; no duplicate adapters.

---

## 6. Plugin → segment types (authoring rules)

| Source / plugin        | Allowed `MemorySegment.type`  |
| ---------------------- | ----------------------------- |
| beads                  | `instruction`, `context`      |
| mulch                  | `experience`                  |
| session                | `system`, `context`           |
| hooks / events         | `context`                     |
| user input             | `instruction`                 |
| guardrails             | `system`                      |
| compression (optional) | no new types; transforms only |

Optional compression plugin may **`onMemoryCompose`:** read `memorySegments` and **replace** the array with a compressed list **without changing segment types** (semantic compression only).

---

## 7. Compression architecture

- **Core** dedupe / trim / ordering-aware filtering: **runtime-owned**.
- **Host config (MVP):** `.agent/config.json` may set **`memoryPromptLimits`** on **`AgentConfig`** — optional **`maxSegments`** and **`maxApproxTokens`** caps on **memory segments only** before `buildPromptContext` assembles the final prompt. Lowest-priority segments are dropped first (after sort + adjacent dedupe). Approximate tokens use `ceil(charLength / 4)` (not a real tokenizer). No LLM summarisation in this path.
- **Host config (MVP guardrails):** optional **`memoryGuardrails`** with **`enabled: true`** drops memory segments whose `content` contains built-in deny substrings (case-insensitive) or custom **`denySubstrings`**. Substring checks only — no external services or ML. Runs at the start of `buildPromptContext` (before sort / dedupe / limits).
- **Optional** `@conscius/agent-plugin-compression` (later): may replace `memorySegments` in `onMemoryCompose`; does not define new segment types.

---

## 8. `onMemoryCompose` ordering (addendum B)

Plugins are invoked in **registration / load order** (same as v2 `PluginLoader`). Hosts that need compression last **must** list the compression plugin **after** domain plugins in config.

---

## 9. Memory model and ordering

### Segment types

```ts
type MemorySegmentType = 'system' | 'instruction' | 'context' | 'experience';
```

### Sort order

1. **`priority` DESC**
2. **Type precedence:** `system` > `instruction` > `context` > `experience`

Do **not** mix this with the removed session/task/experience **layer** vocabulary from older docs.

### Prompt assembly inputs

**`buildPromptContext`** reads **`memorySegments`** (after guardrails and limits), **`compressionSummaries`**, and **`conversation`**. It does **not** read **`activeTask`**, **`pendingMulchLessons`**, or other host-only metadata for string assembly. Plugins must put beads/mulch (and similar) influence into **`memorySegments`** (or the compression / conversation paths the pipeline already uses) for it to affect the final prompt.

---

## 10. CLI / host

- **`@conscius/runtime`** — core engine; **`createRuntime`** is the supported programmatic entry.
- **`createRuntime().run(input, repoRoot?)`** — one full compose cycle for a single user turn; returns the final prompt string only (loads `config.plugins` from disk each call).
- **`@conscius/cli`** — thin consumer; **must not** add new lifecycle semantics or orchestration rules.
- **`conscius run --input "<text>"`** (MVP): loads `.agent/config.json`, plugins, runs **`onSessionStart`** + **`onMemoryCompose`** (plugin + hook scripts), then **`buildPromptContext`** and prints the final prompt string to **stdout** (with a trailing newline when the prompt does not already end in one).

---

## 11. Migration

- **Hard cut:** remove `@conscius/agent-core` and `@conscius/agent-types` as packages.
- **No shim packages.**
- **Legacy:** only the **promptChunks + promptSegments → memorySegments** adapter.

---

## Addendum A — Host fields on `RuntimeContext`

The minimal `{ memorySegments }` model is **insufficient** for real plugins (beads, mulch, session, compression). **`RuntimeContext` therefore includes** the same **host-supplied** fields as v2 `AgentContext` where still required, for example:

- `repoRoot`, `config`, `activeTask`, `pendingMulchLessons`, `conversation`, `compressionSummaries`

**Rule:** plugins **must only** add or replace **`memorySegments`** (and may update non-prompt host state such as `activeTask` when enriching task metadata). They must **not** touch **`promptSegments`** or internal prompt assembly.

**Prompt contract:** changing only host fields such as **`activeTask`** or **`pendingMulchLessons`** without updating **`memorySegments`** / **`compressionSummaries`** / **`conversation`** must **not** change the output of **`buildPromptContext`**.

---

## 12. Final system contract (summary)

The runtime is the single authority for orchestration, ordering, core compression behaviour, and prompt construction. Plugins inject validated structured memory through lifecycle hooks. Legacy string context is normalised through the single adapter. Lifecycle is deterministic and cycle-based.

---

## 13. Related docs

- [Master pack (v3 fixed)](../planning/conscius-master-pack-v3-FULL-fixed/) — boundary and dependency notes.
- [Planning index](../planning/index.md) — Epic 10 tasks.
