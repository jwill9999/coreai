import type {
  CompressionSummary,
  ConversationMessage,
  MemoryPromptLimits,
} from './domain.js';
import type {
  HostRuntimeContext,
  MemorySegment,
  MemorySegmentType,
} from './public-types.js';
import { applyMemorySegmentGuardrails } from './memory-guardrails.js';
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
  /** True when conversation compression summaries were included. */
  compressionApplied: boolean;
  /** True when `memoryPromptLimits` dropped or truncated memory segments. */
  memorySegmentTrimApplied: boolean;
  /** Count of memory segments dropped by `memoryGuardrails` before assembly. */
  guardrailsMemorySegmentsDropped: number;
  messageCount: number;
}

const TRUNCATION_MARKER = '\n[truncated]';

/** Approximate token count: ceil(code-unit length / 4). Deterministic, not a tokenizer. */
export function estimateApproxTokens(text: string): number {
  if (text.length === 0) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Apply segment-count and approximate-token caps after sort + dedupe.
 * Drops lowest-priority segments first (tail of `segments` array).
 */
export function trimMemorySegmentsForLimits(
  segments: MemorySegment[],
  limits: MemoryPromptLimits | undefined,
): { segments: MemorySegment[]; applied: boolean } {
  if (!limits) return { segments, applied: false };
  const { maxSegments, maxApproxTokens } = limits;
  if (maxSegments === undefined && maxApproxTokens === undefined) {
    return { segments, applied: false };
  }

  let out = segments;
  let applied = false;

  if (
    maxSegments !== undefined &&
    Number.isFinite(maxSegments) &&
    maxSegments >= 0 &&
    out.length > maxSegments
  ) {
    out = out.slice(0, maxSegments);
    applied = true;
  }

  if (
    maxApproxTokens !== undefined &&
    Number.isFinite(maxApproxTokens) &&
    maxApproxTokens >= 0
  ) {
    const budget = maxApproxTokens;
    const totalTok = () =>
      out.reduce((sum, s) => sum + estimateApproxTokens(s.content), 0);

    while (out.length > 0 && totalTok() > budget) {
      if (out.length > 1) {
        out = out.slice(0, -1);
        applied = true;
        continue;
      }
      const c = out[0].content;
      const room = Math.max(0, budget * 4 - TRUNCATION_MARKER.length);
      if (c.length > room) {
        const body = room > 0 ? c.slice(0, room) : '';
        const text = room > 0 ? body + TRUNCATION_MARKER : '';
        out = [{ ...out[0], content: text }];
        applied = true;
      }
      break;
    }
  }

  return { segments: out, applied };
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
  const gr = applyMemorySegmentGuardrails(
    ctx.memorySegments,
    ctx.config.memoryGuardrails,
  );
  ctx.memorySegments = gr.segments;
  const guardrailsMemorySegmentsDropped = gr.droppedCount;

  const sorted = dedupeAdjacentSegments(sortMemorySegments(ctx.memorySegments));
  const { segments: memoryForPrompt, applied: memorySegmentTrimApplied } =
    trimMemorySegmentsForLimits(sorted, ctx.config.memoryPromptLimits);
  const sections: string[] = [];

  if (memoryForPrompt.length > 0) {
    sections.push(...memoryForPrompt.map((s) => s.content.trim()));
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
    memorySegmentTrimApplied,
    guardrailsMemorySegmentsDropped,
    messageCount: ctx.conversation.length,
  };
}

/** Validate every segment after compose hooks. */
export function validateAllMemorySegments(segments: MemorySegment[]): void {
  for (const s of segments) {
    validateMemorySegment(s);
  }
}
