# PLUGIN CONTRACT (FULL)

## Hooks

onSessionStart(ctx)
onMemoryCompose(ctx)
onPromptBuild(ctx)
onSessionEnd(ctx)

---

## MemorySegment

type MemorySegment = {
type: 'system' | 'instruction' | 'context' | 'experience'
content: string
priority?: number
source?: string
}

---

## Rules

- Plugins MUST use memorySegments
- Plugins MUST NOT modify prompt directly
- Plugins MUST NOT control execution

---

## Ordering

Runtime sorts:

1. priority DESC
2. type order:
   system > instruction > context > experience
