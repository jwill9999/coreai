# Planning index

Active epics and features for the Conscius project. Managed by the `planning` skill — use `/new-epic`, `/new-feature`, `/add-task`, `/update-status`, and `/close-feature` to keep this in sync with the [Beads task graph](../../SESSION.md).

---

## Epics

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
**Description:** Plugin that surfaces Mulch experience lessons at session start and persists explicit pending lessons at session end. The canonical direction is upstream `ml`, with only lightweight legacy compatibility where needed.
**Related Docs:** [Mulch experience layer spec](../specs/agent_architecture_documentation_pack/mulch_experience_layer_spec.md)

#### Tasks

| Task                                           | Beads ID     | Status | Mode       | Depends On                            | Created    | Completed |
| ---------------------------------------------- | ------------ | ------ | ---------- | ------------------------------------- | ---------- | --------- |
| mulchAdapter.ts                                | coreai-x3b.1 | done   | sequential |                                       | 10/03/2026 |           |
| hooks.ts (onSessionStart)                      | coreai-x3b.2 | done   | sequential | mulchAdapter                          |            |           |
| storage/write-path alignment for upstream `ml` | coreai-btc   | done   | sequential | hooks                                 | 17/03/2026 |           |
| lessonWriter.ts (explicit helper)              | coreai-x3b.3 | done   | sequential | storage/write-path alignment          | 17/03/2026 |           |
| explicit `onSessionEnd` lesson wiring          | coreai-ljm   | done   | sequential | lessonWriter                          | 17/03/2026 |           |
| unit tests                                     | coreai-x3b.4 | done   | sequential | explicit `onSessionEnd` lesson wiring |            |           |

---

## Archive

No archived epics yet.
