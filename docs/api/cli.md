# `@conscius/cli` API reference

**Version:** see [npm](https://www.npmjs.com/package/@conscius/cli)

Thin CLI consumer of `@conscius/runtime`. Exposes the **`conscius`** binary (`npm install -g @conscius/cli` / `npx @conscius/cli` depending on your setup).

## Commands

- `conscius start` — session start plugins, `session-start` hook, memory compose, `memory-compose` hook
- `conscius end` — session end plugins, `session-end` hook
- `conscius task start <id>` — task start plugins, `task-start` hook, memory compose, `memory-compose` hook

The CLI must not add orchestration beyond what the runtime provides.

## Related

- [`@conscius/runtime`](./runtime.md)
