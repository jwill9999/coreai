# Copilot Instructions — conscius

## Project Overview

This is an **Nx monorepo** (`@conscius/source`) that houses the **agent ecosystem** — a layered architecture for AI-assisted engineering workflows. Packages live in `packages/`.

The system separates concerns across 7 layers:

| Layer | Name                                 | Persistence                  |
| ----- | ------------------------------------ | ---------------------------- |
| 1     | Beads — execution / task graph       | persistent                   |
| 2     | Mulch — experience / lessons learned | persistent                   |
| 3     | Skills / instruction knowledge       | persistent                   |
| 4     | Conversation compression             | **ephemeral** (runtime only) |
| 5     | Session continuity (`SESSION.md`)    | persistent                   |
| 6     | Context injection hooks              | persistent                   |
| 7     | Guardrails & quality gates           | runtime                      |

## Ecosystem Package Structure

The target architecture is a `agent-core` + plugin model:

```
agent-core              # runtime: context-builder, hook-runner, plugin-loader, CLI
agent-plugin-beads      # wraps `bd` CLI — injects task metadata
agent-plugin-mulch      # wraps `mulch` CLI — injects experience lessons
agent-plugin-session    # manages SESSION.md read/write
agent-plugin-compression# ephemeral conversation compression
agent-plugin-guardrails # validation pipeline: format → lint → typecheck → test
agent-stack-standard    # bundle that installs all common plugins
```

Plugin interface (TypeScript):

```ts
export interface AgentPlugin {
  name: string;
  onSessionStart?(context: AgentContext): Promise<void>;
  onTaskStart?(context: AgentContext): Promise<void>;
  onConversationThreshold?(context: AgentContext): Promise<void>;
  onSessionEnd?(context: AgentContext): Promise<void>;
}
```

## Branching Strategy

All work from **Epic 2 onwards** follows this Git workflow. Epic 1 was pushed directly to `main` during initial scaffolding — that is the only exception.

### Branch Structure

```
main
└── feat/e{N}-{epic-name}          ← epic branch (opened as PR → main)
    ├── feat/e{N}-t{M}-{task-name} ← task sub-branch (merged into epic branch)
    └── feat/e{N}-t{M}-{task-name}
```

**Examples:**

- Epic branch: `feat/e2-agent-core`
- Task sub-branch: `feat/e2-t1-context-builder`, `feat/e2-t2-plugin-loader`

### Workflow (follow this for every epic)

> Full step-by-step workflow is in the **`git-workflow` skill** — load it when starting/completing an epic or task.

### Commit Message Format (Conventional Commits)

All commits must follow this format — it drives the auto-generated changelog:

```
<type>(scope): short description

Types: feat | fix | docs | chore | refactor | test | ci
Scope: epic/task ID or package name, e.g. e2-t1, agent-core
```

### Changelog

- `CHANGELOG.md` lives at the repo root
- Generated automatically with **`git-cliff`** on every merge to `main`
- Never edited manually

> **Note:** `git-cliff` is installed globally via brew. `cliff.toml` is at the repo root.

### Code Quality & CI Tools

| Tool                                          | Purpose                                                         | Runs on                   |
| --------------------------------------------- | --------------------------------------------------------------- | ------------------------- |
| **Nx** (`typecheck`, `lint`, `test`, `build`) | Local quality gates                                             | Every task branch, pre-PR |
| **Sourcery AI**                               | Automated PR code review, architecture diagrams                 | Every PR (GitHub bot)     |
| **SonarCloud**                                | Static analysis, security hotspots, coverage gates, duplication | Every PR + main (cloud)   |

When SonarCloud flags issues on a PR:

- **Bugs / Vulnerabilities** — must be fixed before merge
- **Security Hotspots** — review and either fix or mark as reviewed with justification
- **Code Smells** — fix if straightforward; log as a follow-up task if complex
- **Coverage** — once E2-T5 unit tests are in place, coverage gates will apply

### Package Versioning

All packages in this monorepo are versioned **in lockstep** (same version across all packages).

| Stage                         | Version format  | When                        |
| ----------------------------- | --------------- | --------------------------- |
| Active development            | `0.x.0-alpha.0` | Now — all epics in progress |
| Feature complete, stabilising | `0.x.0-beta.0`  | All 9 epics done            |
| Release candidate             | `1.0.0-rc.0`    | Tested, docs complete       |
| Stable release                | `1.0.0`         | Production ready            |

**Minor version (`0.x`) increments per epic completed** — e.g. after Epic 2 merges to main, bump to `0.2.0-alpha.0`.

**Current version: `0.1.0-alpha.0`** — set when Epic 2 work began.

When bumping versions, update **all** `packages/*/package.json` files together. Use `nx release` when the full release workflow is configured.

## Key Conventions

### Node.js & Package Manager

- **Node 24** is required. The project uses **nvm** — run `nvm use` in the repo root to activate the correct version (pinned in `.nvmrc`).
- Package manager: **npm** workspaces.

### TypeScript

- `module: nodenext`, `moduleResolution: nodenext` — use `.js` extensions in imports even for `.ts` source files
- `strict: true`, `noUnusedLocals: true`, `noImplicitReturns: true`
- `target: es2022`, `lib: ["es2022"]`
- Custom condition: `@conscius/source` (see `tsconfig.base.json`)

### Nx Workspace

**Always prefer Nx first-party plugins over manual configuration.** Use `npx nx add <plugin>` to install and wire up plugins — they integrate with the Nx task graph, caching, and affected commands automatically.

Installed plugins and what they provide:

- `@nx/js` — `build`, `typecheck`, `build-deps`, `watch-deps` targets (inferred from `tsconfig.lib.json`)
- `@nx/eslint` — `lint` target (inferred from `.eslintrc.*` presence)
- `@nx/jest` — `test` target (inferred from `jest.config.*` presence)
- Nx core — `npx nx format:check` / `npx nx format:write` (Prettier, no plugin needed)

Common commands:

- Build: `npx nx build <project>`
- Typecheck: `npx nx typecheck <project>`
- Lint: `npx nx lint <project>`
- Test: `npx nx test <project>`
- Format check: `npx nx format:check`
- Format write: `npx nx format:write`
- Run all quality checks: `npx nx run-many -t typecheck,lint,test --projects=<project>`
- Run a single test file: `npx nx test <project> --testFile=src/lib/foo.spec.ts`
- Run affected only: `npx nx affected -t typecheck,lint,test`
- Sync TypeScript project references: `npx nx sync`
- Generate a new publishable library: `npx nx g @nx/js:lib packages/<name> --publishable --importPath=@conscius/<name>`
- Add a new Nx plugin: `npx nx add @nx/<plugin>`

When generating a new package, apply Jest and ESLint config using the same pattern as `packages/agent-types`:

- `jest.config.cts` with `passWithNoTests: true` and `preset: '../../jest.preset.js'`
- `.eslintrc.json` extending `../../.eslintrc.js`
- `tsconfig.spec.json` must set `"customConditions": null` when using `moduleResolution: node10` (Jest/CommonJS) to avoid TS5098 conflict with the base config

### Controlled File Writes

Hooks and agents may only write to:

- `SESSION.md` (session continuity)
- `.mulch/expertise/` (canonical upstream Mulch expertise storage)
- `.mulch/candidates.jsonl` (lesson staging — human reviews before promoting to `.mulch/mulch.jsonl`)

All other repository files are **read-only** from agent/hook context.

### Hook Resolution Order

```
repo/.agent/hooks/   ← project-specific (takes priority)
~/.agent/hooks/      ← global reusable hooks
```

### Mulch Experience Format

Lessons are stored in JSONL. Required fields: `id`, `topic`, `summary`, `recommendation`, `created`.

- Canonical upstream project lessons: `.mulch/expertise/<domain>.jsonl`
- Canonical upstream config: `.mulch/mulch.config.yaml`
- Legacy project lessons: `.mulch/mulch.jsonl`
- Query order: project mulch → global mulch

### SESSION.md and SUMMARY.md

> Full procedures are in the **`session` skill** — load it when updating the session handoff document or adding a compression summary segment.

### Context Injection Order (prompt assembly)

```
skills / instructions
SESSION.md
conversation compression summary
recent conversation messages
beads task context
specification file
```

## Planning Workflow

Feature and backlog tracking lives in `docs/planning/`. Use the **`planning` skill** with commands: `/new-epic`, `/new-feature`, `/add-task`, `/update-status`, `/close-feature`, `/new-backlog`, `/move-to-feature`, `/sync-beads`. Each action writes both markdown and a `bd` task graph entry. Feature IDs: `feature-YYYY-MM-DD-NNN` (GMT).

## Guardrails Pipeline

Tasks follow: `todo → in_progress → review → done`. Full validation pipeline steps are in the **`guardrails` skill** — load it when a task enters review or quality checks are needed.

## Specs

Architecture specification documents are in `docs/specs/agent_architecture_documentation_pack/`. Do not confuse specification docs with runtime artifacts (`SESSION.md`, `mulch.jsonl`).

## Related Projects

- `../plans/skillshare/skillshare-agent-plan.md` — plan for a standalone `skillshare` NPM package (manifest-driven skills/instructions sync CLI). Uses `commander`, `simple-git`, manifest file `skills-config.json`, commands: `init`, `sync`, optional `pull`.

## PR Review Workflow

> Full checklist (CI checks, SonarCloud, Sourcery, merge conflict resolution) is in the **`pr-review` skill** — load it when opening a PR, reviewing feedback, or checking if work is ready to merge.
