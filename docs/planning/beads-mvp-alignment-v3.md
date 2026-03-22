# Beads alignment & MVP completion (v3)

**Beads** is the execution source of truth. **Markdown** (including this file) is reference documentation.

## Rules

- No task is marked done in markdown while still open in Beads.
- Do not implement work from outdated epics or pre-v3 architecture. Implement **Epic 11 — Runtime MVP Hardening** (`coreai-2f5`) and validated v3 work only.

## Epic 10 — Runtime v3

**Beads:** `coreai-d6k` — **`status: closed`** (verify anytime with `bd show coreai-d6k`). Epic 10 is complete; MVP follow-on is **Epic 11** only.

Canonical technical spec: [Runtime v3](../specs/runtime-v3.md).

## Legacy epics E6, E7, E8

Designed for pre-v3 (`agent-core`, `onConversationThreshold`, plugin-shaped prompt layers). **Do not execute as written.**

- Beads: `coreai-mbp`, `coreai-7mm`, `coreai-zsh` — closed / frozen.
- Specs `e6-*`, `e7-*`, `e8-*` carry a **pre-v3** banner; replacement work is under Epic 11 where it applies to MVP.

## Epic 11 — Runtime MVP Hardening

**Beads ID:** `coreai-2f5`

| Task                                           | Beads ID     |
| ---------------------------------------------- | ------------ |
| Runtime compression (basic)                    | `coreai-tfx` |
| Runtime guardrails (basic)                     | `coreai-5dw` |
| CLI full cycle                                 | `coreai-uld` |
| `runtime.run()` → prompt                       | `coreai-0ga` |
| Plugin contract — memory-only prompt influence | `coreai-9ts` |

### Task constraints (anti–scope-creep)

- **MVP-1 (`coreai-tfx`):** NO LLM calls, NO summarisation — ONLY dedupe, priority-based trim, count/token limits.
- **MVP-2 (`coreai-5dw`):** Simple string checks only — NO external services, NO policy engine, NO ML classifiers.
- **MVP-3 (`coreai-uld`):** Canonical CLI is **`conscius run`** with `--input` (binary from `@conscius/cli`).
- **MVP-4 (`coreai-0ga`):** **`runtime.run(input: string): string`** — final prompt text only; NOT segments, NOT a structured object.
- **MVP-5 (`coreai-9ts`):** Prompt influence only via **`memorySegments`**.

### Definition of Done (MVP)

Epic 11 is **done** when all of the following are true (no extra features):

- `runtime.run(input: string): string` returns the final assembled prompt text only.
- Segment ordering for prompt build is deterministic.
- Compression reduces segment payload deterministically within MVP-1 constraints (dedupe + trim + limits only).
- Guardrails filter unsafe segments using MVP-2 constraints (string heuristics only).
- `conscius run --input` runs the full cycle and prints the final prompt to stdout.
- Plugins affect the assembled prompt only via `memorySegments`.

## Mulch MVP scope

Mulch in MVP is a **memory provider** that emits **experience segments only**. Memory qualification, ranking, and filtering are **post-MVP** (see deferred `coreai-ot8`).

## Build / CI

No dedicated build epic. Health via Nx and the CI pipeline. Pre-publish: pin workspace deps (`coreai-p9g`).

## Execution order

1. Beads reflects reality (Epic 10 closed; legacy epics frozen).
2. Epic 11 tasks implement remaining MVP gaps only.
