import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { MULCH_LESSON_TYPES, type MulchLesson } from '@conscius/agent-types';

const MULCH_DIR = '.mulch';
/**
 * Agent-written lessons land here for human review before being promoted to
 * the live memory store (`.mulch/mulch.jsonl`) via `ml` or manual edit.
 */
const CANDIDATES_FILE = 'candidates.jsonl';

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

  if (
    lesson.type !== undefined &&
    !(MULCH_LESSON_TYPES as readonly string[]).includes(lesson.type)
  ) {
    throw new Error(
      `writeMulchLesson: type "${lesson.type}" is not a valid ml record type`,
    );
  }
}

/**
 * Stages an explicitly supplied lesson in `.mulch/candidates.jsonl` for
 * human review. Lessons must be promoted to `.mulch/mulch.jsonl` (via `ml`
 * or manual edit) before they influence future session context.
 */
export async function writeMulchLesson(
  lesson: MulchLesson,
  repoRoot: string,
): Promise<void> {
  validateLesson(lesson);

  const mulchDir = join(repoRoot, MULCH_DIR);
  const candidatesFile = join(mulchDir, CANDIDATES_FILE);

  await mkdir(mulchDir, { recursive: true });
  await appendFile(candidatesFile, `${JSON.stringify(lesson)}\n`, 'utf8');
}
