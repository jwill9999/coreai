# Session Context

## Current Objective
Build the coreai agent ecosystem — a layered AI-assisted engineering workflow platform — as an Nx monorepo with 8 publishable packages.

## Active Task
**Epic 2 — `@coreai/agent-core`** (in progress)
- ✅ E2-T1 complete — context builder merged into `feat/e2-agent-core`
- ✅ E2-T2 complete — plugin loader pushed to `feat/e2-t2-plugin-loader`, awaiting PR review
- ⬜ E2-T3 next — hook runner (after E2-T2 PR reviewed and merged)

## Progress Since Last Session
- ✅ **Epic 1 complete** — `@coreai/agent-types` scaffolded and pushed to GitHub
- ✅ Nx plugin tooling configured: `@nx/eslint`, `@nx/jest`, `@nx/js` (all targets inferred)
- ✅ Node 24 / nvm pinned in `.nvmrc`
- ✅ All quality checks passing: `typecheck` ✅ `lint` ✅ `test` ✅ `format:check` ✅
- ✅ Repo live at https://github.com/jwill9999/coreai (`main`)
- ✅ Branching strategy: epic branches + task sub-branches + human PR review before merge
- ✅ `git-cliff` + `cliff.toml` configured for changelog generation on merge to main
- ✅ Versioning: `0.1.0-alpha.0` lockstep, minor bump per epic
- ✅ ADR-8 (monorepo structure) and ADR-9 (versioning) committed
- ✅ SonarCloud + Sourcery AI + CodeQL active on all PRs
- ✅ CI-T1 task added: GitHub Actions workflow deferred until after Epic 3
- ✅ E2-T1 — context builder (`buildContext`, `shouldCompress`, `getMessagesToCompress`)
  - Sourcery fix applied: `compressionTriggered` derived from `compressionSummaries.length`
  - Merged into `feat/e2-agent-core` ✅
- ✅ E2-T2 — plugin loader (`PluginLoader` class, all 4 lifecycle hook runners)
  - PR open: `feat/e2-t2-plugin-loader` → `feat/e2-agent-core` ⏳

## Decisions Made
- Nx monorepo — always prefer `npx nx add @nx/<plugin>` over manual config
- TypeScript: `module: nodenext`, strict mode, `.js` extensions in imports
- `tsconfig.spec.json` must set `"customConditions": null` (avoids TS5098 with Jest/node10)
- Node 24 via nvm; ESLint 8 using legacy `.eslintrc.*` format
- Do NOT fork `bd` (Beads) or `mulch` — adapter plugins only
- Hooks may only write to `SESSION.md` and `.mulch/mulch.jsonl`
- Branching: task PR → human review → epic branch → local test → epic PR → main
- All packages versioned in lockstep at `0.1.0-alpha.0`
- GitHub Actions CI deferred until after Epic 3 (SonarCloud covers PRs until then)
- Unit tests written at end of each epic (E2-T5), not per task

## Open Issues
- E2-T2 PR under human review — **check at start of next session** whether `feat/e2-t2-plugin-loader` has been merged into `feat/e2-agent-core` before starting E2-T3

## Next Steps
1. Human reviews and merges PR `feat/e2-t2-plugin-loader` → `feat/e2-agent-core`
2. Create `feat/e2-t3-hook-runner` from updated epic branch
3. Implement E2-T3 — hook runner (resolves `repo/.agent/hooks/` then `~/.agent/hooks/`, enforces write permissions, first-run permission prompt → `.agent/config.json`)

---

## Full Epic & Task Plan

Legend: ✅ done | ⬜ pending

### Epic 1 — Monorepo Foundation & Shared Types ✅
| ID | Task | Status |
|----|------|--------|
| E1-T1 | Scaffold `@coreai/agent-types` — all shared TS interfaces/types | ✅ |
| E1-T2 | Configure Nx targets and Prettier across all packages | ✅ |

### Epic 2 — `@coreai/agent-core` ⬜
Runtime orchestration: context builder, plugin loader, hook runner, CLI.
| ID | Task | Status |
|----|------|--------|
| E2-T1 | Context builder — assembles prompt in injection order; triggers compression at 30–40 messages | ✅ |
| E2-T2 | Plugin loader — loads plugins from config, calls all lifecycle hooks | ⏳ PR review |
| E2-T3 | Hook runner — resolves `repo/.agent/hooks/` then `~/.agent/hooks/`; enforces write permissions; first-run prompt → `.agent/config.json` | ⬜ |
| E2-T4 | CLI — `agent start`, `agent end`, `agent task start <id>` using `commander` | ⬜ |
| E2-T5 | Unit tests for context builder and plugin loader | ⬜ |

### Epic 3 — `@coreai/agent-plugin-beads` ⬜
Wraps `bd` CLI to inject Beads task context.
| ID | Task | Status |
|----|------|--------|
| E3-T1 | `beadsAdapter.ts` — calls `bd show <task-id>`, parses into `BeadsTask` | ⬜ |
| E3-T2 | `hooks.ts` — `onTaskStart` injects task metadata + spec path | ⬜ |
| E3-T3 | `contextLoader.ts` — loads spec file content from task metadata | ⬜ |
| E3-T4 | Unit tests with mocked `bd` CLI output | ⬜ |

### Epic 4 — `@coreai/agent-plugin-mulch` ⬜
Wraps `mulch` CLI to surface experience lessons.
| ID | Task | Status |
|----|------|--------|
| E4-T1 | `mulchAdapter.ts` — calls `mulch search <topic>`, parses JSONL | ⬜ |
| E4-T2 | `hooks.ts` — `onSessionStart` searches mulch for relevant topics | ⬜ |
| E4-T3 | `lessonWriter.ts` — calls `mulch add` to persist new lessons at session end | ⬜ |
| E4-T4 | Unit tests with mocked `mulch` CLI | ⬜ |

### Epic 5 — `@coreai/agent-plugin-session` ⬜
Manages `SESSION.md` lifecycle.
| ID | Task | Status |
|----|------|--------|
| E5-T1 | `sessionReader.ts` — reads and parses `SESSION.md` from repo root | ⬜ |
| E5-T2 | `sessionWriter.ts` — writes structured `SESSION.md`; validates under 500 words | ⬜ |
| E5-T3 | `hooks.ts` — `onSessionStart` (load), `onSessionEnd` (write) | ⬜ |
| E5-T4 | Unit tests | ⬜ |

### Epic 6 — `@coreai/agent-plugin-compression` ⬜
Ephemeral conversation compression — no file writes ever.
| ID | Task | Status |
|----|------|--------|
| E6-T1 | `segmenter.ts` — groups messages into logical topic segments | ⬜ |
| E6-T2 | `compressor.ts` — summarises older segments into `CompressionSummary` (100–200 words each) | ⬜ |
| E6-T3 | `hooks.ts` — `onConversationThreshold`: compress and replace older messages | ⬜ |
| E6-T4 | Unit tests for segmentation and compression logic | ⬜ |

### Epic 7 — `@coreai/agent-plugin-guardrails` ⬜
Validation pipeline triggered when a task enters `review`.
| ID | Task | Status |
|----|------|--------|
| E7-T1 | `pipeline.ts` — format → lint → typecheck → unit tests → integration tests | ⬜ |
| E7-T2 | `checkers/` — individual checker modules (Prettier, ESLint, tsc, test runner) | ⬜ |
| E7-T3 | `hooks.ts` — `onTaskStart`: detects `review` status, runs pipeline | ⬜ |
| E7-T4 | Task state transitions: pass → `done`; fail → `in_progress` via Beads | ⬜ |
| E7-T5 | Unit tests | ⬜ |

### Epic 8 — `@coreai/agent-stack-standard` ⬜
Convenience bundle — installs all plugins + agent-core.
| ID | Task | Status |
|----|------|--------|
| E8-T1 | Package with peer deps on all 5 plugins + agent-core | ⬜ |
| E8-T2 | `agent-stack-standard init` — default config generator | ⬜ |
| E8-T3 | README and usage documentation | ⬜ |

### Epic 9 — `@coreai/skillshare` ⬜
Standalone manifest-driven skills/instructions sync CLI (independent of other epics).
| ID | Task | Status |
|----|------|--------|
| E9-T1 | CLI entrypoint — `init`, `sync`, optional `pull` using `commander` | ⬜ |
| E9-T2 | `manifest.ts` — load/validate `skills-config.json` (`localSkills`, `centralRepo`, `syncBranch`) | ⬜ |
| E9-T3 | `loader.ts` — `resolveSkill()`: local dir first, fallback to synced central repo | ⬜ |
| E9-T4 | `commands/init.ts` — interactive prompt via `inquirer` to scaffold manifest | ⬜ |
| E9-T5 | `commands/sync.ts` — clone/pull via `simple-git`, copy changes, commit+push; direct push or PR; graceful auth/error handling | ⬜ |
| E9-T6 | `commands/pull.ts` — (optional) pull updates from central repo | ⬜ |
| E9-T7 | `/templates/skills-config.json` — editable manifest template | ⬜ |
| E9-T8 | README — manifest structure, CLI usage, search order, hook/CI scripting | ⬜ |
| E9-T9 | Unit tests | ⬜ |

---

### CI/CD — GitHub Actions ⬜
| ID | Task | Status |
|----|------|--------|
| CI-T1 | GitHub Actions CI workflow — `nx affected` (typecheck, lint, test, build) on every PR + integration tests post-Epic 3 | ⬜ |

---

## Build Order
```
E1 ✅ → E2 ⬜ → E3, E4, E5, E6, E7 (parallel) → E8
E9 (independent, can run in parallel with any epic)
CI-T1 (after E3 merges — adds GitHub Actions + integration tests)
```

## Quality Gates Per PR (current)
| Gate | Tool | Status |
|------|------|--------|
| typecheck, lint, test, build | Nx (local, before push) | ✅ manual |
| Automated code review | Sourcery AI | ✅ active |
| Security analysis | CodeQL | ✅ active |
| Static analysis + coverage | SonarCloud | ✅ active |
| GitHub Actions CI | Nx affected on every PR | ⬜ CI-T1 (post-E3) |

## References
- Architecture specs: `docs/specs/agent_architecture_documentation_pack/`
- Copilot instructions: `.github/copilot-instructions.md`
- Repo: https://github.com/jwill9999/coreai
