---
name: planning
description: 'Plan, document, and manage epics, features, tasks, and backlog items for the Conscius project. Creates entries in both the markdown planning docs (docs/planning/) and the Beads task graph (bd CLI). Use this skill for all planning work. Supported slash commands: /new-epic, /new-feature, /add-task, /update-status, /close-feature, /archive-feature, /new-backlog, /move-to-feature, /list-features, /list-backlog, /sync-beads, /help /planning'
---

argument-hint:
/new-epic: |
Parameters: name (required), description (required), tasks (optional list), relatedDocs (optional)
Action: Create an epic entry in docs/planning/index.md AND run `bd create --type epic --labels epic` to register it in Beads. Store the returned bd ID (e.g. bd-a3f8) in the markdown entry. Prompt for missing details. Confirm with engineer before saving.
Example: /new-epic name="Epic 4 — agent-plugin-mulch" description="Build the Mulch experience plugin"

/new-feature: |
Parameters: name (required), description (required), epicId (optional bd epic ID to parent under), requirements (optional), dependencies (optional), mode (parallel/sequential, required), relatedDocs (optional)
Action: Create a feature entry in docs/planning/index.md AND run `bd create --type feature [--parent <epicId>]`. Store the returned bd ID in the markdown entry. Prompt for missing details. Confirm with engineer before saving.
Example: /new-feature name="mulchAdapter" description="CLI adapter for mulch search" epicId=bd-a3f8 mode=sequential

/add-task: |
Parameters: name (required), featureId (required — planning ID or bd ID), description (optional), dependencies (optional bd IDs), mode (parallel/sequential, required), acceptance (optional)
Action: Add a task row to the feature's subtask table in docs/planning/index.md AND run `bd create --type task --parent <bd-feature-id> [--deps <bd-ids>] [--acceptance "..."]`. Store the returned bd ID in the task row. Confirm with engineer before saving.
Example: /add-task name="mulchAdapter.ts" featureId=bd-b12c mode=sequential acceptance="parses JSONL output into MulchLesson[]"

/update-status: |
Parameters: id (required — planning ID or bd ID), status (required: not-started/in-progress/review/done/blocked), subtaskId (optional)
Action: Update the status field in docs/planning/index.md AND run `bd update <bd-id> --status <status>`. Map planning statuses to bd statuses: not-started→todo, in-progress→in_progress, review→review, done→done, blocked→blocked. Confirm with engineer if closing or blocking.
Example: /update-status id=bd-c99d status=in-progress

/close-feature: |
Parameters: featureId (required — planning ID or bd ID)
Action: Mark the feature complete in docs/planning/index.md AND run `bd close <bd-id>`. Prompt engineer for confirmation before closing.
Example: /close-feature featureId=bd-b12c

/archive-feature: |
Parameters: featureId (required)
Action: Move the completed feature entry to the archive section in docs/planning/index.md. Confirm with engineer.
Example: /archive-feature featureId=feature-2026-03-10-001

/new-backlog: |
Parameters: name (required), description (required), priority (required: high/medium/low), effort (required: small/medium/large), dependencies (optional), relatedDocs (optional)
Action: Document a backlog item in docs/planning/backlog.md AND run `bd create --type task --labels backlog --priority <p>` (map: high→1, medium→2, low→3). Store the bd ID. Prompt for missing details. Confirm with engineer.
Example: /new-backlog name="Pin workspace deps pre-publish" description="Pin \* deps to concrete versions before npm publish" priority=medium effort=small

/move-to-feature: |
Parameters: backlogId (required — planning ID or bd ID)
Action: Promote the backlog item: move entry from backlog.md to index.md, update bd issue type to feature (`bd update <id> --type feature`), prompt for additional required details. Confirm with engineer.
Example: /move-to-feature backlogId=bd-d44e

/list-features: |
Parameters: none
Action: Show all features and their statuses from docs/planning/index.md alongside live Beads status (`bd list --label feature`).
Example: /list-features

/list-backlog: |
Parameters: none
Action: Show all backlog items from docs/planning/backlog.md alongside live Beads status (`bd list --label backlog`).
Example: /list-backlog

/sync-beads: |
Parameters: none
Action: Audit docs/planning/index.md and backlog.md for entries missing a bd ID. For each missing entry, run the appropriate `bd create` command and back-fill the ID. Report what was synced. Confirm with engineer before making changes.
Example: /sync-beads

/help /planning: |
Parameters: none or command name (optional)
Action: Display a table of all available planning slash commands, their parameters, and descriptions. If a command name is specified, show detailed help for that command.
Example: /help /planning /add-task

---

## Overview

The planning skill maintains **two parallel records** for every epic, feature, and task:

| Record         | Where                                   | Purpose                                                                |
| -------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| Markdown entry | `docs/planning/index.md` / `backlog.md` | Human-readable roadmap, version-controlled, GitHub-visible             |
| Beads issue    | `bd` CLI task graph                     | Live agent context — injected by `agent-plugin-beads` at session start |

Every planning action writes to **both**. The Beads `bd` ID is stored in the markdown entry as the authoritative link between the two systems.

---

## Beads CLI Reference

Key `bd` commands used by this skill:

```bash
# Create an epic
bd create --type epic --labels epic -d "description" "Epic title"

# Create a feature under an epic
bd create --type feature --parent bd-XXXX --labels feature -d "description" "Feature title"

# Create a task under a feature
bd create --type task --parent bd-XXXX --deps "blocks:bd-YYYY" --acceptance "criteria" "Task title"

# Update status
bd update bd-XXXX --status in_progress   # statuses: todo|in_progress|review|done|blocked

# Close
bd close bd-XXXX --reason "Completed"

# List by label
bd list --label epic
bd list --label feature
bd list --label backlog

# Show detail
bd show bd-XXXX
```

**Status mapping** (planning → Beads):

| Planning    | Beads         |
| ----------- | ------------- |
| not started | `todo`        |
| in progress | `in_progress` |
| review      | `review`      |
| done        | `done`        |
| blocked     | `blocked`     |

**Priority mapping** (planning → Beads `--priority`):

| Planning | Beads         |
| -------- | ------------- |
| high     | `1`           |
| medium   | `2` (default) |
| low      | `3`           |

---

## Documentation Streams

| File                       | Purpose                                         |
| -------------------------- | ----------------------------------------------- |
| `docs/planning/index.md`   | Active and completed epics, features, and tasks |
| `docs/planning/backlog.md` | Items not yet started or promoted to a feature  |

---

## Templates

### Epic / Feature entry (`docs/planning/index.md`)

```markdown
### [Feature Name] (`feature-slug`)

**Planning ID:** feature-YYYY-MM-DD-NNN
**Beads ID:** bd-XXXX
**Status:** not started | in progress | review | done | archived
**Created:** DD/MM/YYYY (GMT)
**Completed:** DD/MM/YYYY (GMT, if applicable)
**Mode:** parallel | sequential
**Description:** Brief summary
**Dependencies:** (planning IDs or bd IDs)
**Related Docs:** Links to specs, ADRs, guides

#### Tasks

| Task      | Planning ID | Beads ID | Status      | Mode       | Depends On | Created    | Completed |
| --------- | ----------- | -------- | ----------- | ---------- | ---------- | ---------- | --------- |
| Task name | subtask-001 | bd-YYYY  | not started | sequential |            | DD/MM/YYYY |           |
```

### Backlog entry (`docs/planning/backlog.md`)

```markdown
### [Backlog Item Name] (`backlog-slug`)

**Planning ID:** backlog-YYYY-MM-DD-NNN
**Beads ID:** bd-XXXX
**Status:** not started | in progress | done
**Created:** DD/MM/YYYY (GMT)
**Priority:** high | medium | low
**Effort:** small | medium | large
**Description:** Brief summary
**Dependencies:** (planning IDs or bd IDs)
**Related Docs:** Links if applicable
```

---

## Archiving

- Completed features may be moved to an `## Archive` section at the bottom of `index.md`
- Archived entries keep their Beads ID for traceability
- Closed Beads issues are not deleted — they remain queryable with `bd list --all`

---

## Workflow Summary

```
/new-epic          → index.md entry + bd create --type epic
  /new-feature     → index.md entry + bd create --type feature --parent
    /add-task      → task row in entry + bd create --type task --parent
    /update-status → update entry + bd update --status
    /close-feature → mark complete + bd close
/new-backlog       → backlog.md entry + bd create --type task --labels backlog
/move-to-feature   → promote to index.md + bd update --type feature
/sync-beads        → audit and back-fill missing bd IDs
```

Always confirm with the engineer before closing or archiving. For complex features, link to the relevant spec in `docs/specs/` or ADR in `docs/adr/`.
