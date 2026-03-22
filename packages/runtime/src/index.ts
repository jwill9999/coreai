export { createRuntime } from './create-runtime.js';
export { PluginLoader, resolvePluginSpecifier } from './plugin-loader.js';
export type { CreateRuntimeOptions } from './create-runtime.js';
export { definePlugin } from './define-plugin.js';
export { createHostRuntimeContext, toPluginContext } from './host-context.js';
export {
  HookRunner,
  DEFAULT_AGENT_CONFIG,
  HOOK_SCRIPT_NAMES,
} from './hook-runner.js';
export type { HookScriptKey } from './hook-runner.js';
export {
  buildPromptContext,
  sortMemorySegments,
  dedupeAdjacentSegments,
  shouldCompress,
  getMessagesToCompress,
  COMPRESSION_THRESHOLD,
  RECENT_MESSAGES_TO_KEEP,
} from './memory-pipeline.js';
export type { BuiltContext } from './memory-pipeline.js';
export { adaptLegacyPromptArrays } from './legacy-adapter.js';
export {
  validateMemorySegment,
  normaliseSegmentSource,
} from './validate-segment.js';
export { toMessage } from './utils.js';

export type {
  RuntimeContext,
  MemorySegment,
  MemorySegmentType,
  Plugin,
  HostRuntimeContext,
} from './public-types.js';

export type {
  AgentConfig,
  BeadsTask,
  BeadsTaskStatus,
  CompressionSummary,
  ConversationMessage,
  ConversationSegment,
  MulchLesson,
  MulchLessonClassification,
  MulchLessonType,
} from './domain.js';

export { MULCH_LESSON_TYPES, MULCH_LESSON_CLASSIFICATIONS } from './domain.js';
