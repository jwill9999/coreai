# Plugin Contract v3

## Hooks

- onSessionStart(ctx)
- onMemoryCompose(ctx)
- onPromptBuild(ctx)
- onSessionEnd(ctx)

## MemorySegment

type MemorySegment = {
type: 'instruction' | 'experience' | 'context' | 'system'
content: string
priority?: number
}
