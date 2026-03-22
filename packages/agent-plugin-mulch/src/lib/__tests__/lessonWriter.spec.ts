import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import type { MulchLesson } from '@conscius/runtime';
import { writeMulchLesson } from '../lessonWriter.js';

describe('writeMulchLesson', () => {
  let tempRoot: string;

  beforeEach(async () => {
    tempRoot = await mkdtemp(join(tmpdir(), 'mulch-writer-'));
  });

  afterEach(async () => {
    await rm(tempRoot, { recursive: true, force: true });
  });

  it('creates the mulch directory and appends a JSONL lesson record', async () => {
    const lesson: MulchLesson = {
      id: 'lesson-1',
      topic: 'typescript',
      summary: 'Jest tsconfig needs customConditions set to null',
      recommendation: 'Override customConditions in tsconfig.spec.json',
      created: '2026-03-17T00:00:00.000Z',
      type: 'failure',
      classification: 'tactical',
      tags: ['jest', 'typescript'],
    };

    await writeMulchLesson(lesson, tempRoot);

    const fileContents = await readFile(
      join(tempRoot, '.mulch', 'candidates.jsonl'),
      'utf8',
    );

    expect(fileContents).toBe(`${JSON.stringify(lesson)}\n`);
  });

  it('appends without overwriting existing JSONL records', async () => {
    const first: MulchLesson = {
      id: 'lesson-1',
      topic: 'typescript',
      summary: 'Manual promise wrappers keep Jest mocks stable',
      recommendation: 'Avoid util.promisify for execFile in tests',
      created: '2026-03-17T00:00:00.000Z',
    };
    const second: MulchLesson = {
      id: 'lesson-2',
      topic: 'mulch',
      summary: 'Writer remains explicit until session-end lesson source exists',
      recommendation: 'Call writeMulchLesson directly from explicit workflows',
      created: '2026-03-17T00:05:00.000Z',
    };

    await writeMulchLesson(first, tempRoot);
    await writeMulchLesson(second, tempRoot);

    const fileContents = await readFile(
      join(tempRoot, '.mulch', 'candidates.jsonl'),
      'utf8',
    );

    expect(fileContents).toBe(
      `${JSON.stringify(first)}\n${JSON.stringify(second)}\n`,
    );
  });

  it('fails when required fields are missing', async () => {
    await expect(
      writeMulchLesson(
        {
          id: 'lesson-1',
          topic: 'typescript',
          summary: '',
          recommendation: 'Add a proper summary before writing',
          created: '2026-03-17T00:00:00.000Z',
        },
        tempRoot,
      ),
    ).rejects.toThrow('writeMulchLesson: summary is required');
  });

  it('fails when created is not a valid ISO 8601 string', async () => {
    await expect(
      writeMulchLesson(
        {
          id: 'lesson-1',
          topic: 'typescript',
          summary: 'Bad timestamp example',
          recommendation: 'Use an ISO 8601 created value',
          created: 'not-a-date',
        },
        tempRoot,
      ),
    ).rejects.toThrow(
      'writeMulchLesson: created must be a valid ISO 8601 string',
    );
  });

  it('fails when type is not a valid ml record type', async () => {
    await expect(
      writeMulchLesson(
        {
          id: 'lesson-1',
          topic: 'typescript',
          summary: 'Bad type example',
          recommendation: 'Use a valid ml record type',
          created: '2026-03-17T00:00:00.000Z',
          type: 'bug-pattern' as never,
        },
        tempRoot,
      ),
    ).rejects.toThrow(
      'writeMulchLesson: type "bug-pattern" is not a valid ml record type',
    );
  });
});
