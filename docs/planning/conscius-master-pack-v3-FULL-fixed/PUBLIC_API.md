# PUBLIC API (ENFORCED)

## Allowed exports ONLY

export {
createRuntime,
definePlugin,
} from './runtime'

export type {
RuntimeContext,
MemorySegment
} from './types'

DO NOT export:

- internal/\*
- plugin internals
