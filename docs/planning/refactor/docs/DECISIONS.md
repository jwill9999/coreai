# DECISIONS (v3 — FULL)

## Package Model

- There is exactly ONE public package:
  @conscius/runtime

- This is NOT a façade or re-export layer.
- This is a MERGED SOURCE TREE.

### Therefore:

- agent-core → removed as a package
- agent-types → removed as a package
- All code is moved internally into runtime

---

## Internal Structure

@conscius/runtime contains:

- /internal/core
- /internal/types
- /internal/plugin
- /internal/ordering
- /internal/compression
- /internal/guardrails

These are NOT publicly exposed.

---

## Public API (strict)

Only the following are allowed:

- createRuntime
- definePlugin
- RuntimeContext
- MemorySegment

Everything else is internal.

---

## Core Architectural Principle

Runtime = Brain
Plugins = Extensions

---

## Memory Model

promptChunks → DEPRECATED

memorySegments → REQUIRED

---

## Runtime Ownership

Runtime owns:

- Orchestration loop
- Memory composition
- Ordering
- Compression
- Guardrails

Plugins do NOT own these.

---

## Plugin Model

Plugins:

- Provide memorySegments
- React to lifecycle hooks
- Do NOT control execution

---

## Backwards Compatibility

- promptChunks supported via adapter
- Will be removed in v4
