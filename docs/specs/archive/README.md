# Archive — Original Design Specs

These are the original architecture design documents written before implementation began. They represent **design intent**, not ground truth.

Where implementation deviated from these specs, the canonical reference is:

1. The **per-epic spec** in `docs/specs/` (single source of truth)
2. The **actual source code** in `packages/`
3. The **decisions log** in `SESSION.md`

| Original file                             | Superseded by                                                 |
| ----------------------------------------- | ------------------------------------------------------------- |
| `agent_architecture_overview.md`          | `docs/specs/e1-agent-types.md`, `docs/specs/e2-agent-core.md` |
| `agent_plugin_interface.md`               | `docs/specs/e2-agent-core.md`                                 |
| `AGENT_RUNTIME_FLOW.md`                   | `docs/specs/e2-agent-core.md`                                 |
| `ARCHITECTURE_DECISIONS.md`               | `docs/adr/`                                                   |
| `ECOSYSTEM_REPO_STRUCTURE.md`             | `docs/specs/e8-agent-stack-standard.md`                       |
| `mulch_experience_layer_spec.md`          | `docs/specs/e4-agent-plugin-mulch.md`                         |
| `layer4_conversation_compression_spec.md` | `docs/specs/e6-agent-plugin-compression.md`                   |
| `session_continuity_layer_spec_v2.md`     | `docs/specs/e5-agent-plugin-session.md`                       |
| `layer6_context_injection_hooks_spec.md`  | `docs/specs/e2-agent-core.md` (hook-runner)                   |
| `layer7_guardrails_quality_gates.md`      | `docs/specs/e7-agent-plugin-guardrails.md`                    |
| `skills_instruction_layer.md`             | `docs/specs/e9-skillshare.md`                                 |
