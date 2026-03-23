// ─── Mulch ────────────────────────────────────────────────────────────────────

/**
 * Record types from the upstream `ml` CLI.
 * Use this when writing lessons so that `ml record --type <value>` maps
 * directly from the staged candidate — no translation required.
 *
 * - `convention`  — stable project rules and norms
 * - `pattern`     — reusable implementation approaches
 * - `failure`     — mistakes and how to avoid them
 * - `decision`    — architectural choices and tradeoffs
 * - `reference`   — important files, endpoints, or resources
 * - `guide`       — recurring procedures and step-by-step workflows
 */
export const MULCH_LESSON_TYPES = [
  'convention',
  'pattern',
  'failure',
  'decision',
  'reference',
  'guide',
] as const;

export type MulchLessonType = (typeof MULCH_LESSON_TYPES)[number];

/**
 * Durability classification from the upstream `ml` CLI (`--classification`).
 *
 * - `foundational`   — long-lived, broadly reusable
 * - `tactical`       — useful for current architecture or tooling
 * - `observational`  — temporary findings likely to expire
 */
export const MULCH_LESSON_CLASSIFICATIONS = [
  'foundational',
  'tactical',
  'observational',
] as const;

export type MulchLessonClassification =
  (typeof MULCH_LESSON_CLASSIFICATIONS)[number];

export interface MulchLesson {
  id: string;
  topic: string;
  summary: string;
  recommendation: string;
  created: string;
  /**
   * Record type aligned with `ml record --type <value>`.
   * Required when writing new lessons; optional for reading legacy records.
   */
  type?: MulchLessonType;
  /**
   * Durability classification aligned with `ml record --classification`.
   * Optional — defaults to `tactical` if omitted when promoting via `ml`.
   */
  classification?: MulchLessonClassification;
  /** Free-form tags aligned with `ml record --tag`. Zero or more allowed. */
  tags?: string[];
  task_id?: string;
  files?: string[];
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

/**
 * Host-owned limits on **memory segments only** before `buildPromptContext` assembles
 * the prompt. Omitted fields mean no limit. No LLM use — drop lowest-priority
 * segments first, then hard-truncate a single oversized segment if needed.
 */
/**
 * MVP memory guardrails: substring checks only, no network / ML.
 * Enable with `{ enabled: true }` to apply built-in deny phrases plus optional extras.
 */
export interface MemoryGuardrailsConfig {
  /** When true, segments matching built-in or custom deny substrings are dropped. */
  enabled?: boolean;
  /** Additional deny substrings (substring match). */
  denySubstrings?: string[];
  /**
   * When true (default), custom `denySubstrings` are matched case-insensitively.
   * Built-in patterns are always case-insensitive.
   */
  caseInsensitive?: boolean;
}

export interface MemoryPromptLimits {
  /**
   * Max segments after sort + adjacent dedupe. Segments at the end of the ordered
   * list (lowest priority / weakest type tie-break) are dropped first.
   */
  maxSegments?: number;
  /**
   * Approximate token budget for the combined `content` of retained memory segments.
   * Tokens ≈ ceil(utf16 code units / 4); not a real tokenizer.
   */
  maxApproxTokens?: number;
}

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
  /** Optional caps on memory segments before prompt build (MVP compression). */
  memoryPromptLimits?: MemoryPromptLimits;
  /** Optional substring guardrails on memory segments before prompt build (MVP). */
  memoryGuardrails?: MemoryGuardrailsConfig;
}
