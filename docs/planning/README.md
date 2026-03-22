# Planning workflow

This guide explains how epics, features, and tasks are planned and tracked in Conscius. All planning produces two parallel records: a **markdown entry** (version-controlled, human-readable) and a **Beads task** (live agent context).

---

## Two systems, one source of truth

| System                 | Where                                  | Who reads it                                               |
| ---------------------- | -------------------------------------- | ---------------------------------------------------------- |
| Markdown planning docs | `docs/planning/index.md`, `backlog.md` | Humans, GitHub, code review                                |
| Beads task graph       | `bd` CLI (local database)              | Agents — injected by `agent-plugin-beads` at session start |

Every planning action writes to **both**. The `bd` issue ID is stored in the markdown entry as the link between the two. This means an agent working on a task automatically has its context injected — it doesn't need to be told what it's working on.

---

## Planning hierarchy

```
Epic (bd --type epic)
  └── Feature (bd --type feature --parent <epic-id>)
        └── Task (bd --type task --parent <feature-id>)
```

- **Epics** map to the project's numbered epics (E1, E2, E3…)
- **Features** are deliverable slices within an epic (e.g. a module, a hook, an adapter)
- **Tasks** are atomic units of work within a feature (individual files, tests, PRs)

---

## Slash commands (used with the planning skill)

The `planning` skill handles all planning actions. Use these commands in a Copilot session:

| Command            | What it does                                                         |
| ------------------ | -------------------------------------------------------------------- |
| `/new-epic`        | Creates an epic in `index.md` + `bd create --type epic`              |
| `/new-feature`     | Creates a feature entry + `bd create --type feature --parent <epic>` |
| `/add-task`        | Adds a task row + `bd create --type task --parent <feature>`         |
| `/update-status`   | Updates markdown status + `bd update --status`                       |
| `/close-feature`   | Marks complete + `bd close`                                          |
| `/new-backlog`     | Adds to `backlog.md` + `bd create --labels backlog`                  |
| `/move-to-feature` | Promotes from backlog to index + updates bd issue type               |
| `/list-features`   | Shows index.md alongside live `bd list` output                       |
| `/sync-beads`      | Audits and back-fills any missing `bd` IDs                           |

### Status values

| Markdown    | Beads         | Meaning                                        |
| ----------- | ------------- | ---------------------------------------------- |
| not started | `todo`        | Work not yet begun                             |
| in progress | `in_progress` | Actively being worked on                       |
| review      | `review`      | PR open, awaiting review                       |
| done        | `done`        | Merged, complete                               |
| blocked     | `blocked`     | Cannot proceed — dependency or decision needed |

---

## Branch naming

Each task gets its own branch and PR following the convention:

```
feat/e{N}-{epic-name}             ← epic branch (PR → main)
  feat/e{N}-t{M}-{task-name}      ← task sub-branch (PR → epic branch)
```

Example: `feat/e4-t1-mulch-adapter`

---

## Workflow: starting a new epic

1. Create the epic branch:

   ```bash
   git checkout main && git pull
   git checkout -b feat/e4-agent-plugin-mulch
   ```

2. Use the planning skill to register it:

   ```
   /new-epic name="Epic 4 — agent-plugin-mulch" description="..."
   ```

   This creates the `index.md` entry and the `bd` epic issue. Note the returned `bd` ID.

3. Break it into features/tasks:

   ```
   /new-feature name="mulchAdapter" epicId=<bd-id> mode=sequential
   /add-task name="mulchAdapter.ts" featureId=<bd-id> mode=sequential
   ```

4. For each task — create branch, implement, open PR to epic branch, wait for review.

5. When all tasks are done, run the full suite, open the epic PR to `main`.

---

## Workflow: backlog items

Items that are not yet being worked on live in `backlog.md`. When ready to start:

```
/move-to-feature backlogId=<planning-id-or-bd-id>
```

This moves the entry to `index.md` and updates the `bd` issue type to `feature`.

---

## Files

| File                                       | Purpose                                     |
| ------------------------------------------ | ------------------------------------------- |
| [`docs/planning/index.md`](./index.md)     | Active and completed epics, features, tasks |
| [`docs/planning/backlog.md`](./backlog.md) | Items not yet started or promoted           |

---

## Related

- Beads task graph (`bd`) — run `bd --help` for full CLI reference
- [SESSION.md](../../SESSION.md) — current session state and next steps
- [Adding a plugin](../guides/adding-a-plugin.md) — implementation guide for new plugins
- [Architecture overview](../specs/archive/agent_architecture_overview.md) — the 7-layer system design
