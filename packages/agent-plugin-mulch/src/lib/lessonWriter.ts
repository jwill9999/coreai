import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { MulchLesson } from '@conscius/agent-types';

const LEGACY_MULCH_DIR = '.mulch';
const LEGACY_MULCH_FILE = 'mulch.jsonl';

function assertRequiredString(
  value: string | undefined,
  field: keyof Pick<
    MulchLesson,
    'id' | 'topic' | 'summary' | 'recommendation' | 'created'
  >,
): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`writeMulchLesson: ${field} is required`);
  }
}

function validateLesson(lesson: MulchLesson): void {
  assertRequiredString(lesson.id, 'id');
  assertRequiredString(lesson.topic, 'topic');
  assertRequiredString(lesson.summary, 'summary');
  assertRequiredString(lesson.recommendation, 'recommendation');
  assertRequiredString(lesson.created, 'created');

  const ISO_8601_RE =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
  if (!ISO_8601_RE.test(lesson.created)) {
    throw new Error(
      'writeMulchLesson: created must be a valid ISO 8601 string',
    );
  }
}

/**
 * Writes an explicitly supplied lesson using the repository's current
 * transitional MulchLesson JSONL shape. Automatic lesson discovery for
 * onSessionEnd remains a separate concern.
 */
export async function writeMulchLesson(
  lesson: MulchLesson,
  repoRoot: string,
): Promise<void> {
  validateLesson(lesson);

  const mulchDir = join(repoRoot, LEGACY_MULCH_DIR);
  const mulchFile = join(mulchDir, LEGACY_MULCH_FILE);

  await mkdir(mulchDir, { recursive: true });
  await appendFile(mulchFile, `${JSON.stringify(lesson)}\n`, 'utf8');
}
