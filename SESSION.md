# Session Context

## Current Objective

Build the coreai agent ecosystem — a layered AI-assisted engineering workflow platform — as an Nx monorepo with 8 publishable packages.

## Active Task

**Epic 3 — `@coreai/agent-plugin-beads`** — all tasks complete, PRs open awaiting human review.

- PR #8: `feat/e3-t1-beads-adapter` → epic branch (CI ✅, awaiting review)
- PR #9: `feat/e3-t4-unit-tests` → epic branch (CI ✅ build/test/lint, 1 SonarCloud Security Hotspot — needs manual review in SonarCloud UI)

Next: human reviews and merges PRs #8 and #9, then run full suite on epic branch and open epic PR to `main`.

## Progress Since Last Session

- ✅ **Epic 2 merged to `main`** — PR #3 merged, all CI green (88% coverage)
- ✅ **CHANGELOG.md** generated with `git-cliff`
- ✅ **Version bump** — all packages → `0.2.0-alpha.0`
- ✅ **Husky git hooks** — pre-commit (lint-staged), pre-push (nx affected)
- ✅ **Badge fixes** — Codecov badge corrected; duplicate `codeql.yml` removed; badge now points to GitHub-native CodeQL scanning
- ✅ **SonarCloud hotspots** addressed: pinned GitHub Actions to commit SHAs, path validation added to hook-runner, `/tmp` hardcode removed from spec
- ✅ **Sourcery fix** — `compressionTriggered` renamed to `compressionApplied`
- ✅ **58 unit tests** passing (57 → 58 after additional security test)
- ✅ **Epic 3 (E3-T1 → E3-T4)** — `@coreai/agent-plugin-beads` fully implemented (27 tests)

## Decisions Made

- Nx monorepo — always prefer `npx nx add @nx/<plugin>` over manual config
- TypeScript: `module: nodenext`, strict mode, `.js` extensions in imports
- `tsconfig.spec.json` must set `"customConditions": null` (avoids TS5098 with Jest/node10)
- Node 24 via nvm; ESLint 8 using legacy `.eslintrc.*` format
- Do NOT fork `bd` (Beads) or `mulch` — adapter plugins only
- Hooks may only write to `SESSION.md` and `.mulch/mulch.jsonl`
- Branching: task PR → human review → epic branch → local test → epic PR → main
- All packages versioned in lockstep; current version: `0.2.0-alpha.0`
- GitHub Actions CI active from Epic 2 (CI-T1 completed)
- Unit tests written at end of each epic, not per task
- Husky pre-commit (lint-staged) + pre-push (nx affected) for local quality gates
- Build intentionally CI-only (too slow for local hooks)
- SonarCloud automatic analysis mode — coverage via Codecov only
- CodeQL via GitHub-native Settings (not codeql.yml workflow file)
- **lint-staged**: `.mjs` files get prettier-only (no ESLint) to avoid "File ignored by default" warnings
- **`tsconfig.spec.json` with relative imports**: must include `src/**/*.ts` AND `references: [{path: './tsconfig.lib.json'}]` — see agent-plugin-beads as pattern
- **`promisify(execFile)` + Jest mocks**: don't use — loses `util.promisify.custom` symbol; use manual Promise wrapper instead

## Open Issues

- **SonarCloud Security Hotspot** on PR #9: `typescript:S4036` — "Searching OS commands in PATH is security-sensitive" on `execFile('bd', ...)` in `beadsAdapter.ts`. This is expected for a CLI wrapper. **Action required**: log into SonarCloud and mark as "Safe" or "Acknowledged" with justification: _"Plugin is designed specifically to call the `bd` CLI. Uses execFile (not exec), command is hardcoded, PATH lookup is intentional for a developer tool plugin."_

## Next Steps

1. **Review SonarCloud hotspot** for PR #9: mark `typescript:S4036` as "Safe" at https://sonarcloud.io/project/security_hotspots?id=jwill9999_coreai&pullRequest=9
2. **Review and merge PR #8** (`feat/e3-t1-beads-adapter` → epic branch)
3. **Review and merge PR #9** (`feat/e3-t4-unit-tests` → epic branch)
4. **Pre-merge local test** on epic branch: `npx nx run-many -t typecheck,lint,test,build --all`
5. **Open epic PR** to `main`: `git push -u origin feat/e3-agent-plugin-beads && gh pr create --base main --title "feat: Epic 3 — @coreai/agent-plugin-beads"`
6. After epic merges to `main`: generate CHANGELOG and bump to `0.3.0-alpha.0`
7. **Epic 4** — `@coreai/agent-plugin-mulch`

---

## Full Epic & Task Plan

Legend: ✅ done | ⬜ pending

### Epic 1 — Monorepo Foundation & Shared Types ✅

| ID    | Task                                                            | Status |
| ----- | --------------------------------------------------------------- | ------ |
| E1-T1 | Scaffold `@coreai/agent-types` — all shared TS interfaces/types | ✅     |
| E1-T2 | Configure Nx targets and Prettier across all packages           | ✅     |

### Epic 2 — `@coreai/agent-core` ✅

Runtime orchestration: context builder, plugin loader, hook runner, CLI.
| ID | Task | Status |
|----|------|--------|
| E2-T1 | Context builder — assembles prompt in injection order; triggers compression at 30–40 messages | ✅ |
| E2-T2 | Plugin loader — loads plugins from config, calls all lifecycle hooks | ✅ |
| E2-T3 | Hook runner — resolves `repo/.agent/hooks/` then `~/.agent/hooks/`; enforces write permissions; first-run prompt → `.agent/config.json` | ✅ |
| E2-T4 | CLI — `agent start`, `agent end`, `agent task start <id>` using `commander` | ✅ |
| E2-T5 | Unit tests for context builder, plugin loader, hook runner, CLI (57 tests) | ✅ |

### Epic 3 — `@coreai/agent-plugin-beads` ✅ (PRs open, awaiting merge)

Wraps `bd` CLI to inject Beads task context.
| ID | Task | Status |
|----|------|--------|
| E3-T1 | `beadsAdapter.ts` — calls `bd show <task-id>`, parses into `BeadsTask` | ✅ |
| E3-T2 | `hooks.ts` — `onTaskStart` injects task metadata + spec path | ✅ |
| E3-T3 | `contextLoader.ts` — loads spec file content from task metadata | ✅ |
| E3-T4 | Unit tests with mocked `bd` CLI output | ✅ |

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

### CI/CD — GitHub Actions ✅

| ID    | Task                                                                                                                 | Status |
| ----- | -------------------------------------------------------------------------------------------------------------------- | ------ |
| CI-T1 | GitHub Actions CI workflow — format, typecheck, lint, test+coverage (Codecov), build on every PR + Husky local hooks | ✅     |

---

## Build Order

```
E1 ✅ → E2 ✅ → E3, E4, E5, E6, E7 (parallel) → E8
E9 (independent, can run in parallel with any epic)
CI-T1 ✅
```

## Quality Gates Per PR (current)

| Gate                                    | Tool                    | Status    |
| --------------------------------------- | ----------------------- | --------- |
| typecheck, lint, test, build            | Nx (local, before push) | ✅ manual |
| Pre-commit format + lint                | Husky + lint-staged     | ✅ active |
| Pre-push typecheck + test               | Husky + nx affected     | ✅ active |
| CI format, typecheck, lint, test, build | GitHub Actions          | ✅ active |
| Coverage reporting                      | Codecov                 | ✅ active |
| Automated code review                   | Sourcery AI             | ✅ active |
| Security analysis                       | CodeQL                  | ✅ active |
| Static analysis                         | SonarCloud              | ✅ active |

## References

- Architecture specs: `docs/specs/agent_architecture_documentation_pack/`
- Copilot instructions: `.github/copilot-instructions.md`
- Repo: https://github.com/jwill9999/coreai
