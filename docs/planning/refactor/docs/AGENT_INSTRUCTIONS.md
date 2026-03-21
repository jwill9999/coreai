# AGENT INSTRUCTIONS (FULL)

## PHASE 0 — ANALYSE

- Read ALL documents
- Read LEGACY_MAPPING.md
- Build mapping of current repo

DO NOT START REFACTOR UNTIL COMPLETE

---

## PHASE 1 — PACKAGE RESTRUCTURE

- Remove agent-core
- Remove agent-types
- Create @conscius/runtime
- Move code into internal modules

---

## PHASE 2 — MEMORY MODEL

- Replace promptChunks
- Introduce memorySegments
- Add adapter layer

---

## PHASE 3 — PLUGIN SYSTEM

- Implement lifecycle hooks
- Update all plugins

---

## PHASE 4 — RUNTIME PIPELINE

- Implement ordering
- Implement compression (basic)
- Implement guardrails (basic)

---

## PHASE 5 — VALIDATION

- Ensure build passes
- Ensure plugins work
- Ensure no boundary violations

---

## CONSTRAINTS

- Do NOT expose internal modules
- Do NOT bypass memorySegments
- Do NOT change architecture

---

## DONE WHEN

- Runtime works end-to-end
- All legacy concepts replaced
- All tests pass (or stubbed)
