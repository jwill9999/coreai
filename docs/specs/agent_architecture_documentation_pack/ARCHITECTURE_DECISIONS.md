# ARCHITECTURE_DECISIONS.md

This document records the key architectural decisions made while
designing the AI‑assisted engineering system. It acts as a lightweight
**Architecture Decision Record (ADR)** so future engineers and AI agents
understand *why* certain decisions were made.

------------------------------------------------------------------------

# Decision 1 --- Layered Agent Architecture

## Context

The system needed a clear separation between execution logic, memory
systems, agent knowledge, and orchestration.

## Decision

Adopt a **7‑layer architecture** separating responsibilities.

## Layers

1.  Beads Execution Layer
2.  Mulch Experience Layer
3.  Skills / Instruction Knowledge Layer
4.  Conversation Compression Layer
5.  Session Continuity (SESSION.md)
6.  Context Injection Hooks
7.  Guardrails & Quality Gates

## Rationale

Benefits:

-   clear separation of concerns
-   extensible architecture
-   tool independence
-   easier reasoning for AI agents

------------------------------------------------------------------------

# Decision 2 --- External Tool Integration (Beads & Mulch)

## Context

Beads and Mulch are already established tools.

## Decision

Do **not fork these tools**.

Instead create **plugin adapters**.

Example:

agent-plugin-beads → wraps `bd` CLI\
agent-plugin-mulch → wraps `mulch` CLI

## Rationale

-   avoids maintenance burden
-   stays compatible with upstream
-   leverages existing ecosystems

------------------------------------------------------------------------

# Decision 3 --- Core + Plugin Architecture

## Context

The system must be extensible and support future integrations.

## Decision

Implement the runtime as:

    agent-core
        +
    plugin ecosystem

Example plugins:

-   agent-plugin-beads
-   agent-plugin-mulch
-   agent-plugin-session
-   agent-plugin-compression
-   agent-plugin-guardrails

## Rationale

-   modular architecture
-   easier upgrades
-   third‑party plugin ecosystem possible

------------------------------------------------------------------------

# Decision 4 --- Library + CLI Distribution

## Context

The system should work with:

-   CLI agents
-   VS Code extensions
-   custom runtimes

## Decision

Provide both:

    library API
    +
    CLI tool

Example:

    @agent/core
    agent CLI

## Rationale

-   programmatic integration
-   flexible tooling
-   easier automation

------------------------------------------------------------------------

# Decision 5 --- Ephemeral Conversation Compression

## Context

Long AI conversations can exceed context window limits.

## Decision

Conversation compression should be:

    runtime only
    ephemeral

No repository files are created.

## Rationale

-   avoids repo noise
-   reduces token usage
-   improves runtime performance

------------------------------------------------------------------------

# Decision 6 --- Hybrid Hook Locations

Hooks should be discoverable in both:

    repo/.agent/hooks
    ~/.agent/hooks

Resolution order:

    repo hooks
    ↓
    global hooks

## Rationale

Allows:

-   project customization
-   reusable global automation

------------------------------------------------------------------------

# Decision 7 --- Controlled File Writes

Hooks may only write to:

    SESSION.md
    .mulch/mulch.jsonl

All other repository files are read‑only.

## Rationale

Prevents unsafe modifications by automated agents.

------------------------------------------------------------------------

# Decision 8 --- Nx Monorepo over Separate Repositories

## Context

The original `ECOSYSTEM_REPO_STRUCTURE.md` spec described each package
(`agent-core`, `agent-plugin-beads`, etc.) as its own separate GitHub
repository under a shared organisation. This was written before a build
tool was selected.

## Decision

Implement as a **single Nx monorepo** with all packages under `packages/`:

    coreai/
        packages/
            agent-types/
            agent-core/
            agent-plugin-beads/
            agent-plugin-mulch/
            agent-plugin-session/
            agent-plugin-compression/
            agent-plugin-guardrails/
            agent-stack-standard/
            skillshare/

Use `packages/` (not Nx's default `libs/`) to signal these are
**publishable npm packages**, not internal-only libraries.

## Rationale

-   shared tooling (ESLint, Jest, Prettier, TypeScript) configured once
-   atomic commits across packages
-   cross-package type-checking via TypeScript project references
-   Nx cache and task pipeline work across all packages together
-   `agent-types` (shared interfaces) is immediately available to all
    other packages without a publish/install cycle
-   easier to enforce conventions consistently

## What changes from the original spec

-   no separate repos; one repo at https://github.com/jwill9999/coreai
-   each package's internal `src/` structure is preserved as designed
-   the `apps/` folder is not used — all packages are libraries with
    optional CLI entry points, not standalone runnable applications

------------------------------------------------------------------------

# Decision 9 --- Pre-release Versioning Strategy

## Context

All packages in the monorepo are published to npm. Anyone cloning,
forking, or installing them needs to understand the project is in active
development and the API is not yet stable.

## Decision

Use **semver pre-release identifiers** throughout development:

| Stage | Version | Trigger |
|-------|---------|---------|
| Active alpha development | `0.x.0-alpha.0` | Now |
| Feature complete, stabilising | `0.x.0-beta.0` | All 9 epics done |
| Release candidate | `1.0.0-rc.0` | Tested + documented |
| Stable | `1.0.0` | Production ready |

All packages share the **same version in lockstep**. The minor version
(`0.x`) increments each time an epic is merged to `main`.

Starting version: **`0.1.0-alpha.0`** (set at start of Epic 2).

## Rationale

-   `major: 0` — semver spec signals unstable/breaking API changes allowed
-   `-alpha` — pre-release tag makes incomplete state explicit to any
    consumer
-   lockstep versioning — avoids compatibility matrix complexity across
    tightly coupled packages
-   minor-per-epic — gives meaningful progression visible in release history

------------------------------------------------------------------------

# Future Evolution

Possible future layers:

-   vector knowledge memory
-   multi‑agent orchestration
-   distributed task execution

This document should be updated whenever a major design decision
changes.
