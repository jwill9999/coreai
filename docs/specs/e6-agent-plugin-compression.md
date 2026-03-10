# E6 — @conscius/agent-plugin-compression

**Beads ID:** coreai-mbp  
**Status:** implementation brief (not started)  
**Package:** `packages/agent-plugin-compression`  
**Import path:** `@conscius/agent-plugin-compression`

---

## Overview

Plugin that prevents context window bloat by compressing older conversation segments into structured summaries. When the conversation reaches the threshold (30 messages), older messages are replaced with `CompressionSummary` objects. Only recent messages are kept in full. This layer is **ephemeral** — summaries exist only in memory during the session, never written to files.

---

## Target file structure

```
packages/agent-plugin-compression/
└── src/
    ├── index.ts
    └── lib/
        ├── compressor.ts           ← compressMessages() — produces CompressionSummary[]
        ├── hooks.ts                ← compressionPlugin: AgentPlugin implementation
        └── __tests__/
            ├── compressor.spec.ts
            └── hooks.spec.ts
```

---

## Module responsibilities

### `compressor.ts`

```ts
compressMessages(
  messages: ConversationMessage[],
  recentToKeep: number
): Promise<{ summaries: CompressionSummary[], remaining: ConversationMessage[] }>
```

Groups older messages into segments by topic (or time boundary). For each segment, produces a `CompressionSummary` with:

- `segmentIndex` — 0-based segment number
- `topic` — inferred from message content (heuristic or LLM call)
- `keyDecisions` — array of decision statements extracted from segment
- `constraints` — array of constraints identified
- `outcome` — one-sentence summary of what was accomplished

Returns both the summaries and the `remaining` messages (the most recent `recentToKeep`).

**Note:** In the initial implementation, compression may use a simple heuristic (keyword extraction) rather than a live LLM call, to avoid external dependencies. A `compressWithLLM` option can be added later.

### `hooks.ts`

```ts
export const compressionPlugin: AgentPlugin;
```

`onConversationThreshold(context)`:

1. Use `getMessagesToCompress` and `shouldCompress` from `@conscius/agent-core` (re-exported)
2. If below threshold — return silently
3. Call `compressMessages` on the messages to compress
4. Push new summaries onto `context.compressionSummaries`
5. Replace `context.conversation` with only the remaining recent messages

---

## Key design principle: ephemeral

This plugin **never writes to disk**. It only mutates `AgentContext` in memory:

- `context.compressionSummaries` — summaries accumulate here
- `context.conversation` — older messages are replaced by summaries

`buildContext` (in `agent-core`) reads both and assembles them into the prompt in order.

---

## CompressionSummary interface (from `@conscius/agent-types`)

```ts
{
  segmentIndex: number;
  topic: string;
  keyDecisions: string[];
  constraints: string[];
  outcome: string;
}
```

---

## Implementation notes

- Follow `packages/agent-plugin-beads/` file structure **exactly**
- `tsconfig.spec.json` must set `"customConditions": null`
- Compression threshold and recent-to-keep constants live in `agent-core` — import from there
- No file writes — purely in-memory
- Plugin exported as `compressionPlugin` + default export

---

## Acceptance criteria

- [ ] `compressMessages` returns summaries + remaining messages at threshold
- [ ] Plugin returns silently when below threshold
- [ ] `context.compressionSummaries` accumulates correctly across multiple compressions
- [ ] `context.conversation` contains only recent messages after compression
- [ ] No file writes occur
- [ ] All functions have unit tests
- [ ] `npx nx run-many -t typecheck,lint,test --projects=agent-plugin-compression` passes

---

## Tasks (Beads)

| Beads ID     | Task                                        |
| ------------ | ------------------------------------------- |
| coreai-mbp.1 | Implement compressor (heuristic summariser) |
| coreai-mbp.2 | Implement hooks (onConversationThreshold)   |
| coreai-mbp.3 | Unit tests for compressor                   |
| coreai-mbp.4 | Integration with agent-core buildContext    |

---

## Archive

Original design: `docs/specs/archive/layer4_conversation_compression_spec.md`
