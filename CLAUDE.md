# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Conscius** is a plugin-based framework that gives AI agents persistent cognition — memory, session awareness, task context, and reusable skills. It's structured as an **Nx monorepo** with publishable packages under the `@conscius` scope.

**Agent skills:** Project skills live in `.github/skills/` and `.cursor/skills/`; keep them in sync when editing. See `AGENTS.md` (**Project agent skills**) for layout, canonical source, and how to interpret Copilot-oriented placeholders (`!`-prefixed shell snippets and `$ARGUMENTS`).

## Commands

### Development

```bash
# Install dependencies
npm install

# Run all quality checks across all packages
npx nx run-many -t typecheck,lint,test --all

# Run only affected packages (faster, for CI-style checks)
npx nx affected -t typecheck,lint,test

# Build a specific package
npx nx build @conscius/runtime

# Typecheck / lint / test a specific package
npx nx typecheck @conscius/runtime
npx nx lint @conscius/runtime
npx nx test @conscius/runtime
```

### Running Tests

```bash
# All packages
npx nx run-many -t test --all

# Single package
npx nx test agent-plugin-beads

# Single test file
npx jest packages/runtime/src/plugin-loader/plugin-loader.spec.ts

# Single test by name
npx jest packages/runtime/src/memory-pipeline.spec.ts --testNamePattern="buildPromptContext"

# Watch mode
npx jest --watch
```

### Publishing

```bash
# Before publishing: pin wildcard inter-package deps to semantic versions
# e.g., "@conscius/runtime": "*" → "@conscius/runtime": "^0.5.0-alpha.0"

npx nx run-many -t build        # Build all packages first
npx nx release version          # Bump versions (lockstep across all packages)
npx nx release publish          # Publish to npm
```

## Architecture

### 7-Layer Plugin System

```
Layer 1: Beads        — persistent task graph
Layer 2: Mulch        — experience/lessons learned (persistent)
Layer 3: Skills       — instruction knowledge (persistent)
Layer 4: Compression  — conversation compression (ephemeral)
Layer 5: Session      — continuity via SESSION.md
Layer 6: Hooks        — context injection hooks (persistent)
Layer 7: Guardrails   — quality gates (runtime)
```

Each layer is an independent plugin package orchestrated by **`@conscius/runtime`**.

### Plugin Lifecycle (v3)

Plugins are defined with **`definePlugin`** and optional hooks:

- `onSessionStart()` — Load baseline context
- `onTaskStart(context)` — Inject task metadata and spec
- `onMemoryCompose(context)` — Primary memory pipeline (every compose cycle)
- `onSessionEnd(context)` — Persist session state

Errors: single plugin errors re-thrown directly; multiple errors wrapped in `AggregateError`.

### Context / memory (v3)

Plugins add structured **`memorySegments`** (`system` | `instruction` | `context` | `experience`). The runtime sorts (priority DESC, then type order) and builds the final prompt via **`buildPromptContext`**. Plugins do not see **`promptSegments`**.

### Conversation Compression (Layer 4)

- Threshold: 30 messages (`shouldCompress`)
- Preserves last 10 messages (`RECENT_MESSAGES_TO_KEEP`, `getMessagesToCompress`)
- Compression summaries: `CompressionSummary` on `RuntimeContext`

### Hook System

- Repo-local: `.agent/hooks/{session-start,task-start,memory-compose,session-end}.{sh,js,mjs,cjs}`
- Global fallback: `~/.agent/hooks/`
- Security: path validation (hooks must be within approved directories)
- Injected env vars: `AGENT_REPO_ROOT`, `AGENT_ACTIVE_TASK_ID`, `AGENT_APPROVED_WRITES`

### Permission Guards (Layer 7)

- Default approved writes: `SESSION.md`, `.mulch/expertise/`, `.mulch/candidates.jsonl`
- Per-file approval tracking via `config.approvedWrites`
- First-run prompt saves to `.agent/config.json`

## Package Structure

```
packages/
├── runtime/               # @conscius/runtime — engine, types, hook runner, memory pipeline
├── cli/                   # @conscius/cli — conscius binary
├── agent-plugin-beads/    # Beads task context (bd show)
└── agent-plugin-mulch/    # Mulch experience (ml prime)
```

## Key Conventions

- **TypeScript:** strict mode, ESM (`"type": "module"`), `module: nodenext`, `.js` extensions in all imports
- **Node 24** via nvm (`.nvmrc`)
- **All packages versioned in lockstep** (currently `0.5.0-alpha.0`)
- **Do not mock `util.promisify`** — use manual Promise wrappers with Jest mocks (loses `util.promisify.custom` symbol)
- **`tsconfig.spec.json`** must include `src/**/*.ts` + `references: [{path: './tsconfig.lib.json'}]`
- **ESLint 8 legacy format** (`.eslintrc.js`, not `eslint.config.mjs`)
- **Prettier:** `singleQuote: true`
- **No forking dependencies** — use adapter plugins instead (Beads, Mulch pattern)
- **Unit tests** are written at epic end, not per task
- **Branching:** task PR → review → epic branch → test → epic PR → main

## External Libraries

Use the Context7 MCP to fetch up-to-date documentation for libraries instead of relying on training data:

1. Call `resolve-library-id` with the library name
2. Pick the best match
3. Call `query-docs` with the selected ID and question
