# BOUNDARIES (v3 — FULL)

## Runtime Responsibilities (MUST)

- Execute orchestration loop
- Collect memorySegments
- Sort memorySegments
- Build final prompt
- Apply compression
- Apply guardrails

## Plugin Responsibilities (ONLY)

- Add memorySegments
- Integrate external data
- Provide domain logic

## Forbidden for Plugins

- Direct prompt mutation
- Ordering logic
- Compression logic
- Guardrail logic
- Execution control

---

## Enforcement Rules

If a plugin:

- modifies prompt directly → INVALID
- bypasses memorySegments → INVALID
- introduces execution branching → INVALID

---

## Dependency Direction

Plugins → Runtime (only via API)
Runtime → Plugins (lifecycle only)

Never inverted.
