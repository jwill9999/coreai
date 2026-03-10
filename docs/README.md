# Conscius — Documentation

Welcome to the Conscius monorepo documentation. Conscius is a plugin-based framework that provides persistent cognitive context for AI agents — memory, session awareness, task tracking, and reusable skills.

---

## Navigation

### Guides

Developer how-to guides for integrating and extending Conscius.

| Guide                                          | Description                                    |
| ---------------------------------------------- | ---------------------------------------------- |
| [Getting started](./guides/getting-started.md) | Install, configure, and run your first session |
| [Adding a plugin](./guides/adding-a-plugin.md) | Scaffold and register a new Conscius plugin    |
| [Publishing packages](./guides/publishing.md)  | Pre-publish checklist and npm publish workflow |

---

### Architecture specs

Design artefacts produced during the architecture phase. These are reference documents — not tutorials.

| Spec                                                                                                                        | Description                                    |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [Architecture overview](./specs/agent_architecture_documentation_pack/agent_architecture_overview.md)                       | 7-layer system overview                        |
| [Plugin interface](./specs/agent_architecture_documentation_pack/agent_plugin_interface.md)                                 | `AgentPlugin` lifecycle hooks contract         |
| [Agent runtime flow](./specs/agent_architecture_documentation_pack/AGENT_RUNTIME_FLOW.md)                                   | How the runtime loads and orchestrates plugins |
| [Architecture decisions](./specs/agent_architecture_documentation_pack/ARCHITECTURE_DECISIONS.md)                           | High-level design decisions log                |
| [Ecosystem repo structure](./specs/agent_architecture_documentation_pack/ECOSYSTEM_REPO_STRUCTURE.md)                       | Package layout and naming                      |
| [Layer 4 — Conversation compression](./specs/agent_architecture_documentation_pack/layer4_conversation_compression_spec.md) | Ephemeral context summarisation                |
| [Layer 6 — Context injection hooks](./specs/agent_architecture_documentation_pack/layer6_context_injection_hooks_spec.md)   | Hook resolution and injection order            |
| [Layer 7 — Guardrails & quality gates](./specs/agent_architecture_documentation_pack/layer7_guardrails_quality_gates.md)    | Validation pipeline                            |
| [Mulch experience layer](./specs/agent_architecture_documentation_pack/mulch_experience_layer_spec.md)                      | Persistent lessons learned via mulch CLI       |
| [Session continuity layer](./specs/agent_architecture_documentation_pack/session_continuity_layer_spec_v2.md)               | SESSION.md read/write contract                 |
| [Skills & instruction layer](./specs/agent_architecture_documentation_pack/skills_instruction_layer.md)                     | How skills are discovered and injected         |

---

### Architecture Decision Records (ADRs)

Formal records of significant architectural decisions — why they were made, what was decided, and the trade-offs accepted.

| ADR                                        | Title                                    | Status   |
| ------------------------------------------ | ---------------------------------------- | -------- |
| [ADR-0001](./adr/0001-nx-monorepo.md)      | Use Nx for monorepo tooling              | accepted |
| [ADR-0002](./adr/0002-plugin-interface.md) | AgentPlugin lifecycle interface          | accepted |
| [ADR-0003](./adr/0003-conscius-rename.md)  | Rename project from @coreai to @conscius | accepted |

---

### API reference

Package-level API documentation for all published Conscius packages.

| Package                                         | Description                                        |
| ----------------------------------------------- | -------------------------------------------------- |
| [`@conscius/agent-types`](./api/agent-types.md) | Shared TypeScript types and interfaces             |
| [`@conscius/agent-core`](./api/agent-core.md)   | Core runtime — context builder, plugin loader, CLI |

---

### Planning

Feature tracking and backlog — managed by the `planning` skill.

| Document                                  | Description                                         |
| ----------------------------------------- | --------------------------------------------------- |
| [Planning workflow](./planning/README.md) | How to use the planning skill and Beads integration |
| [Feature index](./planning/index.md)      | Active and completed epics, features, and tasks     |
| [Backlog](./planning/backlog.md)          | Planned items not yet started                       |
