# Session Context

## Current Objective

**`main` carries runtime v3 (0.5.0-alpha.0), CI green.** Continue with **Epic 5** — `@conscius/agent-plugin-session` (`coreai-vq3`).

## Active Task

**None — merge to `main` complete.** Pick up Epic 5 when ready: branch `feat/e5-agent-plugin-session`, claim `coreai-vq3` in Beads.

Recent `main` themes (already landed):

- Runtime v3 MVP (`@conscius/runtime`, `conscius` CLI); PR **#19** Copilot items addressed (plugin `source` attribution, `resolvePluginSpecifier` + `repoRoot`, docs/tsconfig).
- `.cursor` hygiene: Sonar token out of git; `SONARQUBE_TOKEN` via `${env:SONARQUBE_TOKEN}`; `AGENTS.md` uses `bd dolt pull`/`push` instead of non-existent `bd sync`.

## Progress Since Last Session

- ✅ **Runtime v3 on `main`** — four packages: `runtime`, `cli`, `agent-plugin-beads`, `agent-plugin-mulch`.
- ✅ **Plugin loader** — host segments without `source` → `host`; only newly pushed segments get the current plugin name; relative plugin paths resolve from `repoRoot`.
- ✅ **Docs** — mulch README, E4 spec, `plugin-contract.md`, beads `tsconfig` reference to `runtime`.
- ✅ **Tooling/security** — MCP Sonar config + SESSION/SUMMARY/README alignment (this update).

## Decisions Made

- Nx monorepo — prefer `npx nx add @nx/<plugin>` over manual config where applicable
- TypeScript: `module: nodenext`, strict mode, `.js` extensions in imports
- `tsconfig.spec.json` must set `"customConditions": null` (avoids TS5098 with Jest/node10)
- Node 24 via nvm; ESLint 8 using legacy `.eslintrc.*` format
- Do NOT fork `bd` (Beads) or `mulch` — adapter plugins only
- Hooks may write to `SESSION.md`, canonical upstream `.mulch/expertise/`, and legacy `.mulch/mulch.jsonl`; agents stage lessons to `.mulch/candidates.jsonl` for human review
- Branching: task PR → human review → epic branch → local test → epic PR → `main`
- All packages versioned in lockstep; **current version: `0.5.0-alpha.0`**
- GitHub Actions CI active; Husky pre-commit (lint-staged) + pre-push (nx affected)
- SonarCloud automatic analysis; coverage also reported to Codecov
- **Beads remote sync:** use `bd dolt pull` / `bd dolt push` when using a Dolt remote — there is no `bd sync` command in current `bd` CLI

## Open Issues

- **Pre-publish: pin `"*"` inter-package deps** — `packages/cli` and plugins declare `"@conscius/runtime": "*"`. Safe inside the npm workspace; pin to `"^x.x.x"` before first `npm publish` (see [docs/guides/publishing.md](./docs/guides/publishing.md)).

- **🚨 Codecov "Missing Head Report" — unresolved, on hold** — Codecov sometimes shows no coverage on `main`. Hypothesis: `[skip ci]` changelog commits on HEAD without a run. Diagnostic: short-lived PR branch and verify Codecov on the PR.

- **Re-evaluate `agent-plugin-beads` dependency pattern** — Mulch bundles `@os-eco/mulch-cli`; consider whether beads should bundle or document `bd` install similarly for onboarding.

## Next Steps

1. **Epic 5 (`coreai-vq3`)** — `@conscius/agent-plugin-session`: `sessionReader`, `sessionWriter`, hooks, tests.
2. **Codecov probe** — when time allows, PR-branch experiment (see Open Issues).
3. **Beads** — after issue changes, commit updated `.beads/issues.jsonl` per `.beads/README.md`.

---

## Full Epic & Task Plan

Legend: ✅ done | ⬜ pending

### Epic 1 — Monorepo Foundation ✅

| ID    | Task                                    | Status |
| ----- | --------------------------------------- | ------ |
| E1-T1 | Scaffold workspace + shared types layer | ✅     |
| E1-T2 | Nx targets, Prettier across packages    | ✅     |

_(Types and plugin contracts now ship from `@conscius/runtime`.)_

### Epic 2 — Runtime orchestration ✅

_(Delivered as `@conscius/runtime` + `@conscius/cli` — context, plugins, hooks, `conscius` CLI.)_

| ID    | Task             | Status |
| ----- | ---------------- | ------ |
| E2-T1 | Context / memory | ✅     |
| E2-T2 | Plugin loader    | ✅     |
| E2-T3 | Hook runner      | ✅     |
| E2-T4 | CLI (`conscius`) | ✅     |
| E2-T5 | Unit tests       | ✅     |

### Epic 3 — `@conscius/agent-plugin-beads` ✅

| ID    | Task                              | Status |
| ----- | --------------------------------- | ------ |
| E3-T1 | `beadsAdapter.ts` — `bd show`     | ✅     |
| E3-T2 | `hooks.ts` — task context         | ✅     |
| E3-T3 | `contextLoader.ts` — spec content | ✅     |
| E3-T4 | Unit tests                        | ✅     |

### Epic 4 — `@conscius/agent-plugin-mulch` ✅

Read-only Mulch: `ml prime` → `memorySegments` at `onSessionStart`; no `onSessionEnd` persistence in the plugin lifecycle.

| ID    | Task           | Status |
| ----- | -------------- | ------ |
| E4-T1 | `mulchAdapter` | ✅     |
| E4-T2 | `hooks.ts`     | ✅     |
| E4-T3 | `lessonWriter` | ✅     |
| E4-T4 | Unit tests     | ✅     |

### Epic 5 — `@conscius/agent-plugin-session` ⬜

| ID    | Task            | Status |
| ----- | --------------- | ------ |
| E5-T1 | `sessionReader` | ⬜     |
| E5-T2 | `sessionWriter` | ⬜     |
| E5-T3 | `hooks.ts`      | ⬜     |
| E5-T4 | Unit tests      | ⬜     |

### Epic 6 — `@conscius/agent-plugin-compression` ⬜

| ID    | Task         | Status |
| ----- | ------------ | ------ |
| E6-T1 | `segmenter`  | ⬜     |
| E6-T2 | `compressor` | ⬜     |
| E6-T3 | `hooks.ts`   | ⬜     |
| E6-T4 | Unit tests   | ⬜     |

### Epic 7 — `@conscius/agent-plugin-guardrails` ⬜

| ID    | Task              | Status |
| ----- | ----------------- | ------ |
| E7-T1 | `pipeline.ts`     | ⬜     |
| E7-T2 | `checkers/`       | ⬜     |
| E7-T3 | `hooks.ts`        | ⬜     |
| E7-T4 | Beads transitions | ⬜     |
| E7-T5 | Unit tests        | ⬜     |

### Epic 8 — `@conscius/agent-stack-standard` ⬜

Convenience bundle — peer deps on plugins + **`@conscius/runtime`** (not legacy `agent-core`).

| ID    | Task                        | Status |
| ----- | --------------------------- | ------ |
| E8-T1 | Package + peer deps         | ⬜     |
| E8-T2 | `agent-stack-standard init` | ⬜     |
| E8-T3 | README                      | ⬜     |

### Epic 9 — `@conscius/skillshare` ⬜

| ID    | Task       | Status |
| ----- | ---------- | ------ |
| E9-T1 | CLI entry  | ⬜     |
| E9-T2 | `manifest` | ⬜     |
| E9-T3 | `loader`   | ⬜     |
| E9-T4 | `init` cmd | ⬜     |
| E9-T5 | `sync` cmd | ⬜     |
| E9-T6 | `pull` cmd | ⬜     |
| E9-T7 | Templates  | ⬜     |
| E9-T8 | README     | ⬜     |
| E9-T9 | Unit tests | ⬜     |

---

### CI/CD — GitHub Actions ✅

| ID    | Task                | Status |
| ----- | ------------------- | ------ |
| CI-T1 | CI workflow + hooks | ✅     |

---

## Build Order

```
E1 ✅ → E2 ✅ → E3 ✅, E4 ✅, E5–E7 (parallel) → E8
E9 (independent)
CI-T1 ✅
```

## Quality Gates Per PR (current)

| Gate                           | Tool           | Status   |
| ------------------------------ | -------------- | -------- |
| typecheck, lint, test, build   | Nx             | ✅       |
| Pre-commit / pre-push          | Husky          | ✅       |
| CI                             | GitHub Actions | ✅       |
| Coverage                       | Codecov        | ⚠️ probe |
| Sourcery / CodeQL / SonarCloud | GitHub + Sonar | ✅       |

## References

- Architecture specs: `docs/specs/archive/`
- Copilot instructions: `.github/copilot-instructions.md`
- Cursor MCP secrets: `.cursor/README.md`
- Repo: https://github.com/jwill9999/conscius
