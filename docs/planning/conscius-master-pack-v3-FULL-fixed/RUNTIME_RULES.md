# RUNTIME RULES

Runtime builds prompt from memorySegments ONLY.

Plugins:

- cannot modify promptSegments
- cannot override ordering

onPromptBuild hook is REMOVED to enforce this.
