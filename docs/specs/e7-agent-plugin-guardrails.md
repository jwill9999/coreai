# E7 — @conscius/agent-plugin-guardrails

> **Pre-v3 — do not implement as written.** This brief targets a guardrails plugin on legacy `agent-core`. The Beads epic is closed. MVP guardrail work lives in **Epic 11** (`coreai-2f5`, task `coreai-5dw`) inside `@conscius/runtime`. See [Runtime v3](./runtime-v3.md) and [Beads MVP alignment (v3)](../planning/beads-mvp-alignment-v3.md).

**Beads ID:** coreai-7mm (closed / frozen)  
**Status:** historical implementation brief  
**Package:** `packages/agent-plugin-guardrails` (not created for v3)  
**Import path:** `@conscius/agent-plugin-guardrails`

---

## Overview

Plugin that runs a validation pipeline when a task transitions to `review` state. Ensures work meets engineering quality standards before a task can be marked `done`. If any check fails, the pipeline blocks completion and provides feedback to the agent.

---

## Target file structure

```
packages/agent-plugin-guardrails/
└── src/
    ├── index.ts
    └── lib/
        ├── pipeline.ts             ← runPipeline() — orchestrates validation steps
        ├── checks/
        │   ├── format.ts           ← runFormat() — Prettier check
        │   ├── lint.ts             ← runLint() — ESLint via nx
        │   ├── typecheck.ts        ← runTypecheck() — tsc via nx
        │   └── test.ts             ← runTests() — Jest via nx
        ├── hooks.ts                ← guardrailsPlugin: AgentPlugin implementation
        └── __tests__/
            ├── pipeline.spec.ts
            └── hooks.spec.ts
```

---

## Validation pipeline (in order)

```
1. Formatting     → npx nx format:check
2. Linting        → npx nx lint <project>
3. Type checking  → npx nx typecheck <project>
4. Unit tests     → npx nx test <project>
```

Each step:

- Returns `{ passed: boolean, output: string }`
- On failure, pipeline stops (fail-fast) and reports the failing step
- On pass, continues to next step

---

## Module responsibilities

### `pipeline.ts`

```ts
interface PipelineStep {
  name: string;
  run: (repoRoot: string, projectName?: string) => Promise<{ passed: boolean; output: string }>;
}

runPipeline(repoRoot: string, projectName?: string): Promise<PipelineResult>
```

```ts
interface PipelineResult {
  passed: boolean;
  steps: Array<{ name: string; passed: boolean; output: string }>;
  failedAt?: string;
}
```

Runs steps in order, stops at first failure (fail-fast). Returns full result including all step outputs.

Each check runs via `execFile('npx', ['nx', ...], { cwd: repoRoot })` — same manual Promise wrapper pattern.

### `hooks.ts`

```ts
export const guardrailsPlugin: AgentPlugin;
```

`onTaskStart(context)`:

1. Check if `context.activeTask?.status === 'review'`
2. If not in review — return silently
3. Run `runPipeline(context.repoRoot, derivedProjectName)`
4. If pipeline passes — append `## Guardrails: All checks passed ✓` to `context.promptSegments`
5. If pipeline fails — append `## Guardrails: Pipeline failed at {step}` with full output

---

## Deriving project name

The project name for `nx` commands is derived from the active Beads task or `context.activeTask`. Strategy (in order):

1. `context.activeTask?.description` — look for `packages/{name}` pattern
2. `BD_PROJECT` env var
3. Run on all affected (`--all`) if no project can be inferred

---

## Implementation notes

- Follow `packages/agent-plugin-beads/` file structure **exactly**
- Manual Promise wrapper for `execFile` calls
- `tsconfig.spec.json` must set `"customConditions": null`
- Fail-fast: pipeline stops at first failure
- Plugin exported as `guardrailsPlugin` + default export
- No file writes — prompt segment injection only

---

## Acceptance criteria

- [ ] `runPipeline` runs all 4 steps in order; stops at first failure
- [ ] Each check step returns `{ passed, output }`
- [ ] Plugin returns silently when task is not in `review` status
- [ ] Passing pipeline injects success message into prompt
- [ ] Failing pipeline injects failure details into prompt
- [ ] All functions have unit tests
- [ ] `npx nx run-many -t typecheck,lint,test --projects=agent-plugin-guardrails` passes

---

## Tasks (Beads)

| Beads ID     | Task                                            |
| ------------ | ----------------------------------------------- |
| coreai-7mm.1 | Implement pipeline orchestrator                 |
| coreai-7mm.2 | Implement format + lint checks                  |
| coreai-7mm.3 | Implement typecheck + test checks               |
| coreai-7mm.4 | Implement hooks (onTaskStart with review check) |
| coreai-7mm.5 | Unit tests for pipeline                         |

---

## Archive

Original design: `docs/specs/archive/layer7_guardrails_quality_gates.md`
