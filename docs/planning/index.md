# Planning index

Active epics and features for the Conscius project. Managed by the `planning` skill — use `/new-epic`, `/new-feature`, `/add-task`, `/update-status`, and `/close-feature` to keep this in sync with the Beads task graph (`bd` CLI).

**Priority vs roadmap:** In Beads, **Epic 11** (`coreai-2f5`) is **P1** and **Epic 5** (`coreai-vq3` and children) is **P2**. `SESSION.md` and this index follow that ordering unless you change priorities in Beads.

---

## Epics

### Epic 10 — Runtime v3 (`e10-runtime-v3`)

**Planning ID:** feature-2026-03-21-001  
**Beads ID:** coreai-d6k  
**Beads status:** `closed` (Epic 10 complete — verify with `bd show coreai-d6k`; MVP hardening is Epic 11)  
**Status:** done  
**Created:** 21/03/2026 (GMT)  
**Completed:** 21/03/2026 (GMT)  
**Mode:** sequential  
**Description:** Merge `@conscius/agent-types` and `@conscius/agent-core` into `@conscius/runtime`; add `@conscius/cli`; `memorySegments` + `definePlugin`; migrate plugins; remove legacy packages.  
**Related Docs:** [Runtime v3 spec](../specs/runtime-v3.md)

#### Tasks

| Task                           | Beads ID   | Status | Mode       | Depends On | Created    | Completed  |
| ------------------------------ | ---------- | ------ | ---------- | ---------- | ---------- | ---------- |
| Canonical spec + planning      | —          | done   | sequential |            | 21/03/2026 | 21/03/2026 |
| Nx `runtime` + `cli` packages  | coreai-cy2 | done   | sequential | spec       | 21/03/2026 | 21/03/2026 |
| Runtime core + memory pipeline | coreai-ma3 | done   | sequential | Nx         | 21/03/2026 | 21/03/2026 |
| Migrate beads + mulch          | coreai-ipk | done   | sequential | runtime    | 21/03/2026 | 21/03/2026 |
| CLI extraction + remove legacy | coreai-iwn | done   | sequential | migrate    | 21/03/2026 | 21/03/2026 |
| Tests + docs sweep             | coreai-8ah | done   | sequential | remove     | 21/03/2026 | 21/03/2026 |

---

### Epic 11 — Runtime MVP Hardening (`e11-runtime-mvp-hardening`)

**Planning ID:** feature-2026-03-21-002  
**Beads ID:** coreai-2f5  
**Beads priority:** P1 (do before Epic 5 session plugin unless reprioritized in Beads)  
**Status:** open  
**Created:** 21/03/2026 (GMT)  
**Mode:** parallel (tasks can be sequenced by implementer)  
**Description:** Close v3 MVP gaps: runtime compression and limits, basic guardrails, CLI full cycle + `runtime.run()`, strict memory-only prompt influence from plugins.  
**Dependencies:** Epic 10 complete — Beads `coreai-d6k` (Runtime v3 merge); no open blockers on paper.  
**Execution order (current):** sequential MVP passes — `coreai-tfx` → `coreai-5dw` → `coreai-uld` → `coreai-0ga` → `coreai-9ts`. (Parallel workstreams can be replanned later in Beads + this index.)  
**Branching:** integration branch `feat/e11-runtime-mvp-hardening` from `main`; each MVP task uses its own `feat/e11-mvp-*` branch off the integration branch, merged into integration after human review; epic merges to `main` when Epic 11 closes.  
**Related Docs:** [Beads MVP alignment (v3)](./beads-mvp-alignment-v3.md) (canonical Epic 11 spec + task constraints), [Runtime v3 spec](../specs/runtime-v3.md) (platform behavior). Beads `spec_id` on `coreai-2f5` and MVP tasks points at `docs/planning/beads-mvp-alignment-v3.md`.

**Definition of Done (MVP):** Same bullet list as in Beads on `coreai-2f5` and in [beads-mvp-alignment-v3.md](./beads-mvp-alignment-v3.md#definition-of-done-mvp) — final prompt via `runtime.run(input: string): string`, deterministic ordering and compression, string-only guardrails, `conscius run --input` full cycle, plugins only via `memorySegments`; no extra scope.

#### Tasks

Task constraints by MVP: [Task constraints](./beads-mvp-alignment-v3.md#e11-task-constraints).

| Task                                 | Beads ID   | Status | Spec / constraints (doc)                                  | Created    |
| ------------------------------------ | ---------- | ------ | --------------------------------------------------------- | ---------- |
| MVP-1: Runtime compression (basic)   | coreai-tfx | open   | [constraints](./beads-mvp-alignment-v3.md#e11-coreai-tfx) | 21/03/2026 |
| MVP-2: Runtime guardrails (basic)    | coreai-5dw | open   | [constraints](./beads-mvp-alignment-v3.md#e11-coreai-5dw) | 21/03/2026 |
| MVP-3: CLI full cycle                | coreai-uld | open   | [constraints](./beads-mvp-alignment-v3.md#e11-coreai-uld) | 21/03/2026 |
| MVP-4: runtime.run() → prompt        | coreai-0ga | open   | [constraints](./beads-mvp-alignment-v3.md#e11-coreai-0ga) | 21/03/2026 |
| MVP-5: Plugin contract — memory-only | coreai-9ts | open   | [constraints](./beads-mvp-alignment-v3.md#e11-coreai-9ts) | 21/03/2026 |

---

## Developer experience & tooling

Standalone tasks that are not tied to a runtime epic. **`coreai-na7`** and **`coreai-6n8`** are **done** (skills → `.cursor`, then interactive Mulch recording).

| Work item                                                           | Planning ID                   | Beads ID   | Status | Priority | Mode       | Depends On (context)         | Created    |
| ------------------------------------------------------------------- | ----------------------------- | ---------- | ------ | -------- | ---------- | ---------------------------- | ---------- |
| Migrate `.github/skills` → `.cursor/skills` + doc strategy          | task-2026-03-22-skills-cursor | coreai-na7 | done   | 0        | sequential | —                            | 22/03/2026 |
| Interactive Mulch `ml record` helper (script + `make mulch-record`) | task-2026-03-22-mulch-record  | coreai-6n8 | done   | 1        | sequential | discovered-from `coreai-na7` | 22/03/2026 |

**`coreai-6n8` — description:** Interactive shell script prompts for Mulch record type and required fields (per `ml record --help`), defaults domain from `.mulch/mulch.config.yaml` when unambiguous, optional tags / files / evidence-bead; root **Makefile** target **`mulch-record`**; document in `.mulch/README.md`. **Acceptance:** `make mulch-record` works from repo root; README updated; non-zero exit on validation failure.

**Related:** Beads `external_ref` → `.mulch/README.md`.

---

### Epic 1 — Monorepo scaffold (`e1-scaffold`)

**Planning ID:** feature-2026-01-01-001
**Beads ID:** coreai-1ra
**Status:** done
**Created:** 01/01/2026 (GMT)
**Completed:** 15/01/2026 (GMT)
**Mode:** sequential
**Description:** Initial Nx monorepo setup with `agent-types`, `agent-core`, CI pipeline, ESLint, Prettier, Jest, SonarCloud.
**Notes:** Pushed directly to `main` — the only epic not following the branch/PR workflow.

---

### Epic 2 — agent-core (`e2-agent-core`)

**Planning ID:** feature-2026-01-02-001
**Beads ID:** coreai-nsn
**Status:** done
**Created:** 20/01/2026 (GMT)
**Completed:** 10/02/2026 (GMT)
**Mode:** sequential
**Description:** Core runtime — context builder, plugin loader, hook runner, CLI.

#### Tasks

| Task            | Beads ID | Status | Mode       | Depends On      | Created    | Completed |
| --------------- | -------- | ------ | ---------- | --------------- | ---------- | --------- |
| context-builder | —        | done   | sequential |                 | 20/01/2026 |           |
| plugin-loader   | —        | done   | sequential | context-builder | 20/01/2026 |           |
| hook-runner     | —        | done   | sequential | plugin-loader   | 20/01/2026 |           |
| CLI             | —        | done   | sequential | hook-runner     | 20/01/2026 |           |

---

### Epic 3 — agent-plugin-beads (`e3-agent-plugin-beads`)

**Planning ID:** feature-2026-02-01-001
**Beads ID:** coreai-e2o
**Status:** done
**Created:** 01/02/2026 (GMT)
**Completed:** 10/03/2026 (GMT)
**Mode:** sequential
**Description:** Plugin that wraps the `bd` CLI and injects active task context into `promptSegments` at session start.

#### Tasks

| Task                      | Beads ID | Status | Mode       | Depends On   | Created    | Completed |
| ------------------------- | -------- | ------ | ---------- | ------------ | ---------- | --------- |
| beadsAdapter.ts           | —        | done   | sequential |              | 01/02/2026 |           |
| hooks.ts (onSessionStart) | —        | done   | sequential | beadsAdapter | 01/02/2026 |           |
| unit tests                | —        | done   | sequential | hooks        | 01/02/2026 |           |

---

### Epic 4 — agent-plugin-mulch (`e4-agent-plugin-mulch`)

**Planning ID:** feature-2026-03-01-001
**Beads ID:** coreai-x3b
**Status:** done
**Created:** 10/03/2026 (GMT)
**Mode:** sequential
**Description:** Read-only plugin that injects Mulch experience context at session start via `ml prime` (no `onSessionEnd` persistence).
**Related Docs:** [Mulch experience layer spec](../specs/archive/mulch_experience_layer_spec.md)

#### Tasks

| Task                                              | Beads ID     | Status | Mode       | Depends On                                        | Created    | Completed |
| ------------------------------------------------- | ------------ | ------ | ---------- | ------------------------------------------------- | ---------- | --------- |
| mulchAdapter.ts (`ml` bridge)                     | coreai-x3b.1 | done   | sequential |                                                   | 10/03/2026 |           |
| hooks.ts (`ensureMlReady` + `onSessionStart`)     | coreai-x3b.2 | done   | sequential | mulchAdapter                                      |            |           |
| storage/write-path alignment for upstream `ml`    | coreai-btc   | done   | sequential | hooks                                             | 17/03/2026 |           |
| lessonWriter.ts (explicit helper)                 | coreai-x3b.3 | done   | sequential | storage/write-path alignment                      | 17/03/2026 |           |
| lifecycle read-only alignment (no `onSessionEnd`) | coreai-ljm   | done   | sequential | lessonWriter                                      | 17/03/2026 |           |
| unit tests                                        | coreai-x3b.4 | done   | sequential | lifecycle read-only alignment (no `onSessionEnd`) |            |           |

---

## Archive

Legacy backlog epics **E6 / E7 / E8** are closed in Beads as **pre-v3 — do not implement**; see [backlog](./backlog.md) and [Beads MVP alignment (v3)](./beads-mvp-alignment-v3.md).
