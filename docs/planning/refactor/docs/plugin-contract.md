# Plugin Contract v3

Authoritative hook list and types live in `@conscius/runtime` (`Plugin`, `RuntimeContext`). Plugins **do not** receive `promptSegments` and must not use a removed `onPromptBuild` hook — they mutate **`memorySegments`** only (plus optional metadata such as `activeTask` when documented).

## Hooks

- `onSessionStart(ctx)`
- `onTaskStart(ctx)`
- `onMemoryCompose(ctx)`
- `onSessionEnd(ctx)`

## MemorySegment

```ts
type MemorySegment = {
  type: 'instruction' | 'experience' | 'context' | 'system';
  content: string;
  priority?: number;
  source?: string;
};
```

Segments added by the host without a `source` are attributed to `"host"` before plugins run; segments added inside a plugin hook are attributed to that plugin’s `name`.
