import type {
  AgentContext,
  CompressionSummary,
  ConversationMessage,
} from '@coreai/agent-types';

/** Threshold at which older conversation segments are compressed. */
export const COMPRESSION_THRESHOLD = 30;

/** Number of recent messages to always keep uncompressed. */
export const RECENT_MESSAGES_TO_KEEP = 10;

export interface BuiltContext {
  /** Fully assembled prompt string ready to send to the LLM. */
  prompt: string;
  /** Whether compression summaries have been applied to this context (i.e. older messages were previously summarised). */
  compressionApplied: boolean;
  /** Number of messages remaining after compression (if applied). */
  messageCount: number;
}

/**
 * Assembles the prompt in the canonical context injection order:
 *
 *   1. Prompt segments (populated by plugins: skills, SESSION.md, task metadata, etc.)
 *   2. Compression summaries (older conversation segments, summarised)
 *   3. Recent conversation messages (last RECENT_MESSAGES_TO_KEEP)
 *
 * Plugins are responsible for loading and appending their content to
 * `context.promptSegments` before this function is called.
 */
export function buildContext(context: AgentContext): BuiltContext {
  const sections: string[] = [];

  // 1. Prompt segments — each plugin appends its section here
  if (context.promptSegments.length > 0) {
    sections.push(...context.promptSegments);
  }

  // 2. Compression summaries (replacing older conversation segments)
  if (context.compressionSummaries.length > 0) {
    const summaryText = context.compressionSummaries
      .map(formatCompressionSummary)
      .join('\n\n');
    sections.push('## Conversation History (Summarised)\n\n' + summaryText);
  }

  // 3. Recent conversation messages
  const recentMessages = context.conversation.slice(-RECENT_MESSAGES_TO_KEEP);
  if (recentMessages.length > 0) {
    const messageText = recentMessages.map(formatMessage).join('\n');
    sections.push('## Recent Conversation\n\n' + messageText);
  }

  return {
    prompt: sections.join('\n\n---\n\n'),
    compressionApplied: (context.compressionSummaries?.length ?? 0) > 0,
    messageCount: context.conversation.length,
  };
}

/**
 * Determines whether the conversation has reached the compression threshold.
 * Call this before buildContext — if true, run the compression plugin first
 * via onConversationThreshold hooks.
 */
export function shouldCompress(messages: ConversationMessage[]): boolean {
  return messages.length >= COMPRESSION_THRESHOLD;
}

/**
 * Returns the messages that should be compressed (all but the most recent kept).
 * The caller (compression plugin) summarises these and replaces them with
 * a CompressionSummary, then removes them from context.conversation.
 */
export function getMessagesToCompress(
  messages: ConversationMessage[],
): ConversationMessage[] {
  if (messages.length <= RECENT_MESSAGES_TO_KEEP) return [];
  return messages.slice(0, messages.length - RECENT_MESSAGES_TO_KEEP);
}

function formatMessage(msg: ConversationMessage): string {
  return `**${msg.role}:** ${msg.content}`;
}

function formatCompressionSummary(summary: CompressionSummary): string {
  const lines: string[] = [
    `### Segment ${summary.segmentIndex}: ${summary.topic}`,
  ];
  if (summary.keyDecisions.length > 0) {
    lines.push(
      '**Key Decisions:**\n' +
        summary.keyDecisions.map((d) => `- ${d}`).join('\n'),
    );
  }
  if (summary.constraints.length > 0) {
    lines.push(
      '**Constraints:**\n' +
        summary.constraints.map((c) => `- ${c}`).join('\n'),
    );
  }
  lines.push(`**Outcome:** ${summary.outcome}`);
  return lines.join('\n');
}
