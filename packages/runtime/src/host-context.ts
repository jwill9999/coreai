import type {
  AgentConfig,
  BeadsTask,
  CompressionSummary,
  ConversationMessage,
  MulchLesson,
} from './domain.js';
import type {
  HostRuntimeContext,
  MemorySegment,
  RuntimeContext,
} from './public-types.js';

export function createHostRuntimeContext(options: {
  repoRoot: string;
  config: AgentConfig;
  activeTask?: BeadsTask;
  pendingMulchLessons?: MulchLesson[];
  conversation?: ConversationMessage[];
  compressionSummaries?: CompressionSummary[];
  memorySegments?: MemorySegment[];
}): HostRuntimeContext {
  return {
    repoRoot: options.repoRoot,
    config: options.config,
    activeTask: options.activeTask,
    pendingMulchLessons: options.pendingMulchLessons ?? [],
    memorySegments: options.memorySegments ?? [],
    conversation: options.conversation ?? [],
    compressionSummaries: options.compressionSummaries ?? [],
    promptSegments: [],
  };
}

/** Strip internal fields before passing to plugins. */
export function toPluginContext(ctx: HostRuntimeContext): RuntimeContext {
  return {
    repoRoot: ctx.repoRoot,
    config: ctx.config,
    memorySegments: ctx.memorySegments,
    activeTask: ctx.activeTask,
    pendingMulchLessons: ctx.pendingMulchLessons,
    conversation: ctx.conversation,
    compressionSummaries: ctx.compressionSummaries,
  };
}
