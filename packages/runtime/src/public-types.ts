import type {
  AgentConfig,
  BeadsTask,
  CompressionSummary,
  ConversationMessage,
  MulchLesson,
} from './domain.js';

export type MemorySegmentType =
  | 'system'
  | 'instruction'
  | 'context'
  | 'experience';

export interface MemorySegment {
  type: MemorySegmentType;
  content: string;
  priority?: number;
  source?: string;
}

/**
 * Context passed to plugin hooks. Plugins must only mutate `memorySegments`
 * (and may update host fields such as `activeTask` when enriching metadata).
 */
export interface RuntimeContext {
  memorySegments: MemorySegment[];
  repoRoot: string;
  config: AgentConfig;
  activeTask?: BeadsTask;
  pendingMulchLessons?: MulchLesson[];
  conversation: ConversationMessage[];
  compressionSummaries: CompressionSummary[];
}

export type Plugin = {
  name: string;
  onSessionStart?: (ctx: RuntimeContext) => void | Promise<void>;
  onTaskStart?: (ctx: RuntimeContext) => void | Promise<void>;
  onMemoryCompose?: (ctx: RuntimeContext) => void | Promise<void>;
  onSessionEnd?: (ctx: RuntimeContext) => void | Promise<void>;
};

/**
 * Host / CLI session context: includes the internal prompt buffer used when
 * assembling the final prompt. Not passed to plugins.
 */
export type HostRuntimeContext = RuntimeContext & {
  promptSegments: string[];
};
