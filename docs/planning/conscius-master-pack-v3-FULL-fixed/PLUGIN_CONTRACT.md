# PLUGIN CONTRACT (SINGLE SOURCE)

## Hooks

- onSessionStart(ctx)
- onMemoryCompose(ctx)
- onSessionEnd(ctx)

## REMOVED

- onPromptBuild (deprecated to prevent prompt mutation)

## MemorySegment

type MemorySegment = {
type: 'system' | 'instruction' | 'context' | 'experience'
content: string
priority?: number
source?: string
}

## RULE

Plugins MUST NOT mutate promptSegments.
