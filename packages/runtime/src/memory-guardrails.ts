import type { MemoryGuardrailsConfig } from './domain.js';
import type { MemorySegment } from './public-types.js';

/**
 * Built-in MVP deny substrings (always matched case-insensitively when guardrails are enabled).
 * Narrow, prompt-injection oriented; hosts can extend via `denySubstrings`.
 */
export const MVP_MEMORY_GUARDRAIL_DENY_SUBSTRINGS: readonly string[] = [
  'ignore previous instructions',
  'ignore all previous',
  'disregard the above',
  'disregard above instructions',
  'system override',
  'you are now in developer mode',
  'new instructions:',
];

/** True if `content` should be dropped (built-ins always case-insensitive; extras follow `caseInsensitive`). */
export function memorySegmentContentBlocked(
  content: string,
  builtins: readonly string[],
  extras: readonly string[],
  caseInsensitive: boolean,
): boolean {
  const hayLower = content.toLowerCase();
  for (const p of builtins) {
    const pat = p.trim().toLowerCase();
    if (pat.length > 0 && hayLower.includes(pat)) return true;
  }
  const hay = caseInsensitive ? hayLower : content;
  for (const p of extras) {
    const raw = p.trim();
    if (raw.length === 0) continue;
    const pat = caseInsensitive ? raw.toLowerCase() : raw;
    if (hay.includes(pat)) return true;
  }
  return false;
}

/**
 * Filter memory segments before prompt assembly. Does not mutate segment objects.
 * Always returns a **new array** (shallow copy of the list) so callers can assign
 * to `ctx.memorySegments` without aliasing the caller’s original array reference.
 * Dropped count is `input.length - output.length`.
 */
export function applyMemorySegmentGuardrails(
  segments: MemorySegment[],
  config: MemoryGuardrailsConfig | undefined,
): { segments: MemorySegment[]; droppedCount: number } {
  if (!config?.enabled) {
    return { segments: segments.slice(), droppedCount: 0 };
  }

  const caseInsensitive = config.caseInsensitive !== false;
  const extras = config.denySubstrings ?? [];
  const builtins = MVP_MEMORY_GUARDRAIL_DENY_SUBSTRINGS;

  const out: MemorySegment[] = [];
  for (const seg of segments) {
    if (
      memorySegmentContentBlocked(
        seg.content,
        builtins,
        extras,
        caseInsensitive,
      )
    ) {
      continue;
    }
    out.push(seg);
  }

  return {
    segments: out,
    droppedCount: segments.length - out.length,
  };
}
