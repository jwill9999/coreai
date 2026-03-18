# Session Context

## Current Objective

Build the Conscius agent ecosystem — a layered AI-assisted engineering workflow platform — as an Nx monorepo with 8 publishable packages.

## Active Task

**Epic 5 — `@conscius/agent-plugin-session`** — next on the critical path. No branch created yet.

Epic 4 is fully complete and merged to `main`. Version bumped to `0.4.0-alpha.0`.

## Progress Since Last Session

- ✅ **Epic 4 PR #17 merged** — Sourcery review fixed: `never[]` → concrete types in `cli.ts`; static `access` import in `mulchAdapter.ts`; ISO 8601 regex in `lessonWriter.ts`
- ✅ **Version bumped to `0.4.0-alpha.0`** — all 4 packages updated in lockstep
- ✅ **All Beads tasks closed for Epics 1–4** — confirmed in `bd list`
- ✅ **Mulch lesson staging implemented** — agent writes to `.mulch/candidates.jsonl` (not live store); engineer promotes via `ml record` after review; human-in-the-loop safety model
- ✅ **`MulchLesson` type aligned with upstream `ml` schema** — replaced custom `MULCH_LESSON_TAGS` with `MULCH_LESSON_TYPES` (`convention | pattern | failure | decision | reference | guide`), added `MULCH_LESSON_CLASSIFICATIONS` (`foundational | tactical | observational`), reverted `tags` to free-form `string[]`. All 28 tests pass.
- ✅ **Type validation added to `lessonWriter.ts`** — rejects unknown `type` values at write time
- ✅ **Research-first convention lesson staged** — `.mulch/candidates.jsonl` contains: always research upstream package capabilities before building an integration layer
- ✅ **Beads task `coreai-wzy` closed** — taxonomy alignment complete
- ✅ **Backlog refinement session** — reviewed and adapted Memory Qualification Layer plan; created `coreai-ot8` (P4 backlog); identified candidate review UX gap; created `coreai-8ji` (P1 MVP) to close the mulch write pipeline; staged storage-triage Mulch lesson; noted E9 must be discussed before starting

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

## Next Steps

> ⚠️ **Do NOT start Epic 5 yet.** Complete `coreai-8ji` first — it closes the Mulch write pipeline and must not bleed into E5 scope.

1. **`coreai-8ji` — Mulch candidate review** (P1, do this first)
   - Branch: `feat/mulch-candidate-review`
   - Surface staged candidates at session end; implement `promoteMulchLesson()` and `rejectMulchLesson()` in `lessonWriter.ts`; wire into `onSessionEnd` in `hooks.ts`
   - CLI-first / file-fallback pattern for promotion (consistent with `queryMulch`)
2. **Then start Epic 5** — create branch `feat/e5-agent-plugin-session`; claim `coreai-vq3` in Beads
3. **E5-T1** — `sessionReader.ts`: reads and parses `SESSION.md` from repo root
4. **E5-T2** — `sessionWriter.ts`: writes structured `SESSION.md`; validates under 500 words
5. **E5-T3** — `hooks.ts`: `onSessionStart` (load) and `onSessionEnd` (write)
6. **E5-T4** — unit tests
7. **Codecov remains on hold** — resume later with the PR-branch probe

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
| E2-T4 | CLI — `agent start`, `agent end`, `agent task start <id>` using `commander` | ✅ |
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

Surfaces Mulch experience lessons at session start and persists explicit pending lessons at session end.
| ID | Task | Status |
|----|------|--------|
| E4-T1 | `mulchAdapter.ts` — calls `mulch search <topic>`, parses JSONL | ✅ |
| E4-T2 | `hooks.ts` — `onSessionStart` searches mulch for relevant topics | ✅ |
| E4-T3 | `lessonWriter.ts` — explicit helper persists supplied lessons; `onSessionEnd` consumes `pendingMulchLessons` | ✅ |
| E4-T4 | Unit tests with mocked Mulch adapter/writer paths | ✅ |

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

- Architecture specs: `docs/specs/agent_architecture_documentation_pack/`
- Copilot instructions: `.github/copilot-instructions.md`
- Repo: https://github.com/jwill9999/conscius
