import type { CompressionSummary, ConversationMessage } from './domain.js';
import type {
  HostRuntimeContext,
  MemorySegment,
  MemorySegmentType,
} from './public-types.js';
import { validateMemorySegment } from './validate-segment.js';

/** Threshold at which older conversation segments are compressed. */
export const COMPRESSION_THRESHOLD = 30;

/** Number of recent messages to always keep uncompressed. */
export const RECENT_MESSAGES_TO_KEEP = 10;

const TYPE_ORDER: Record<MemorySegmentType, number> = {
  system: 0,
  instruction: 1,
  context: 2,
  experience: 3,
};

export interface BuiltContext {
  prompt: string;
  compressionApplied: boolean;
  messageCount: number;
}

/**
 * Sort segments: priority DESC, then type precedence
 * system > instruction > context > experience.
 */
export function sortMemorySegments(segments: MemorySegment[]): MemorySegment[] {
  return [...segments].sort((a, b) => {
    const pa = a.priority ?? 0;
    const pb = b.priority ?? 0;
    if (pb !== pa) return pb - pa;
    return TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
  });
}

/** Basic runtime-owned dedupe: drop adjacent duplicate contents (same string). */
export function dedupeAdjacentSegments(
  segments: MemorySegment[],
): MemorySegment[] {
  const out: MemorySegment[] = [];
  let prev: string | undefined;
  for (const s of segments) {
    const c = s.content.trim();
    if (c === prev) continue;
    prev = c;
    out.push(s);
  }
  return out;
}

export function shouldCompress(messages: ConversationMessage[]): boolean {
  return messages.length >= COMPRESSION_THRESHOLD;
}

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

/**
 * Assembles the prompt from sorted memory segments, then compression summaries,
 * then recent conversation — same ordering spirit as v2 `buildContext`.
 */
export function buildPromptContext(ctx: HostRuntimeContext): BuiltContext {
  const sorted = dedupeAdjacentSegments(sortMemorySegments(ctx.memorySegments));
  const sections: string[] = [];

  if (sorted.length > 0) {
    sections.push(...sorted.map((s) => s.content.trim()));
  }

  if (ctx.compressionSummaries.length > 0) {
    const summaryText = ctx.compressionSummaries
      .map(formatCompressionSummary)
      .join('\n\n');
    sections.push('## Conversation History (Summarised)\n\n' + summaryText);
  }

  const recentMessages = ctx.conversation.slice(-RECENT_MESSAGES_TO_KEEP);
  if (recentMessages.length > 0) {
    const messageText = recentMessages.map(formatMessage).join('\n');
    sections.push('## Recent Conversation\n\n' + messageText);
  }

  const prompt = sections.join('\n\n---\n\n');
  ctx.promptSegments = [prompt];

  return {
    prompt,
    compressionApplied: (ctx.compressionSummaries?.length ?? 0) > 0,
    messageCount: ctx.conversation.length,
  };
}

/** Validate every segment after compose hooks. */
export function validateAllMemorySegments(segments: MemorySegment[]): void {
  for (const s of segments) {
    validateMemorySegment(s);
  }
}
