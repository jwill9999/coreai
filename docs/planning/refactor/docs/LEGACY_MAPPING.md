# LEGACY → V3 MAPPING (FULL)

## PACKAGE MAPPING

agent-core → runtime/internal/core
agent-types → runtime/internal/types

plugins/\* → unchanged location BUT contract updated

---

## CONCEPT MAPPING

promptChunks → memorySegments

context builder → runtime memory pipeline

plugin prompt injection → plugin memorySegments

---

## RESPONSIBILITY SHIFT

BEFORE:

- Plugins shaped prompt
- Runtime executed

AFTER:

- Runtime shapes prompt
- Plugins supply structured memory

---

## EPIC ALIGNMENT

Agent Core → Runtime Core (internal)

Agent Types → Runtime Types (internal)

Context Builder → Memory Pipeline

Plugin System → Plugin Lifecycle

Memory System → Plugin-based providers

---

## RENAME RULES

promptChunks → memorySegments

agent-core → internal/core

agent-types → internal/types

context builder → runtime pipeline
