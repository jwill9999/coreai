# Specs

Per-epic implementation specifications. These are the **single source of truth** for what each epic builds and how.

## How to use these specs

- **Agents:** When working on a task, read the spec for that epic. The spec is linked in each Beads task via `external_ref` (`bd show <task-id>` shows it as `spec_path`).
- **Humans:** Read before starting an epic to understand scope, file structure, and acceptance criteria.
- **Review:** After implementation, compare the as-built result against the spec. Update the spec if the implementation intentionally diverged.

## Status key

| Status                 | Meaning                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `as-built`             | Complete. Spec reflects what was built.                           |
| `implementation brief` | Not started. Spec is the plan.                                    |
| `in-progress`          | Currently being built. Spec may be updated during implementation. |
| `frozen (pre-v3)`      | Do not implement as written; Beads epic closed; see v3 / Epic 11. |

---

## Epics

| Epic                                                              | Package                              | Status               | Beads ID   |
| ----------------------------------------------------------------- | ------------------------------------ | -------------------- | ---------- |
| [Runtime v3](./runtime-v3.md)                                     | `@conscius/runtime`, `@conscius/cli` | as-built (v3 landed) | coreai-d6k |
| [E1 — agent-types](./e1-agent-types.md)                           | `@conscius/agent-types`              | superseded by v3     | coreai-1ra |
| [E2 — agent-core](./e2-agent-core.md)                             | `@conscius/agent-core`               | superseded by v3     | coreai-nsn |
| [E3 — agent-plugin-beads](./e3-agent-plugin-beads.md)             | `@conscius/agent-plugin-beads`       | as-built ✅          | coreai-e2o |
| [E4 — agent-plugin-mulch](./e4-agent-plugin-mulch.md)             | `@conscius/agent-plugin-mulch`       | as-built ✅          | coreai-x3b |
| [E5 — agent-plugin-session](./e5-agent-plugin-session.md)         | `@conscius/agent-plugin-session`     | implementation brief | coreai-vq3 |
| [E6 — agent-plugin-compression](./e6-agent-plugin-compression.md) | `@conscius/agent-plugin-compression` | frozen (pre-v3)      | coreai-mbp |
| [E7 — agent-plugin-guardrails](./e7-agent-plugin-guardrails.md)   | `@conscius/agent-plugin-guardrails`  | frozen (pre-v3)      | coreai-7mm |
| [E8 — agent-stack-standard](./e8-agent-stack-standard.md)         | `@conscius/agent-stack-standard`     | frozen (pre-v3)      | coreai-zsh |
| [E9 — skillshare](./e9-skillshare.md)                             | `@conscius/skillshare`               | implementation brief | coreai-yfl |

---

## Archive

Original design documents (pre-implementation) are preserved in [`archive/`](./archive/README.md).
