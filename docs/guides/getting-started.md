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
  runtime/              # @conscius/runtime — engine, types, memory pipeline, hooks
  cli/                  # @conscius/cli — conscius binary
  agent-plugin-beads/   # Plugin: Beads / bd task context
  agent-plugin-mulch/   # Plugin: Mulch / ml prime experience injection
```

## Common commands

| Task              | Command                                                                |
| ----------------- | ---------------------------------------------------------------------- |
| One-shot prompt   | `npx conscius run --input "Hello"` (needs `.agent/config.json` in cwd) |
| Build all         | `npx nx run-many -t build --all`                                       |
| Typecheck all     | `npx nx run-many -t typecheck --all`                                   |
| Lint all          | `npx nx run-many -t lint --all`                                        |
| Test all          | `npx nx run-many -t test --all`                                        |
| Build one package | `npx nx build @conscius/runtime`                                       |
| Run affected only | `npx nx affected -t typecheck,lint,test`                               |
| Format check      | `npx nx format:check`                                                  |
| Format write      | `npx nx format:write`                                                  |

## Next steps

- [Upstream tooling — Mulch and Beads](./upstream-versions.md) — semver ranges, **`package-lock.json`** + **`npm ci`** in CI, tested **`bd`** / Mulch CLI versions, and how to bump safely
- [Add a plugin](./adding-a-plugin.md) — scaffold a new `@conscius` plugin package
- [Plugin interface spec](../specs/archive/agent_plugin_interface.md) — understand the `AgentPlugin` lifecycle
- [Architecture overview](../specs/archive/agent_architecture_overview.md) — the 7-layer system design
