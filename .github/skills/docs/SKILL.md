---
name: docs
description: 'Create, update, audit, and maintain documentation for the Conscius monorepo. Use this skill when writing or editing guides, API references, Architecture Decision Records (ADRs), spec documents, package READMEs, or the docs index. Triggers on tasks involving docs, documentation, guides, ADRs, API reference, README updates, or doc audits. Supported slash commands: /new-guide, /update-guide, /new-adr, /update-adr, /new-api-ref, /docs-audit, /docs-index, /help /docs'
---

# Documentation Instructions

## Purpose

Maintain comprehensive, accurate, and up-to-date documentation for the Conscius monorepo — a plugin-based framework that provides persistent cognitive context for AI agents.

---

## Folder Structure

```
docs/
├── README.md                  # Navigation index — links to all docs
├── specs/                     # Architecture specification pack (design artefacts)
│   └── agent_architecture_documentation_pack/
├── guides/                    # Developer how-to guides
│   ├── getting-started.md
│   ├── adding-a-plugin.md
│   └── publishing.md
├── adr/                       # Architecture Decision Records
│   └── NNNN-<slug>.md
├── api/                       # Package-level API reference
│   ├── agent-types.md
│   └── agent-core.md
└── planning/                  # Feature index and backlog (managed by planning skill)
    ├── index.md
    └── backlog.md
```

| Folder           | Purpose                                              | Managed by            |
| ---------------- | ---------------------------------------------------- | --------------------- |
| `docs/README.md` | Navigation index                                     | `/docs-index`         |
| `docs/guides/`   | Developer and user how-to guides                     | `/new-guide`          |
| `docs/adr/`      | Architecture Decision Records                        | `/new-adr`            |
| `docs/api/`      | Package-level API reference                          | `/new-api-ref`        |
| `docs/specs/`    | Architecture spec pack — design artefacts, immutable | Manual / spec authors |
| `docs/planning/` | Feature index and backlog                            | `planning` skill      |

---

## Slash Commands

### `/new-guide`

Parameters: `name` (required), `description` (required), `audience` (developer/user, required), `relatedPackage` (optional)  
Action: Scaffold a new guide in `docs/guides/<slug>.md`. Prompt for missing details. Confirm with engineer before writing.  
Example: `/new-guide name="Adding a Plugin" description="How to scaffold and register a new Conscius plugin" audience=developer relatedPackage=agent-core`

### `/update-guide`

Parameters: `file` (required), `changes` (required description of what to update)  
Action: Locate the guide in `docs/guides/`, apply the requested changes. Confirm with engineer before saving.  
Example: `/update-guide file="getting-started.md" changes="Update install instructions for Node 24"`

### `/new-adr`

Parameters: `title` (required), `status` (proposed/accepted/deprecated/superseded, required), `context` (required), `decision` (required), `consequences` (required)  
Action: Auto-number the next ADR in `docs/adr/` (format: `NNNN-<slug>.md`), scaffold using the standard ADR template. Confirm with engineer before saving.  
Example: `/new-adr title="Use Nx for monorepo tooling" status=accepted context="Need a monorepo build system" decision="Adopt Nx with first-party plugins" consequences="Nx caching, affected commands, plugin ecosystem"`

### `/update-adr`

Parameters: `id` (required, e.g. `0001`), `changes` (required description)  
Action: Locate `docs/adr/NNNN-*.md`, apply changes (status change, addendum, supersession note). Confirm with engineer.  
Example: `/update-adr id=0001 changes="Mark as superseded by ADR-0005"`

### `/new-api-ref`

Parameters: `package` (required, e.g. `agent-core`), `description` (required summary of what to document)  
Action: Scaffold `docs/api/<package>.md` with exports, interfaces, and usage examples. Pull from source types where available. Confirm with engineer.  
Example: `/new-api-ref package=agent-core description="Document AgentContext, plugin lifecycle hooks, and CLI"`

### `/docs-audit`

Parameters: none  
Action: Review all `docs/` files for: stale `@coreai` references, broken internal links, missing sections, outdated version numbers, and out-of-sync package names. Produce a report listing file, issue, and recommended fix. Confirm with engineer before making changes.  
Example: `/docs-audit`

### `/docs-index`

Parameters: none  
Action: Regenerate `docs/README.md` with an up-to-date navigation table linking to all docs files grouped by category (Guides, Specs, ADRs, API Reference, Planning). Confirm with engineer before saving.  
Example: `/docs-index`

---

## Doc Types

### Guides (`docs/guides/`)

- Written for developers integrating or extending Conscius
- Use second-person present tense: "Run `npm install`…"
- Include: prerequisites, step-by-step instructions, and a working example
- Filename: kebab-case slug — e.g. `getting-started.md`, `adding-a-plugin.md`

### Architecture Decision Records (`docs/adr/`)

- Capture _why_ a decision was made, not just what was decided
- Immutable once accepted — use status changes and supersession rather than editing history
- Filename: `NNNN-<slug>.md` — e.g. `0001-nx-monorepo.md`, auto-numbered sequentially from `0001`

**Standard ADR template:**

```markdown
# ADR-NNNN: <Title>

**Date:** YYYY-MM-DD
**Status:** proposed | accepted | deprecated | superseded by ADR-XXXX

## Context

<What problem or situation required a decision>

## Decision

<What was decided>

## Consequences

<Trade-offs, implications, and follow-on actions>
```

### API Reference (`docs/api/`)

- One file per package (short name, e.g. `agent-core.md`, `agent-types.md`)
- Document all exported types, interfaces, classes, and functions
- Include TypeScript signatures and a short usage example per export

### Specs (`docs/specs/`)

- Architecture specification documents — design artefacts, not tutorials
- Created during design phase; referenced during implementation
- Do not edit retroactively — add an addendum or create a new spec version

---

## Writing Style

- Sentence case for headings (not Title Case)
- Code blocks with the correct language tag (`typescript`, `bash`, `json`)
- Short intro paragraphs — lead with the most important information
- Cross-reference related docs with relative markdown links
- Version numbers must reference the live npm badge URL, not hardcoded strings

---

## When to Update Docs

| Event                             | Action required                                   |
| --------------------------------- | ------------------------------------------------- |
| New package added                 | Add package README + `/new-api-ref`               |
| Plugin interface changes          | Update `docs/api/agent-core.md`, spec, and ADR    |
| Architectural decision made       | `/new-adr`                                        |
| Package renamed or restructured   | `/docs-audit` to catch stale references           |
| New developer workflow introduced | `/new-guide` or `/update-guide`                   |
| Epic completed                    | Update planning docs, close feature in `index.md` |

---

## AI Assistant Responsibilities

When working on this project:

- Run `/docs-audit` after any rename, restructure, or major refactor
- Create ADRs for significant architectural decisions (do not let them be undocumented)
- Update package READMEs when exports, interfaces, or usage patterns change
- Keep `docs/README.md` current — regenerate with `/docs-index` after structural changes
- Commit docs changes with: `docs(<scope>): <description>`

---

## Commit Format

`docs(<scope>): <description>`

Examples:

- `docs(guides): add getting-started guide`
- `docs(adr): add ADR-0003 plugin interface decision`
- `docs(api): update agent-core API reference for v0.3`
- `docs(audit): fix stale @coreai references across specs`
