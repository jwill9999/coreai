# Session Context

## Current Objective

Land PR #18 cleanly, then begin Epic 5 (`agent-plugin-session`) while preserving the current 0.4.0-alpha.0 lockstep baseline.

## Active Task

**PR #18 hardening and documentation sync for `coreai-f7m` on `feat/mulch-ml-prime-refactor`.**

Latest relevant commits:

- `ddefcf9` — `fix(agent-plugin-mulch): address Sourcery PR feedback`
- `2fbd0ab` — `docs(agent-plugin-mulch): sync docs and review follow-ups`
- `c087fd2` — docs follow-up commit on current branch

Epic 4 implementation is complete; current work is PR closure polish + handoff quality.

## Progress Since Last Session

- ✅ **`coreai-f7m` implemented** — mulch adapter replaced with `ml` bridge (`resolveMlExecutable`, `assertMlRunnable`, `runMlInit`, `runMlPrime`, `queryMulch`).
- ✅ **Lifecycle simplified** — `ensureMlReady()` added; plugin is read-only at lifecycle level (`onSessionStart` only, no `onSessionEnd`).
- ✅ **Sourcery feedback addressed** — added/updated tests for non-ENOENT access failures, `ml prime` failure propagation, and timeout assertion coverage.
- ✅ **Sonar lint follow-up fixed** — resolved `typescript:S7735` style issue in `mulchAdapter.ts` using nullish-coalescing string conversion.
- ✅ **Docs audit + sync completed** — global README and docs were updated for link consistency, version consistency, and E4 as-built behavior.
- ✅ **Planning and spec wording normalized** — `docs/planning/*` and `docs/specs/e4-agent-plugin-mulch.md` aligned with actual implementation.

## Decisions Made

- Nx monorepo — always prefer `npx nx add @nx/<plugin>` over manual config
- TypeScript: `module: nodenext`, strict mode, `.js` extensions in imports
- `tsconfig.spec.json` must set `"customConditions": null` (avoids TS5098 with Jest/node10)
- Node 24 via nvm; ESLint 8 using legacy `.eslintrc.*` format
- Do NOT fork `bd` (Beads) or `mulch` — adapter plugins only
- Hooks may write to `SESSION.md`, canonical upstream `.mulch/expertise/`, and legacy `.mulch/mulch.jsonl`; agents stage lessons to `.mulch/candidates.jsonl` for human review
- Branching: task PR → human review → epic branch → local test → epic PR → main
- All packages versioned in lockstep; current version: `0.4.0-alpha.0`
- GitHub Actions CI active from Epic 2 (CI-T1 completed)
- Unit tests written at end of each epic, not per task
- Husky pre-commit (lint-staged) + pre-push (nx affected) for local quality gates
- Build intentionally CI-only (too slow for local hooks)
- SonarCloud automatic analysis mode — coverage via Codecov only
- CodeQL via GitHub-native Settings (not codeql.yml workflow file)
- **lint-staged**: `.mjs` files get prettier-only (no ESLint) to avoid "File ignored by default" warnings
- **`tsconfig.spec.json` with relative imports**: must include `src/**/*.ts` AND `references: [{path: './tsconfig.lib.json'}]` — see agent-plugin-beads as pattern
- **`promisify(execFile)` + Jest mocks**: don't use — loses `util.promisify.custom` symbol; use manual Promise wrapper instead
- **PR feedback loop**: before the final push, rerun local IDE diagnostics and targeted Nx checks so Sonar/Sourcery regressions are caught before a new commit; after the push, resolve the corresponding GitHub thread only once the rerun feedback is clean
- **`MulchLesson.type`** maps to `ml record --type`; **`classification`** to `ml record --classification`; **`tags`** is free-form `string[]` matching `ml record --tag`
- **Research rule**: always read local skill docs, project markdown, and web sources before assuming upstream package capabilities

## Open Issues

- **Pre-publish: pin `"*"` inter-package deps** — `@conscius/agent-core` and `@conscius/agent-plugin-beads` both declare `"@conscius/agent-types": "*"`. Safe inside the npm workspace but must be pinned to `"^x.x.x"` before first `npm publish`. Also apply to `agent-stack-standard` when created.

- **🚨 Codecov "Missing Head Report" — unresolved, on hold** — Codecov shows no coverage on every main commit. Attempts so far: `workflow_dispatch` trigger, `codecov.yml` carryforward, `--skip-nx-cache`, YAML path fix, removed empty `agent-types` lcov, added `sed` to prefix `SF:` paths. None resolved it. **Resume with the diagnostic PR-branch probe:** create a short-lived branch, push, open a PR, and check if Codecov picks up the report. If yes → problem is main-specific (the `[skip ci]` changelog bot commit always landing on HEAD with no coverage). If no → a config regression was introduced and a before/after comparison is needed.

- **Re-evaluate `agent-plugin-beads` dependency approach after `coreai-f7m`** — The mulch plugin refactor bundles `@os-eco/mulch-cli` as a package dependency to eliminate a separate global install step for users. Once `coreai-f7m` lands, review whether `agent-plugin-beads` should adopt the same pattern (bundling the `bd` CLI as a dependency rather than requiring a separate global install). Goal: minimize manual setup steps and improve onboarding UX, especially for non-developer users.

## Next Steps

1. **Close PR #18 loop**

- Confirm CI/quality gates are green.
- Resolve remaining PR review threads once checks are clean.

2. **Start Epic 5 (`coreai-vq3`)**

- Branch: `feat/e5-agent-plugin-session`
- Claim task in Beads and scaffold `sessionReader`, `sessionWriter`, hooks, and tests.

3. **Resume Codecov probe later**

- Keep the existing diagnostic PR-branch probe plan; this remains independent of Epic 5.

---

## Full Epic & Task Plan

Legend: ✅ done | ⬜ pending

### Epic 1 — Monorepo Foundation & Shared Types ✅

| ID    | Task                                                              | Status |
| ----- | ----------------------------------------------------------------- | ------ |
| E1-T1 | Scaffold `@conscius/agent-types` — all shared TS interfaces/types | ✅     |
| E1-T2 | Configure Nx targets and Prettier across all packages             | ✅     |

### Epic 2 — `@conscius/agent-core` ✅

Runtime orchestration: context builder, plugin loader, hook runner, CLI.
| ID | Task | Status |
|----|------|--------|
| E2-T1 | Context builder — assembles prompt in injection order; triggers compression at 30–40 messages | ✅ |
| E2-T2 | Plugin loader — loads plugins from config, calls all lifecycle hooks | ✅ |
| E2-T3 | Hook runner — resolves `repo/.agent/hooks/` then `~/.agent/hooks/`; enforces write permissions; first-run prompt → `.agent/config.json` | ✅ |
| E2-T4 | CLI — `conscius start`, `conscius end`, `conscius task start <id>` using `commander` | ✅ |
| E2-T5 | Unit tests for context builder, plugin loader, hook runner, CLI (57 tests) | ✅ |

### Epic 3 — `@conscius/agent-plugin-beads` ✅

Wraps `bd` CLI to inject Beads task context.
| ID | Task | Status |
|----|------|--------|
| E3-T1 | `beadsAdapter.ts` — calls `bd show <task-id>`, parses into `BeadsTask` | ✅ |
| E3-T2 | `hooks.ts` — `onTaskStart` injects task metadata + spec path | ✅ |
| E3-T3 | `contextLoader.ts` — loads spec file content from task metadata | ✅ |
| E3-T4 | Unit tests with mocked `bd` CLI output | ✅ |

### Epic 4 — `@conscius/agent-plugin-mulch` ✅

Read-only Mulch integration: injects `ml prime` output at session start; no lifecycle persistence on `onSessionEnd`.
| ID | Task | Status |
|----|------|--------|
| E4-T1 | `mulchAdapter.ts` — `ml` bridge (`resolve`, `validate`, `init`, `prime`, `queryMulch`) | ✅ |
| E4-T2 | `hooks.ts` — `ensureMlReady` + `onSessionStart` prompt injection | ✅ |
| E4-T3 | `lessonWriter.ts` — explicit helper retained; lifecycle remains read-only | ✅ |
| E4-T4 | Unit tests including `ml prime` failure propagation and timeout coverage | ✅ |

### Epic 5 — `@conscius/agent-plugin-session` ⬜

Manages `SESSION.md` lifecycle.
| ID | Task | Status |
|----|------|--------|
| E5-T1 | `sessionReader.ts` — reads and parses `SESSION.md` from repo root | ⬜ |
| E5-T2 | `sessionWriter.ts` — writes structured `SESSION.md`; validates under 500 words | ⬜ |
| E5-T3 | `hooks.ts` — `onSessionStart` (load), `onSessionEnd` (write) | ⬜ |
| E5-T4 | Unit tests | ⬜ |

### Epic 6 — `@conscius/agent-plugin-compression` ⬜

Ephemeral conversation compression — no file writes ever.
| ID | Task | Status |
|----|------|--------|
| E6-T1 | `segmenter.ts` — groups messages into logical topic segments | ⬜ |
| E6-T2 | `compressor.ts` — summarises older segments into `CompressionSummary` (100–200 words each) | ⬜ |
| E6-T3 | `hooks.ts` — `onConversationThreshold`: compress and replace older messages | ⬜ |
| E6-T4 | Unit tests for segmentation and compression logic | ⬜ |

### Epic 7 — `@conscius/agent-plugin-guardrails` ⬜

Validation pipeline triggered when a task enters `review`.
| ID | Task | Status |
|----|------|--------|
| E7-T1 | `pipeline.ts` — format → lint → typecheck → unit tests → integration tests | ⬜ |
| E7-T2 | `checkers/` — individual checker modules (Prettier, ESLint, tsc, test runner) | ⬜ |
| E7-T3 | `hooks.ts` — `onTaskStart`: detects `review` status, runs pipeline | ⬜ |
| E7-T4 | Task state transitions: pass → `done`; fail → `in_progress` via Beads | ⬜ |
| E7-T5 | Unit tests | ⬜ |

### Epic 8 — `@conscius/agent-stack-standard` ⬜

Convenience bundle — installs all plugins + agent-core.
| ID | Task | Status |
|----|------|--------|
| E8-T1 | Package with peer deps on all 5 plugins + agent-core | ⬜ |
| E8-T2 | `agent-stack-standard init` — default config generator | ⬜ |
| E8-T3 | README and usage documentation | ⬜ |

### Epic 9 — `@conscius/skillshare` ⬜

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

- Architecture specs archive: `docs/specs/archive/`
- Copilot instructions: `.github/copilot-instructions.md`
- Repo: https://github.com/jwill9999/conscius
