import type { MemorySegment, MemorySegmentType } from './public-types.js';

const TYPES: MemorySegmentType[] = [
  'system',
  'instruction',
  'context',
  'experience',
];

const PRIORITY_MIN = -100;
const PRIORITY_MAX = 100;

export function validateMemorySegment(seg: MemorySegment): void {
  if (!TYPES.includes(seg.type)) {
    throw new Error(`Invalid MemorySegment.type: ${String(seg.type)}`);
  }
  if (typeof seg.content !== 'string' || seg.content.trim().length === 0) {
    throw new Error('MemorySegment.content must be a non-empty string');
  }
  const p = seg.priority ?? 0;
  if (typeof p !== 'number' || p < PRIORITY_MIN || p > PRIORITY_MAX) {
    throw new Error(
      `MemorySegment.priority must be between ${PRIORITY_MIN} and ${PRIORITY_MAX}`,
    );
  }
}

export function normaliseSegmentSource(
  seg: MemorySegment,
  pluginName: string,
): void {
  if (!seg.source?.trim()) {
    seg.source = pluginName;
  }
  if (seg.priority === undefined) {
    seg.priority = 0;
  }
}
