import type { AgentConfig } from './domain.js';
import {
  COMPRESSION_THRESHOLD,
  RECENT_MESSAGES_TO_KEEP,
  buildPromptContext,
  getMessagesToCompress,
  shouldCompress,
  sortMemorySegments,
} from './memory-pipeline.js';
import { createHostRuntimeContext } from './host-context.js';

function makeHostContext(
  overrides: Partial<{
    memorySegments: import('./public-types.js').MemorySegment[];
    conversation: import('./domain.js').ConversationMessage[];
    compressionSummaries: import('./domain.js').CompressionSummary[];
  }> = {},
) {
  return createHostRuntimeContext({
    repoRoot: '/repo',
    config: {} as AgentConfig,
    ...overrides,
  });
}

describe('constants', () => {
  it('COMPRESSION_THRESHOLD is 30', () =>
    expect(COMPRESSION_THRESHOLD).toBe(30));
  it('RECENT_MESSAGES_TO_KEEP is 10', () =>
    expect(RECENT_MESSAGES_TO_KEEP).toBe(10));
});

describe('sortMemorySegments', () => {
  it('sorts by priority DESC then type order', () => {
    const sorted = sortMemorySegments([
      { type: 'experience', content: 'e', priority: 0 },
      { type: 'system', content: 's', priority: 0 },
      { type: 'context', content: 'c', priority: 5 },
    ]);
    expect(sorted.map((x) => x.content)).toEqual(['c', 's', 'e']);
  });
});

describe('buildPromptContext', () => {
  it('returns empty prompt for empty context', () => {
    const ctx = makeHostContext();
    const result = buildPromptContext(ctx);
    expect(result.prompt).toBe('');
    expect(result.compressionApplied).toBe(false);
    expect(result.messageCount).toBe(0);
  });

  it('includes memory segment contents', () => {
    const ctx = makeHostContext({
      memorySegments: [
        { type: 'instruction', content: '## Skills' },
        { type: 'context', content: '## Session' },
      ],
    });
    const result = buildPromptContext(ctx);
    expect(result.prompt).toContain('## Skills');
    expect(result.prompt).toContain('## Session');
  });

  it('includes compression summaries under a heading', () => {
    const ctx = makeHostContext({
      compressionSummaries: [
        {
          segmentIndex: 0,
          topic: 'Auth',
          keyDecisions: ['Use JWT'],
          constraints: [],
          outcome: 'Done',
        },
      ],
    });
    const result = buildPromptContext(ctx);
    expect(result.prompt).toContain('## Conversation History (Summarised)');
    expect(result.prompt).toContain('Segment 0: Auth');
    expect(result.prompt).toContain('Use JWT');
  });

  it('sets compressionApplied true when summaries are present', () => {
    const ctx = makeHostContext({
      compressionSummaries: [
        {
          segmentIndex: 0,
          topic: 'T',
          keyDecisions: [],
          constraints: [],
          outcome: 'O',
        },
      ],
    });
    const result = buildPromptContext(ctx);
    expect(result.compressionApplied).toBe(true);
  });

  it('only includes last RECENT_MESSAGES_TO_KEEP messages', () => {
    const conversation = Array.from({ length: 15 }, (_, i) => ({
      role: 'user' as const,
      content: `msg-${i}`,
    }));
    const ctx = makeHostContext({ conversation });
    const result = buildPromptContext(ctx);
    expect(result.prompt).not.toContain('msg-0');
    expect(result.prompt).toContain('msg-14');
    expect(result.messageCount).toBe(15);
  });

  it('joins sections with --- separator', () => {
    const ctx = makeHostContext({
      memorySegments: [{ type: 'context', content: 'seg' }],
      conversation: [{ role: 'user', content: 'hi' }],
    });
    const result = buildPromptContext(ctx);
    expect(result.prompt).toContain('---');
  });

  it('formats compression summary with constraints', () => {
    const ctx = makeHostContext({
      compressionSummaries: [
        {
          segmentIndex: 1,
          topic: 'Build',
          keyDecisions: [],
          constraints: ['Node 24 required'],
          outcome: 'Configured',
        },
      ],
    });
    const result = buildPromptContext(ctx);
    expect(result.prompt).toContain('Node 24 required');
    expect(result.prompt).toContain('Configured');
  });
});

describe('shouldCompress', () => {
  it('returns false when below threshold', () => {
    const msgs = Array.from({ length: COMPRESSION_THRESHOLD - 1 }, () => ({
      role: 'user' as const,
      content: 'x',
    }));
    expect(shouldCompress(msgs)).toBe(false);
  });

  it('returns true at exactly the threshold', () => {
    const msgs = Array.from({ length: COMPRESSION_THRESHOLD }, () => ({
      role: 'user' as const,
      content: 'x',
    }));
    expect(shouldCompress(msgs)).toBe(true);
  });

  it('returns true above the threshold', () => {
    const msgs = Array.from({ length: COMPRESSION_THRESHOLD + 5 }, () => ({
      role: 'user' as const,
      content: 'x',
    }));
    expect(shouldCompress(msgs)).toBe(true);
  });

  it('returns false for empty array', () => {
    expect(shouldCompress([])).toBe(false);
  });
});

describe('getMessagesToCompress', () => {
  it('returns empty array when conversation is at or below RECENT_MESSAGES_TO_KEEP', () => {
    const msgs = Array.from({ length: RECENT_MESSAGES_TO_KEEP }, () => ({
      role: 'user' as const,
      content: 'x',
    }));
    expect(getMessagesToCompress(msgs)).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(getMessagesToCompress([])).toEqual([]);
  });

  it('returns all but last RECENT_MESSAGES_TO_KEEP messages', () => {
    const msgs = Array.from({ length: 15 }, (_, i) => ({
      role: 'user' as const,
      content: `msg-${i}`,
    }));
    const toCompress = getMessagesToCompress(msgs);
    expect(toCompress).toHaveLength(15 - RECENT_MESSAGES_TO_KEEP);
    expect(toCompress[0].content).toBe('msg-0');
    expect(toCompress[toCompress.length - 1].content).toBe(
      `msg-${15 - RECENT_MESSAGES_TO_KEEP - 1}`,
    );
  });
});
