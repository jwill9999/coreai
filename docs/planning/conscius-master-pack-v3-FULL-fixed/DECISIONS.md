# DECISIONS (v3 — FIXED)

Public API MUST expose ONLY:

- createRuntime
- definePlugin
- RuntimeContext
- MemorySegment

definePlugin MUST be implemented as helper wrapper for plugin validation.

Index exports MUST be allow-listed only.
