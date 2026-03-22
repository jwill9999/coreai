# Getting started

## Prerequisites

- Node 24 (use `nvm use` in the repo root — version pinned in `.nvmrc`)
- npm 10+
- Git

## Install

```bash
git clone git@github.com:jwill9999/conscius.git
cd conscius
nvm use
npm install
```

## Verify the workspace

Run the full quality suite to confirm everything is wired correctly:

```bash
npx nx run-many -t typecheck,lint,test,build --all
```

All packages should pass: `@conscius/runtime`, `@conscius/cli`, `@conscius/agent-plugin-beads`, `@conscius/agent-plugin-mulch`.

## Workspace layout

```
packages/
  agent-types/        # Shared TypeScript types — AgentPlugin, AgentContext, etc.
  agent-core/         # Core runtime — context builder, plugin loader, CLI
  agent-plugin-beads/ # Plugin: wraps the bd CLI for task graph context injection
```

## Common commands

| Task              | Command                                  |
| ----------------- | ---------------------------------------- |
| Build all         | `npx nx run-many -t build --all`         |
| Typecheck all     | `npx nx run-many -t typecheck --all`     |
| Lint all          | `npx nx run-many -t lint --all`          |
| Test all          | `npx nx run-many -t test --all`          |
| Build one package | `npx nx build @conscius/runtime`         |
| Run affected only | `npx nx affected -t typecheck,lint,test` |
| Format check      | `npx nx format:check`                    |
| Format write      | `npx nx format:write`                    |

## Next steps

- [Add a plugin](./adding-a-plugin.md) — scaffold a new `@conscius` plugin package
- [Plugin interface spec](../specs/archive/agent_plugin_interface.md) — understand the `AgentPlugin` lifecycle
- [Architecture overview](../specs/archive/agent_architecture_overview.md) — the 7-layer system design
