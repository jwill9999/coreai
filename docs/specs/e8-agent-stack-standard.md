# E8 — @conscius/agent-stack-standard

**Beads ID:** coreai-zsh  
**Status:** implementation brief (not started)  
**Package:** `packages/agent-stack-standard`  
**Import path:** `@conscius/agent-stack-standard`

---

## Overview

A convenience bundle that pre-configures `agent-core` with all standard plugins (beads, mulch, session, compression, guardrails). Users install `agent-stack-standard` instead of wiring up each plugin individually. Provides a single entry point with sensible defaults.

---

## Target file structure

```
packages/agent-stack-standard/
└── src/
    ├── index.ts                    ← exports createAgentStack(), AgentStack type
    └── lib/
        ├── stack.ts                ← createAgentStack() — wires plugins into agent-core
        └── __tests__/
            └── stack.spec.ts
```

---

## Module responsibilities

### `stack.ts`

```ts
interface AgentStack {
  pluginLoader: PluginLoader;
  hookRunner: HookRunner;
  run(context: AgentContext): Promise<BuiltContext>;
}

createAgentStack(repoRoot: string, config?: Partial<AgentConfig>): Promise<AgentStack>
```

1. Loads config from `.agent/config.json` (via `HookRunner.ensureConfig`)
2. Creates `PluginLoader` and loads all standard plugins:
   - `@conscius/agent-plugin-beads`
   - `@conscius/agent-plugin-mulch`
   - `@conscius/agent-plugin-session`
   - `@conscius/agent-plugin-compression`
   - `@conscius/agent-plugin-guardrails`
3. Creates `HookRunner`
4. Returns `AgentStack` with `run()` method

`run(context)` orchestration:

```
1. pluginLoader.runSessionStart(context)
2. pluginLoader.runTaskStart(context)
3. if shouldCompress(context.conversation) → pluginLoader.runConversationThreshold(context)
4. buildContext(context) → returns BuiltContext
```

---

## Package dependencies

```json
{
  "dependencies": {
    "@conscius/agent-core": "workspace:*",
    "@conscius/agent-plugin-beads": "workspace:*",
    "@conscius/agent-plugin-mulch": "workspace:*",
    "@conscius/agent-plugin-session": "workspace:*",
    "@conscius/agent-plugin-compression": "workspace:*",
    "@conscius/agent-plugin-guardrails": "workspace:*"
  }
}
```

---

## Usage example

```ts
import { createAgentStack } from '@conscius/agent-stack-standard';

const stack = await createAgentStack(process.cwd());
const result = await stack.run({
  repoRoot: process.cwd(),
  config: stack.pluginLoader.getConfig(),
  activeTask: { id: process.env.BD_TASK_ID },
  promptSegments: [],
  conversation: [],
  compressionSummaries: [],
});
console.log(result.prompt);
```

---

## Implementation notes

- This package has **no business logic** — it is purely an integration/wiring layer
- All logic lives in the individual packages
- `tsconfig.spec.json` must set `"customConditions": null`
- Plugin exported as default export and named export

---

## Acceptance criteria

- [ ] `createAgentStack` loads all 5 plugins
- [ ] `run()` calls all lifecycle hooks in correct order
- [ ] `shouldCompress` check gates `onConversationThreshold`
- [ ] Returns `BuiltContext` with assembled prompt
- [ ] Integration test: all plugins fire with a mock context
- [ ] `npx nx run-many -t typecheck,lint,test --projects=agent-stack-standard` passes

---

## Tasks (Beads)

| Beads ID     | Task                                            |
| ------------ | ----------------------------------------------- |
| coreai-zsh.1 | Scaffold package + wire all plugin dependencies |
| coreai-zsh.2 | Implement createAgentStack() + run()            |
| coreai-zsh.3 | Integration tests                               |

---

## Archive

Original design: `docs/specs/archive/ECOSYSTEM_REPO_STRUCTURE.md`
