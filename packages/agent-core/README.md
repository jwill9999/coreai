# @coreai/agent-core

The runtime orchestration engine for the coreai agent ecosystem. It assembles prompt context, loads plugins, runs lifecycle hooks, and exposes a CLI for managing agent sessions and tasks.

[![CI](https://github.com/jwill9999/coreai/actions/workflows/ci.yml/badge.svg)](https://github.com/jwill9999/coreai/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@coreai/agent-core)](https://www.npmjs.com/package/@coreai/agent-core)

---

## Contents

- [What it does](#what-it-does)
- [Installation](#installation)
- [CLI usage](#cli-usage)
- [Configuration](#configuration)
- [Library API](#library-api)
- [Plugin interface](#plugin-interface)
- [Hook scripts](#hook-scripts)
- [Context assembly](#context-assembly)
- [Development](#development)
- [Documentation](#documentation)

---

## What it does

`agent-core` is the central runtime that powers all coreai agent workflows:

| Responsibility           | Details                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Plugin orchestration** | Dynamically loads ESM plugins; calls `onSessionStart`, `onTaskStart`, `onConversationThreshold`, `onSessionEnd` |
| **Context assembly**     | Builds the final prompt from plugin segments, compression summaries, and recent conversation messages           |
| **Hook runner**          | Executes shell/JS scripts from `.agent/hooks/` (repo) or `~/.agent/hooks/` (global)                             |
| **CLI**                  | `agent start`, `agent end`, `agent task start <id>` commands                                                    |
| **Permission guards**    | Enforces approved write paths — only `SESSION.md` and `.mulch/mulch.jsonl` by default                           |

---

## Installation

```bash
npm install @coreai/agent-core
```

> **Requires:** Node 24+. Peer dependency: `@coreai/agent-types`.

---

## CLI usage

The package installs an `agent` binary:

```bash
# Start a session — runs onSessionStart on all plugins + session-start hooks
agent start

# Activate a task — runs onTaskStart on all plugins + task-start hooks
agent task start <task-id>

# End a session — runs onSessionEnd on all plugins + session-end hooks
agent end
```

All commands read `.agent/config.json` from the current working directory (repo root).

---

## Configuration

On first run, `agent start` creates `.agent/config.json` in your repo root:

```jsonc
{
  "plugins": ["@coreai/agent-plugin-beads", "@coreai/agent-plugin-mulch"],
  "hooks": {
    "repoHooksDir": ".agent/hooks",
    "globalHooksDir": "~/.agent/hooks",
  },
  "permissions": {
    "allowWrite": ["SESSION.md", ".mulch/mulch.jsonl"],
  },
}
```

| Field                    | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| `plugins`                | npm package names or relative file paths to load as plugins    |
| `hooks.repoHooksDir`     | Repo-local hook scripts directory (takes priority over global) |
| `hooks.globalHooksDir`   | Global hook scripts directory                                  |
| `permissions.allowWrite` | Files plugins are allowed to write to                          |

---

## Library API

```typescript
import {
  PluginLoader,
  HookRunner,
  buildContext,
  shouldCompress,
  getMessagesToCompress,
  HOOK_NAMES,
  DEFAULT_AGENT_CONFIG,
} from '@coreai/agent-core';
```

### `PluginLoader`

Loads and invokes plugins by lifecycle hook:

```typescript
const loader = new PluginLoader();
await loader.load(['@coreai/agent-plugin-beads']);
await loader.runHook('onSessionStart', context);
```

### `HookRunner`

Runs shell/JS hook scripts from the hooks directories:

```typescript
const runner = new HookRunner(repoRoot, config);
await runner.runHook('session-start', context);
```

Hook scripts receive `AGENT_REPO_ROOT`, `AGENT_ACTIVE_TASK_ID`, and other context values as environment variables.

### `buildContext(context)`

Assembles the final prompt string from all sources in the defined injection order:

```
skills / instructions → SESSION.md → compression summaries → recent messages → task context → spec
```

```typescript
const { prompt } = buildContext(context);
```

### `shouldCompress(context)` / `getMessagesToCompress(context)`

Checks whether the conversation exceeds the 30-message compression threshold and returns the messages eligible for compression (all but the most recent 10):

```typescript
if (shouldCompress(context)) {
  const toCompress = getMessagesToCompress(context);
}
```

---

## Plugin interface

Implement `AgentPlugin` from `@coreai/agent-types` — all lifecycle hooks are optional:

```typescript
import type { AgentPlugin, AgentContext } from '@coreai/agent-types';

export const myPlugin: AgentPlugin = {
  name: 'my-plugin',

  async onSessionStart(context: AgentContext): Promise<void> {
    context.promptSegments.push('## My Plugin\nHello from my plugin!');
  },

  async onTaskStart(context: AgentContext): Promise<void> {
    // Access active task via context.activeTask
  },

  async onConversationThreshold(context: AgentContext): Promise<void> {
    // Triggered at 30 messages — compress older context
  },

  async onSessionEnd(context: AgentContext): Promise<void> {
    // Persist lessons, write SESSION.md, etc.
  },
};
```

The `AgentContext` passed to every hook:

```typescript
interface AgentContext {
  repoRoot: string; // Absolute path to repo root
  config: AgentConfig; // .agent/config.json contents
  activeTask?: BeadsTask; // Current task (set by agent task start)
  promptSegments: string[]; // Push markdown strings here to inject into prompt
  conversation: ConversationMessage[]; // Full conversation history
  compressionSummaries: CompressionSummary[]; // Compressed older conversation segments
}
```

---

## Hook scripts

Hook scripts are shell or JS files placed in `.agent/hooks/` (repo-local) or `~/.agent/hooks/` (global). Repo-local hooks take priority.

| Lifecycle event        | Script name                                                |
| ---------------------- | ---------------------------------------------------------- |
| Session start          | `session-start.sh` / `session-start.mjs`                   |
| Task start             | `task-start.sh` / `task-start.mjs`                         |
| Conversation threshold | `conversation-threshold.sh` / `conversation-threshold.mjs` |
| Session end            | `session-end.sh` / `session-end.mjs`                       |

Environment variables available in every hook:

```
AGENT_REPO_ROOT          Absolute path to the repository root
AGENT_ACTIVE_TASK_ID     ID of the active task (if set)
AGENT_PLUGIN_NAME        Name of the plugin that triggered this hook
```

---

## Context assembly

Prompt segments are assembled in this injection order (defined in the architecture spec):

```
1. Skills / instructions
2. SESSION.md (session continuity)
3. Compression summaries (older conversation segments)
4. Recent conversation messages (last 10)
5. Beads task context (id, title, status, description)
6. Spec file contents (from task external_ref, up to 50 KB)
```

---

## Development

```bash
# Build
npx nx build agent-core

# Typecheck
npx nx typecheck agent-core

# Lint
npx nx lint agent-core

# Test (58 tests)
npx nx test agent-core

# All quality checks
npx nx run-many -t typecheck,lint,test,build --projects=agent-core
```

---

## Documentation

| Doc                                                                                                                   | Description                             |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| [Architecture overview](../../docs/specs/agent_architecture_documentation_pack/agent_architecture_overview.md)        | System layers and design decisions      |
| [Runtime flow](../../docs/specs/agent_architecture_documentation_pack/AGENT_RUNTIME_FLOW.md)                          | End-to-end lifecycle walkthrough        |
| [Plugin interface spec](../../docs/specs/agent_architecture_documentation_pack/agent_plugin_interface.md)             | Plugin contract and responsibilities    |
| [Hook specification](../../docs/specs/agent_architecture_documentation_pack/layer6_context_injection_hooks_spec.md)   | Hook resolution order and env injection |
| [Compression spec](../../docs/specs/agent_architecture_documentation_pack/layer4_conversation_compression_spec.md)    | Conversation compression strategy       |
| [Session continuity spec](../../docs/specs/agent_architecture_documentation_pack/session_continuity_layer_spec_v2.md) | SESSION.md lifecycle and format         |

---

## Related packages

| Package                                                         | Description                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`@coreai/agent-types`](../agent-types/README.md)               | Shared TypeScript interfaces (`AgentPlugin`, `AgentContext`, etc.) |
| [`@coreai/agent-plugin-beads`](../agent-plugin-beads/README.md) | Injects Beads task context via `bd` CLI                            |
