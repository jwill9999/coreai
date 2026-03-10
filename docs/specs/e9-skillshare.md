# E9 — skillshare (standalone CLI)

**Beads ID:** coreai-yfl  
**Status:** implementation brief (not started)  
**Package:** `packages/skillshare`  
**Import path:** `@conscius/skillshare`  
**Type:** Standalone publishable CLI tool

---

## Overview

`skillshare` is a manifest-driven CLI for syncing GitHub Copilot skills and instruction files across projects. Allows teams to maintain a central skills repository and pull updates into any project. Published as an npm package; used standalone (not as an `AgentPlugin`).

---

## Target file structure

```
packages/skillshare/
└── src/
    ├── index.ts                    ← CLI entry point (commander)
    ├── commands/
    │   ├── init.ts                 ← `skillshare init` — creates skills-config.json
    │   ├── sync.ts                 ← `skillshare sync` — pulls skills from source repos
    │   └── pull.ts                 ← `skillshare pull <skill>` — pulls a single skill
    ├── lib/
    │   ├── manifest.ts             ← read/write skills-config.json
    │   ├── gitSync.ts              ← clones/fetches skill repos using simple-git
    │   └── fileSync.ts             ← copies skill files into .github/skills/
    └── __tests__/
        ├── manifest.spec.ts
        └── sync.spec.ts
```

---

## CLI commands

### `skillshare init`

Creates `skills-config.json` in the project root with an example manifest:

```json
{
  "version": "1",
  "sources": [
    {
      "name": "conscius-skills",
      "repo": "https://github.com/jwill9999/conscius",
      "branch": "main",
      "path": ".github/skills"
    }
  ],
  "skills": ["planning", "docs", "session"]
}
```

### `skillshare sync`

Reads `skills-config.json`, fetches each source repository, copies the listed skills into `.github/skills/` of the current project. Uses `simple-git` for git operations.

### `skillshare pull <skill>`

Pulls a single skill by name from the configured source. Useful for updating one skill without running a full sync.

---

## `skills-config.json` manifest

```ts
interface SkillsConfig {
  version: string;
  sources: Array<{
    name: string;
    repo: string;
    branch?: string; // defaults to 'main'
    path?: string; // defaults to '.github/skills'
  }>;
  skills: string[]; // skill names to sync
}
```

---

## Dependencies

```json
{
  "dependencies": {
    "commander": "^12.0.0",
    "simple-git": "^3.0.0"
  }
}
```

---

## Implementation notes

- **Standalone CLI** — not an AgentPlugin; has its own `bin` entry in `package.json`
- Skills are synced as directories: `{source.path}/{skill}/` → `.github/skills/{skill}/`
- Existing skill files are overwritten on sync (no merge)
- `tsconfig.spec.json` must set `"customConditions": null`
- Consider `--dry-run` flag for `sync` to preview changes without writing

---

## Acceptance criteria

- [ ] `skillshare init` creates valid `skills-config.json`
- [ ] `skillshare sync` fetches configured skills and writes to `.github/skills/`
- [ ] `skillshare pull <skill>` updates a single skill
- [ ] CLI provides helpful `--help` output for all commands
- [ ] All lib functions have unit tests
- [ ] `npx nx run-many -t typecheck,lint,test --projects=skillshare` passes
- [ ] Package builds as publishable npm package with correct `bin` entry

---

## Tasks (Beads)

| Beads ID     | Task                                           |
| ------------ | ---------------------------------------------- |
| coreai-yfl.1 | Scaffold package + CLI entry point (commander) |
| coreai-yfl.2 | Implement manifest read/write                  |
| coreai-yfl.3 | Implement gitSync (simple-git fetch + copy)    |
| coreai-yfl.4 | Implement `init` command                       |
| coreai-yfl.5 | Implement `sync` command                       |
| coreai-yfl.6 | Implement `pull` command                       |
| coreai-yfl.7 | Unit tests                                     |
| coreai-yfl.8 | Integration test with real git repo            |
| coreai-yfl.9 | Publish configuration + README                 |

---

## Archive

Original design: `docs/specs/archive/skills_instruction_layer.md`
