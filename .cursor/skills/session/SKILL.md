---
name: session
description: "Manage SESSION.md and SUMMARY.md for the Conscius project. USE WHEN: user says 'update session', 'update SESSION.md', 'end of session', 'taking a break', 'stepping away', 'compress conversation', 'add summary', or when completing an epic/task and session state needs recording. EXAMPLES: 'update the session', 'let's update session.md', 'add a summary segment', 'I am done for today'."
---

# Session management

## Current state

- **Branch:** !`git branch --show-current`
- **Last commit:** !`git log --oneline -1`
- **SESSION.md last updated:** !`git log --oneline -1 -- SESSION.md`

## User instructions

$ARGUMENTS

---

## SESSION.md

`SESSION.md` is the **primary session handoff document** at the repo root. It must be kept up to date so any new agent session can resume without needing conversation history.

### When to update SESSION.md

Update and commit `SESSION.md` at **every one of these checkpoints** — do not wait to be asked:

1. **After completing an epic or task** — mark it done in the task table
2. **Before the user takes a break** — any message indicating they are stepping away
3. **After every commit to main** — keep the active task and next steps current
4. **When explicitly asked** — user says "update session" or similar

### What SESSION.md must always contain

- **Current Objective** — what we are trying to achieve right now
- **Active Task** — epic/task ID currently in progress
- **Progress Since Last Session** — what was completed this session
- **Decisions Made** — key technical decisions and their rationale
- **Open Issues** — blockers or unknowns that need resolving
- **Next Steps** — the exact next task ID and what to do
- **Epic and task table** — full list with ✅ / ⬜ status for every epic and task

### After updating SESSION.md

```bash
git add SESSION.md && git commit -m "chore: update SESSION.md" && git push
```

> **Note:** Epic 5 (`agent-plugin-session`) and Epic 6 (context injection hooks) will automate this once built. Until then it is a manual checkpoint.

---

## SUMMARY.md

`SUMMARY.md` is the **compressed conversation history** at the repo root. It is **append-only** — new segments are added; past segments are never edited.

Each segment maps to the `CompressionSummary` interface in `@conscius/agent-types`:

```typescript
interface CompressionSummary {
  segmentIndex: number;
  topic: string;
  keyDecisions: string[];
  constraints: string[];
  outcome: string;
}
```

### When to add a new segment to SUMMARY.md

- When a major topic or epic completes
- When conversation history is getting long (approaching ~30 messages in a session)
- When explicitly asked

### After updating SUMMARY.md

```bash
git add SUMMARY.md && git commit -m "docs: update SUMMARY.md" && git push
```
