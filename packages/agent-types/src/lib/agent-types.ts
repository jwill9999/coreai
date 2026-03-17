// ─── Mulch ────────────────────────────────────────────────────────────────────

export interface MulchLesson {
  id: string;
  topic: string;
  summary: string;
  recommendation: string;
  created: string;
  task_id?: string;
  files?: string[];
  tags?: string[];
  service?: string;
}

// ─── Beads ────────────────────────────────────────────────────────────────────

export type BeadsTaskStatus =
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'blocked'
  | 'done';

export interface BeadsTask {
  id: string;
  title: string;
  status: BeadsTaskStatus;
  description?: string;
  specPath?: string;
  dependencies?: string[];
  assignee?: string;
}

// ─── Conversation compression ─────────────────────────────────────────────────

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ConversationSegment {
  index: number;
  topic: string;
  messages: ConversationMessage[];
}

export interface CompressionSummary {
  segmentIndex: number;
  topic: string;
  /** Key decisions made during this segment. */
  keyDecisions: string[];
  /** Technical or environmental constraints identified. */
  constraints: string[];
  /** Outcome or conclusion of the segment. */
  outcome: string;
}

// ─── Agent config (.agent/config.json) ────────────────────────────────────────

export interface AgentConfig {
  plugins?: string[];
  hooks?: {
    repoHooksDir?: string;
    globalHooksDir?: string;
  };
  permissions?: {
    /** Exact file paths or repo-rooted directory prefixes ending in `/`. */
    allowWrite?: string[];
  };
  /** Tracks first-run write approval per exact file path. */
  approvedWrites?: Record<string, boolean>;
}

// ─── Agent context (passed to every plugin hook) ──────────────────────────────

export interface AgentContext {
  /** Absolute path to the repository root. */
  repoRoot: string;
  config: AgentConfig;
  /** Active Beads task, if one is in progress. */
  activeTask?: BeadsTask;
  /** Explicit Mulch lessons queued for persistence at session end. */
  pendingMulchLessons?: MulchLesson[];
  /** Compiled prompt context segments for the current session. */
  promptSegments: string[];
  /** Full conversation history for the current session. */
  conversation: ConversationMessage[];
  /** Compression summaries replacing earlier conversation segments. */
  compressionSummaries: CompressionSummary[];
}

// ─── Plugin interface ─────────────────────────────────────────────────────────

export interface AgentPlugin {
  name: string;

  /** Called when a new agent session begins. Load baseline context here. */
  onSessionStart?(context: AgentContext): Promise<void>;

  /** Called when a Beads task becomes active. Inject task + spec context here. */
  onTaskStart?(context: AgentContext): Promise<void>;

  /**
   * Called when the conversation length exceeds the compression threshold
   * (typically 30–40 messages). Implement compression logic here.
   */
  onConversationThreshold?(context: AgentContext): Promise<void>;

  /** Called when an agent session ends. Persist session state here. */
  onSessionEnd?(context: AgentContext): Promise<void>;
}
