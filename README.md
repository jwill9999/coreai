# Conscius

![version](https://img.shields.io/badge/version-0.3.0--alpha.0-blue)
[![CI](https://github.com/jwill9999/conscius/actions/workflows/ci.yml/badge.svg)](https://github.com/jwill9999/conscius/actions/workflows/ci.yml)
[![CodeQL](https://github.com/jwill9999/conscius/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/jwill9999/conscius/actions/workflows/github-code-scanning/codeql)
[![codecov](https://codecov.io/gh/jwill9999/conscius/graph/badge.svg)](https://codecov.io/gh/jwill9999/conscius)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=jwill9999_coreai&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=jwill9999_coreai)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=jwill9999_coreai&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=jwill9999_coreai)

**Conscius** is a plugin-based framework that gives AI agents persistent cognition — memory, session awareness, task context, and reusable skills that survive across sessions.

Most AI agents are stateless. Conscius bridges that gap by providing a structured runtime that agents can use to reason about past actions, understand current work, and plan future steps.

---

## Packages

| Package                                                         | Description                                                                              |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [`@conscius/agent-types`](./packages/agent-types)               | Shared TypeScript interfaces — `AgentPlugin`, `AgentContext`, `BeadsTask`, `MulchLesson` |
| [`@conscius/agent-core`](./packages/agent-core)                 | Core runtime — context builder, plugin loader, hook runner, CLI                          |
| [`@conscius/agent-plugin-beads`](./packages/agent-plugin-beads) | Plugin: injects active task context from the Beads task graph                            |

---

## Quick start

```bash
git clone git@github.com:jwill9999/conscius.git
cd conscius
nvm use
npm install
npx nx run-many -t typecheck,lint,test,build --all
```

→ Full setup guide: [docs/guides/getting-started.md](./docs/guides/getting-started.md)

---

## Documentation

| Section                                                                                                    | Description                                                  |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [Documentation index](./docs/README.md)                                                                    | Full navigation — all guides, specs, ADRs, and API reference |
| [Getting started](./docs/guides/getting-started.md)                                                        | Install, configure, and run the workspace                    |
| [Adding a plugin](./docs/guides/adding-a-plugin.md)                                                        | Scaffold and register a new Conscius plugin                  |
| [Publishing](./docs/guides/publishing.md)                                                                  | Pre-publish checklist and npm publish workflow               |
| [API reference — agent-types](./docs/api/agent-types.md)                                                   | All exported types and interfaces                            |
| [API reference — agent-core](./docs/api/agent-core.md)                                                     | Context builder, plugin loader, hook runner                  |
| [Architecture overview](./docs/specs/agent_architecture_documentation_pack/agent_architecture_overview.md) | 7-layer system design                                        |
| [Architecture Decision Records](./docs/adr/)                                                               | Why key decisions were made                                  |
| [Planning](./docs/planning/index.md)                                                                       | Epics, features, and tasks in progress                       |

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

Each layer is implemented as an independent plugin package. The core runtime (`agent-core`) loads and orchestrates whichever plugins are configured.

---

## Development

```bash
# Build a single package
npx nx build agent-core

# Run tests
npx nx test agent-core

# Lint
npx nx lint agent-core

# Run all quality checks
npx nx run-many -t typecheck,lint,test --all

# Check only affected packages (CI mode)
npx nx affected -t typecheck,lint,test
```

---

## Contributing

See [SESSION.md](./SESSION.md) for current work in progress and next steps.
