# @conscius/agent-plugin-mulch

Surfaces relevant experience lessons from Mulch into an agent session.

[![CI](https://github.com/jwill9999/conscius/actions/workflows/ci.yml/badge.svg)](https://github.com/jwill9999/conscius/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@conscius/agent-plugin-mulch)](https://www.npmjs.com/package/@conscius/agent-plugin-mulch)

## What it does

The initial adapter exports `queryMulch(topic, repoRoot)`, which:

1. Currently tries legacy `mulch search <topic>` from the repository root.
2. Parses JSONL, JSON object, or JSON array output into `MulchLesson[]`.
3. Falls back to reading project and global `.mulch/mulch.jsonl` files if the
   CLI is unavailable.

## Direction

For this repository, the canonical future direction is upstream Mulch via `ml`.

- New docs, skills, and integration work should prefer `ml`.
- Legacy compatibility should stay lightweight.
- The current adapter still uses legacy `mulch` CLI behavior where available,
  because the remaining Epic 4 work has not yet completed the alignment.
- Explicit lesson persistence currently uses the existing transitional
  `MulchLesson` JSONL format via `writeMulchLesson()`.
- Automatic persistence now uses explicit `context.pendingMulchLessons` during
  `onSessionEnd`; heuristic lesson discovery is intentionally out of scope.

## Usage

```ts
import { queryMulch, writeMulchLesson } from '@conscius/agent-plugin-mulch';

const lessons = await queryMulch('typescript', process.cwd());

await writeMulchLesson(
  {
    id: 'lesson-1',
    topic: 'typescript',
    summary: 'Jest tsconfig needs customConditions set to null',
    recommendation: 'Override customConditions in tsconfig.spec.json',
    created: new Date().toISOString(),
  },
  process.cwd(),
);
```

If you are running the full plugin lifecycle, provide explicit session-end
lessons via `AgentContext.pendingMulchLessons`.

## Requirements

- Upstream `ml` is the preferred Mulch CLI direction for future work in this
  repo.
- The current adapter still expects legacy `mulch` on `$PATH` to use CLI-backed
  lookups.
- Fallback file lookup reads:
  - `{repoRoot}/.mulch/mulch.jsonl`
  - `~/.mulch/mulch.jsonl`
