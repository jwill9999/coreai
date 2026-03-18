import { execFile } from 'node:child_process';
import { constants } from 'node:fs';
import { access, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { delimiter, join } from 'node:path';
import type { MulchLesson } from '@conscius/agent-types';

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === 'string')
  );
}

function isMulchLesson(value: unknown): value is MulchLesson {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const lesson = value as Record<string, unknown>;

  return (
    typeof lesson['id'] === 'string' &&
    typeof lesson['topic'] === 'string' &&
    typeof lesson['summary'] === 'string' &&
    typeof lesson['recommendation'] === 'string' &&
    typeof lesson['created'] === 'string' &&
    (lesson['task_id'] === undefined ||
      typeof lesson['task_id'] === 'string') &&
    (lesson['files'] === undefined || isStringArray(lesson['files'])) &&
    (lesson['tags'] === undefined || isStringArray(lesson['tags'])) &&
    (lesson['service'] === undefined || typeof lesson['service'] === 'string')
  );
}

function parseLesson(value: unknown, source: string): MulchLesson {
  if (!isMulchLesson(value)) {
    throw new Error(`queryMulch: invalid lesson in ${source}`);
  }

  return value;
}

function parseMulchOutput(output: string, source: string): MulchLesson[] {
  const trimmed = output.trim();

  if (!trimmed) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      return parsed.map((entry, index) =>
        parseLesson(entry, `${source} entry ${index + 1}`),
      );
    }

    return [parseLesson(parsed, source)];
  } catch {
    // Not a single top-level JSON value — fall back to JSONL parsing below.
  }

  return trimmed
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line, index) =>
      parseLesson(JSON.parse(line), `${source} line ${index + 1}`),
    );
}

function matchesTopic(lesson: MulchLesson, topic: string): boolean {
  const query = topic.toLowerCase();
  return (
    lesson.topic.toLowerCase().includes(query) ||
    lesson.summary.toLowerCase().includes(query)
  );
}

function assertSafeTopic(topic: string): void {
  const hasControlCharacter = [...topic].some((character) => {
    const codePoint = character.codePointAt(0);
    return (
      codePoint !== undefined &&
      ((codePoint >= 0 && codePoint <= 31) || codePoint === 127)
    );
  });

  if (hasControlCharacter) {
    throw new Error(
      'queryMulch: topic contains unsupported control characters',
    );
  }
}

function createCommandNotFoundError(): NodeJS.ErrnoException & {
  syscall?: string;
  path?: string;
  spawnargs?: string[];
} {
  const error = new Error(
    'mulch executable not found',
  ) as NodeJS.ErrnoException & {
    syscall?: string;
    path?: string;
    spawnargs?: string[];
  };

  error.code = 'ENOENT';
  error.syscall = 'spawn';
  error.path = 'mulch';
  error.spawnargs = ['mulch'];

  return error;
}

async function resolveMulchExecutable(): Promise<string> {
  const searchPath = process.env['PATH'];

  if (!searchPath) {
    throw createCommandNotFoundError();
  }

  for (const directory of searchPath.split(delimiter)) {
    if (!directory) {
      continue;
    }

    const candidate = join(directory, 'mulch');

    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Keep searching PATH entries for an executable mulch binary.
    }
  }

  throw createCommandNotFoundError();
}

async function runMulchSearch(
  topic: string,
  repoRoot: string,
): Promise<string> {
  const mulchExecutable = await resolveMulchExecutable();

  return new Promise((resolve, reject) => {
    // execFile runs without a shell, so argument handling stays literal.
    execFile(
      mulchExecutable,
      ['search', topic],
      { cwd: repoRoot },
      (err, stdout) => {
        if (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        } else {
          resolve(String(stdout));
        }
      },
    );
  });
}

function isCommandNotFound(err: unknown): boolean {
  if (!err || typeof err !== 'object') {
    return false;
  }

  const execError = err as NodeJS.ErrnoException & {
    syscall?: string;
    path?: string;
    spawnargs?: string[];
  };

  if (execError.code === 'ENOENT') {
    const isSpawnSyscall =
      execError.syscall === 'spawn mulch' || execError.syscall === 'spawn';
    const isMulchPath =
      execError.path === 'mulch' || execError.path?.endsWith('/mulch') === true;
    const isMulchSpawnArg = Array.isArray(execError.spawnargs)
      ? execError.spawnargs[0] === 'mulch' ||
        execError.spawnargs[0]?.endsWith('/mulch') === true
      : false;

    if (isSpawnSyscall && (isMulchPath || isMulchSpawnArg)) {
      return true;
    }

    return false;
  }

  const { message } = execError;

  if (typeof message === 'string') {
    const mentionsMulch = message.includes('mulch');
    const mentionsNotFound =
      message.includes('command not found') || message.includes('ENOENT');

    if (mentionsMulch && mentionsNotFound) {
      return true;
    }
  }

  return false;
}

async function readMulchFile(
  filePath: string,
  topic: string,
): Promise<MulchLesson[]> {
  try {
    const content = await readFile(filePath, 'utf8');
    return parseMulchOutput(content, filePath).filter((lesson) =>
      matchesTopic(lesson, topic),
    );
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw err;
  }
}

export async function queryMulch(
  topic: string,
  repoRoot: string,
): Promise<MulchLesson[]> {
  const trimmedTopic = topic.trim();

  if (!trimmedTopic) {
    throw new Error('queryMulch: topic must not be empty');
  }

  assertSafeTopic(trimmedTopic);

  try {
    const stdout = await runMulchSearch(trimmedTopic, repoRoot);
    return parseMulchOutput(stdout, `mulch search ${trimmedTopic}`);
  } catch (err) {
    if (!isCommandNotFound(err)) {
      throw err;
    }
  }

  const [projectLessons, globalLessons] = await Promise.all([
    readMulchFile(join(repoRoot, '.mulch', 'mulch.jsonl'), trimmedTopic),
    readMulchFile(join(homedir(), '.mulch', 'mulch.jsonl'), trimmedTopic),
  ]);

  const seenLessonIds = new Set<string>();

  return [...projectLessons, ...globalLessons].filter((lesson) => {
    if (seenLessonIds.has(lesson.id)) {
      return false;
    }

    seenLessonIds.add(lesson.id);
    return true;
  });
}
