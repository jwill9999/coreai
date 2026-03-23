# Conscius

![version](https://img.shields.io/badge/version-0.5.0--alpha.0-blue)
[![CI](https://github.com/jwill9999/conscius/actions/workflows/ci.yml/badge.svg)](https://github.com/jwill9999/conscius/actions/workflows/ci.yml)
[![CodeQL](https://github.com/jwill9999/conscius/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/jwill9999/conscius/actions/workflows/github-code-scanning/codeql)
[![codecov](https://codecov.io/gh/jwill9999/conscius/graph/badge.svg)](https://codecov.io/gh/jwill9999/conscius)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=jwill9999_coreai&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=jwill9999_coreai)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=jwill9999_coreai&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=jwill9999_coreai)

**Conscius** is a plugin-based framework that gives AI agents persistent cognition — memory, session awareness, task context, and reusable skills that survive across sessions.

Most AI agents are stateless. Conscius bridges that gap by providing a structured runtime that agents can use to reason about past actions, understand current work, and plan future steps.

**`main` baseline:** runtime **v3** plus **Epic 11 MVP hardening** — types and orchestration in `@conscius/runtime`; CLI **`conscius`** (`@conscius/cli`). Includes **`memoryPromptLimits`** and **`memoryGuardrails`**, **`createRuntime().run(input)`** (full compose cycle → prompt string), **`conscius run --input`**, and the documented **memory-only prompt contract** (`buildPromptContext` ignores host-only fields such as `activeTask` unless reflected in segments / compression / conversation). Legacy `agent-core` / standalone `agent-types` packages are not in this workspace.

---

## Packages

| Package                                                         | Description                                                                                        |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`@conscius/runtime`](./packages/runtime)                       | Unified runtime v3 — `createRuntime`, `definePlugin`, `run()`, memory pipeline, hook runner, types |
| [`@conscius/cli`](./packages/cli)                               | `conscius` CLI — `run --input`, `start` / `end` / `task start`; thin runtime consumer              |
| [`@conscius/agent-plugin-beads`](./packages/agent-plugin-beads) | Plugin: injects active task context from the Beads task graph                                      |
| [`@conscius/agent-plugin-mulch`](./packages/agent-plugin-mulch) | Plugin: injects Mulch lessons via `ml prime` during session start                                  |

---

## Quick start

```bash
git clone git@github.com:jwill9999/conscius.git
cd conscius
nvm use
npm install
npx nx run-many -t typecheck,lint,test,build --all
```

With `.agent/config.json` in the working directory (same layout the runtime expects in real repos), you can try a one-shot compose cycle:

```bash
npx conscius run --input "Hello"
```

→ Full setup guide: [docs/guides/getting-started.md](./docs/guides/getting-started.md)

---

## Documentation

| Section                                                                      | Description                                                           |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [Documentation index](./docs/README.md)                                      | Full navigation — all guides, specs, ADRs, and API reference          |
| [Getting started](./docs/guides/getting-started.md)                          | Install, configure, and run the workspace                             |
| [Adding a plugin](./docs/guides/adding-a-plugin.md)                          | Scaffold and register a new Conscius plugin                           |
| [Publishing](./docs/guides/publishing.md)                                    | Pre-publish checklist and npm publish workflow                        |
| [Upstream versions (Mulch / Beads)](./docs/guides/upstream-versions.md)      | Pinning policy, lockfile + CI, bumping `ml` and `bd`                  |
| [API reference — runtime](./docs/api/runtime.md)                             | Engine, types, hooks, memory pipeline                                 |
| [API reference — cli](./docs/api/cli.md)                                     | `conscius` binary                                                     |
| [API reference — agent-types (archived)](./docs/api/agent-types.md)          | Redirect: types merged into `@conscius/runtime`                       |
| [API reference — agent-core (archived)](./docs/api/agent-core.md)            | Redirect: split into `runtime` + `cli`                                |
| [Architecture overview](./docs/specs/archive/agent_architecture_overview.md) | 7-layer system design                                                 |
| [Architecture Decision Records](./docs/adr/)                                 | Why key decisions were made                                           |
| [Planning](./docs/planning/index.md)                                         | Epics, features, and tasks in progress                                |
| [Mulch in this repo](./.mulch/README.md)                                     | `.mulch/` layout, **`make mulch-record`**, CLI install / `PATH` notes |

---

## Architecture

Conscius separates concerns across 7 layers:

| Layer | Name                                 | Persistence |
| ----- | ------------------------------------ | ----------- |
| 1     | Beads — task graph                   | persistent  |
| 2     | Mulch — experience / lessons learned | persistent  |
| 3     | Skills / instruction knowledge       | persistent  |
| 4     | Conversation compression             | ephemeral   |
| 5     | Session continuity (`SESSION.md`)    | persistent  |
| 6     | Context injection hooks              | persistent  |
| 7     | Guardrails & quality gates           | runtime     |

Each layer is implemented as an independent plugin package. **`@conscius/runtime`** loads and orchestrates whichever plugins are configured.

---

## Development

```bash
# Build a single package
npx nx build @conscius/runtime

# Run tests
npx nx test @conscius/runtime

# Lint
npx nx lint @conscius/runtime

# Run all quality checks
npx nx run-many -t typecheck,lint,test --all

# Check only affected packages (CI mode)
npx nx affected -t typecheck,lint,test
```

Repo **Makefile** (optional): run **`make help`** for targets. **`make mulch-record`** starts the interactive Mulch lesson flow after **`npm install`** — details, required fields, and how the CLI is resolved on `PATH` are in **[.mulch/README.md](./.mulch/README.md)**.

---

## Contributing

See [SESSION.md](./SESSION.md) for epic status, open housekeeping items, and next steps. [SUMMARY.md](./SUMMARY.md) holds compressed session history for agents.

**Badges:** CI, Codecov, and CodeQL target this repo (**`jwill9999/conscius`**). SonarCloud still uses the historical project key **`jwill9999_coreai`** in URLs — quality gate links remain valid.
