# `@conscius/runtime` API reference

**Version:** see [npm](https://www.npmjs.com/package/@conscius/runtime)  
**Import path:** `@conscius/runtime`

Unified runtime (v3): plugin orchestration, structured `memorySegments`, hook runner, prompt assembly, and shared domain types (former `agent-types` surface).

## Primary exports

- `createRuntime` — programmatic entry; loads plugins and runs lifecycle methods.
- `definePlugin` — validates and normalises plugin definitions (allowed hooks only).
- `createHostRuntimeContext` — builds a host/CLI context (includes internal `promptSegments` buffer after `buildPromptContext`).
- `HookRunner`, `DEFAULT_AGENT_CONFIG`, `HOOK_SCRIPT_NAMES` — repo/global shell hooks and config bootstrap.
- `buildPromptContext`, `shouldCompress`, `getMessagesToCompress`, `COMPRESSION_THRESHOLD`, `RECENT_MESSAGES_TO_KEEP` — memory pipeline and conversation helpers.
- `adaptLegacyPromptArrays` — merges legacy `promptChunks` + `promptSegments` into `MemorySegment[]`.
- Types: `RuntimeContext`, `MemorySegment`, `Plugin`, `HostRuntimeContext`, plus domain types (`AgentConfig`, `BeadsTask`, `MulchLesson`, `ConversationMessage`, `CompressionSummary`, …).

## Plugin hooks (v3)

- `onSessionStart`
- `onTaskStart`
- `onMemoryCompose` (every compose cycle)
- `onSessionEnd`

Plugins receive `RuntimeContext` (no `promptSegments`). They add structured `memorySegments` only.

## Shell hook script names

Mapped via `HOOK_SCRIPT_NAMES`: `session-start`, `task-start`, `memory-compose`, `session-end`.

## Further reading

- [Runtime v3 spec](../specs/runtime-v3.md)
- [`@conscius/cli`](./cli.md) — `conscius` binary
