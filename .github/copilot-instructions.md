# Copilot Instructions — coreai

## Project Overview

This is an **Nx monorepo** (`@coreai/source`) that houses the **agent ecosystem** — a layered architecture for AI-assisted engineering workflows. Packages live in `packages/`.

The system separates concerns across 7 layers:

| Layer | Name | Persistence |
|-------|------|-------------|
| 1 | Beads — execution / task graph | persistent |
| 2 | Mulch — experience / lessons learned | persistent |
| 3 | Skills / instruction knowledge | persistent |
| 4 | Conversation compression | **ephemeral** (runtime only) |
| 5 | Session continuity (`SESSION.md`) | persistent |
| 6 | Context injection hooks | persistent |
| 7 | Guardrails & quality gates | runtime |

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
  name: string
  onSessionStart?(context: AgentContext): Promise<void>
  onTaskStart?(context: AgentContext): Promise<void>
  onConversationThreshold?(context: AgentContext): Promise<void>
  onSessionEnd?(context: AgentContext): Promise<void>
}
```

## Key Conventions

### Node.js & Package Manager
- **Node 24** is required. The project uses **nvm** — run `nvm use` in the repo root to activate the correct version (pinned in `.nvmrc`).
- Package manager: **npm** workspaces.

### TypeScript
- `module: nodenext`, `moduleResolution: nodenext` — use `.js` extensions in imports even for `.ts` source files
- `strict: true`, `noUnusedLocals: true`, `noImplicitReturns: true`
- `target: es2022`, `lib: ["es2022"]`
- Custom condition: `@coreai/source` (see `tsconfig.base.json`)

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
- Generate a new publishable library: `npx nx g @nx/js:lib packages/<name> --publishable --importPath=@coreai/<name>`
- Add a new Nx plugin: `npx nx add @nx/<plugin>`

When generating a new package, apply Jest and ESLint config using the same pattern as `packages/agent-types`:
- `jest.config.cts` with `passWithNoTests: true` and `preset: '../../jest.preset.js'`
- `.eslintrc.json` extending `../../.eslintrc.js`
- `tsconfig.spec.json` must set `"customConditions": null` when using `moduleResolution: node10` (Jest/CommonJS) to avoid TS5098 conflict with the base config

### Controlled File Writes
Hooks and agents may only write to:
- `SESSION.md` (session continuity)
- `.mulch/mulch.jsonl` (experience lessons)

All other repository files are **read-only** from agent/hook context.

### Hook Resolution Order
```
repo/.agent/hooks/   ← project-specific (takes priority)
~/.agent/hooks/      ← global reusable hooks
```

### Mulch Experience Format
Lessons are stored in JSONL. Required fields: `id`, `topic`, `summary`, `recommendation`, `created`.
- Project lessons: `.mulch/mulch.jsonl`
- Global lessons: `~/.mulch/mulch.jsonl`
- Query order: project mulch → global mulch

### SESSION.md
`SESSION.md` is the **primary session handoff document** at the repo root. It must be kept up to date so any new agent session can resume without needing conversation history.

#### When to update SESSION.md
Update and commit `SESSION.md` at **every one of these checkpoints** — do not wait to be asked:

1. **After completing an epic or task** — mark it done in the task table
2. **Before the user takes a break** — any message indicating they are stepping away
3. **After every commit to main** — keep the active task and next steps current
4. **When explicitly asked** — user says "update session" or similar

#### What SESSION.md must always contain
- Current Objective
- Active Task (epic/task ID currently in progress)
- Progress Since Last Session (what was completed)
- Decisions Made (key technical decisions)
- Open Issues (blockers or unknowns)
- Next Steps (the exact next task ID and what to do)
- Full epic and task table with ✅ / ⬜ status for every task

#### After updating SESSION.md always
```bash
git add SESSION.md && git commit -m "chore: update SESSION.md" && git push
```

> **Note:** Epic 5 (`agent-plugin-session`) and Epic 6 (context injection hooks) will automate this once built. Until then it is a manual checkpoint.

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

Feature and backlog tracking lives in `docs/planning/`:
- `index.md` — active features
- `backlog.md` — backlog items

Use the planning skill (`/.github/skills/planning/SKILL.md`) with slash commands: `/new-feature`, `/add-subtask`, `/update-status`, `/close-feature`, `/new-backlog`, `/move-to-feature`.

Feature IDs follow the pattern: `feature-YYYY-MM-DD-NNN`. Dates use GMT (UK time).

## Guardrails Pipeline

Tasks follow: `todo → in_progress → review → done`.

On entering **review**, the validation pipeline runs:
1. Formatting (Prettier)
2. Linting (ESLint)
3. Type checking
4. Unit tests
5. Integration tests
6. Agent review

If any step fails: fix issues → rerun pipeline.

## Specs

Architecture specification documents are in `docs/specs/agent_architecture_documentation_pack/`. Do not confuse specification docs with runtime artifacts (`SESSION.md`, `mulch.jsonl`).

## Related Projects

- `../plans/skillshare/skillshare-agent-plan.md` — plan for a standalone `skillshare` NPM package (manifest-driven skills/instructions sync CLI). Uses `commander`, `simple-git`, manifest file `skills-config.json`, commands: `init`, `sync`, optional `pull`.
