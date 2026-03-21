import type { MemorySegment } from './public-types.js';

/**
 * Single legacy adapter: merges `promptChunks` then `promptSegments` into
 * structured memory segments (`type: context`, `priority: 0`).
 */
export function adaptLegacyPromptArrays(
  promptChunks: string[],
  promptSegments: string[],
): MemorySegment[] {
  const out: MemorySegment[] = [];
  for (const s of promptChunks) {
    const t = s.trim();
    if (t.length > 0) {
      out.push({ type: 'context', content: t, priority: 0 });
    }
  }
  for (const s of promptSegments) {
    const t = s.trim();
    if (t.length > 0) {
      out.push({ type: 'context', content: t, priority: 0 });
    }
  }
  return out;
}
