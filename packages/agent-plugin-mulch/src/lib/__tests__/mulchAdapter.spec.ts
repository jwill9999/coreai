import { execFile } from 'node:child_process';
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { queryMulch } from '../mulchAdapter.js';

jest.mock('node:child_process');
jest.mock('node:fs/promises', () => ({
  ...jest.requireActual('node:fs/promises'),
  access: jest.fn(),
}));
jest.mock('node:os', () => ({
  ...jest.requireActual('node:os'),
  homedir: jest.fn(),
}));

const mockExecFile = execFile as jest.MockedFunction<typeof execFile>;
const mockAccess = access as jest.MockedFunction<typeof access>;
const mockHomedir = homedir as jest.MockedFunction<typeof homedir>;

function mockExecFileSuccess(stdout: string) {
  mockExecFile.mockImplementation(
    (_cmd: unknown, _args: unknown, _opts: unknown, callback: unknown) => {
      (callback as (err: null, stdout: string, stderr: string) => void)(
        null,
        stdout,
        '',
      );
      return {} as ReturnType<typeof execFile>;
    },
  );
}

function mockExecFileError(error: NodeJS.ErrnoException) {
  mockExecFile.mockImplementation(
    (_cmd: unknown, _args: unknown, _opts: unknown, callback: unknown) => {
      (callback as (err: Error, stdout: string, stderr: string) => void)(
        error,
        '',
        '',
      );
      return {} as ReturnType<typeof execFile>;
    },
  );
}

function createMulchNotFoundError(
  message = 'spawn mulch ENOENT',
): NodeJS.ErrnoException & {
  syscall?: string;
  path?: string;
  spawnargs?: string[];
} {
  const error = new Error(message) as NodeJS.ErrnoException & {
    syscall?: string;
    path?: string;
    spawnargs?: string[];
  };
  error.code = 'ENOENT';
  error.syscall = 'spawn';
  error.path = 'mulch';
  error.spawnargs = ['mulch', 'search', 'topic'];
  return error;
}

describe('queryMulch', () => {
  let tempRoot: string;
  let tempHome: string;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env['PATH'] = '/usr/local/bin:/opt/homebrew/bin';
    tempRoot = await mkdtemp(join(tmpdir(), 'mulch-root-'));
    tempHome = await mkdtemp(join(tmpdir(), 'mulch-home-'));
    mockHomedir.mockReturnValue(tempHome);
    mockAccess.mockImplementation(async (path) => {
      if (String(path).endsWith('/usr/local/bin/mulch')) {
        return;
      }

      throw Object.assign(new Error('not found'), { code: 'ENOENT' });
    });
  });

  afterEach(async () => {
    await Promise.all([
      rm(tempRoot, { recursive: true, force: true }),
      rm(tempHome, { recursive: true, force: true }),
    ]);
  });

  it('parses JSONL output from mulch search', async () => {
    mockExecFileSuccess(
      [
        JSON.stringify({
          id: 'lesson-1',
          topic: 'docker',
          summary: 'Docker cannot access localhost',
          recommendation: 'Use service names',
          created: '2026-03-07',
          tags: ['containers'],
        }),
        JSON.stringify({
          id: 'lesson-2',
          topic: 'docker networking',
          summary: 'Bridge networking needs aliases',
          recommendation: 'Add service aliases',
          created: '2026-03-08',
        }),
      ].join('\n'),
    );

    const lessons = await queryMulch('docker', tempRoot);

    expect(lessons).toEqual([
      {
        id: 'lesson-1',
        topic: 'docker',
        summary: 'Docker cannot access localhost',
        recommendation: 'Use service names',
        created: '2026-03-07',
        tags: ['containers'],
      },
      {
        id: 'lesson-2',
        topic: 'docker networking',
        summary: 'Bridge networking needs aliases',
        recommendation: 'Add service aliases',
        created: '2026-03-08',
      },
    ]);
  });

  it('parses JSON array output from mulch search', async () => {
    mockExecFileSuccess(
      JSON.stringify([
        {
          id: 'lesson-1',
          topic: 'docker',
          summary: 'Docker cannot access localhost',
          recommendation: 'Use service names',
          created: '2026-03-07',
          tags: ['containers'],
        },
        {
          id: 'lesson-2',
          topic: 'docker networking',
          summary: 'Bridge networking needs aliases',
          recommendation: 'Add service aliases',
          created: '2026-03-08',
        },
      ]),
    );

    const lessons = await queryMulch('docker', tempRoot);

    expect(lessons).toEqual([
      {
        id: 'lesson-1',
        topic: 'docker',
        summary: 'Docker cannot access localhost',
        recommendation: 'Use service names',
        created: '2026-03-07',
        tags: ['containers'],
      },
      {
        id: 'lesson-2',
        topic: 'docker networking',
        summary: 'Bridge networking needs aliases',
        recommendation: 'Add service aliases',
        created: '2026-03-08',
      },
    ]);
  });

  it('parses pretty-printed JSON array output from mulch search', async () => {
    mockExecFileSuccess(
      JSON.stringify(
        [
          {
            id: 'lesson-1',
            topic: 'docker',
            summary: 'Docker cannot access localhost',
            recommendation: 'Use service names',
            created: '2026-03-07',
          },
        ],
        null,
        2,
      ),
    );

    await expect(queryMulch('docker', tempRoot)).resolves.toEqual([
      {
        id: 'lesson-1',
        topic: 'docker',
        summary: 'Docker cannot access localhost',
        recommendation: 'Use service names',
        created: '2026-03-07',
      },
    ]);
  });

  it('parses single-object JSON output from mulch search', async () => {
    mockExecFileSuccess(
      JSON.stringify({
        id: 'lesson-1',
        topic: 'docker',
        summary: 'Docker cannot access localhost',
        recommendation: 'Use service names',
        created: '2026-03-07',
        tags: ['containers'],
      }),
    );

    const lessons = await queryMulch('docker', tempRoot);

    expect(lessons).toEqual([
      {
        id: 'lesson-1',
        topic: 'docker',
        summary: 'Docker cannot access localhost',
        recommendation: 'Use service names',
        created: '2026-03-07',
        tags: ['containers'],
      },
    ]);
  });

  it('calls mulch search with the expected arguments', async () => {
    mockExecFileSuccess(
      JSON.stringify({
        id: 'lesson-1',
        topic: 'jest',
        summary: 'Manual wrappers work better',
        recommendation: 'Avoid promisify',
        created: '2026-03-07',
      }),
    );

    await queryMulch('jest', tempRoot);

    expect(mockExecFile).toHaveBeenCalledWith(
      '/usr/local/bin/mulch',
      ['search', 'jest'],
      { cwd: tempRoot },
      expect.any(Function),
    );
  });

  it('returns an empty array for empty CLI output', async () => {
    mockExecFileSuccess('');

    await expect(queryMulch('typescript', tempRoot)).resolves.toEqual([]);
  });

  it('falls back to project and global JSONL files when mulch is unavailable', async () => {
    mockExecFileError(createMulchNotFoundError());

    await mkdir(join(tempRoot, '.mulch'), { recursive: true });
    await mkdir(join(tempHome, '.mulch'), { recursive: true });

    await writeFile(
      join(tempRoot, '.mulch', 'mulch.jsonl'),
      [
        JSON.stringify({
          id: 'project-non-match',
          topic: 'python',
          summary: 'Learn Python basics',
          recommendation: 'Use virtual environments',
          created: '2026-03-08',
        }),
        JSON.stringify({
          id: 'project-1',
          topic: 'typescript',
          summary: 'tsconfig.spec.json needs customConditions null',
          recommendation: 'Set customConditions to null in Jest config',
          created: '2026-03-09',
        }),
        JSON.stringify({
          id: 'shared-1',
          topic: 'typescript',
          summary: 'Project-specific lesson should win ordering',
          recommendation: 'Read project mulch before global mulch',
          created: '2026-03-10',
        }),
      ].join('\n'),
    );

    await writeFile(
      join(tempHome, '.mulch', 'mulch.jsonl'),
      [
        JSON.stringify({
          id: 'global-non-match',
          topic: 'ruby',
          summary: 'Bundler installation notes',
          recommendation: 'Use bundle exec',
          created: '2026-03-11',
        }),
        JSON.stringify({
          id: 'shared-1',
          topic: 'typescript',
          summary: 'Duplicate global lesson',
          recommendation: 'Should be deduplicated by id',
          created: '2026-03-11',
        }),
        JSON.stringify({
          id: 'global-1',
          topic: 'jest',
          summary: 'TypeScript tooling can fail under Jest mocks',
          recommendation: 'Use manual wrappers around execFile',
          created: '2026-03-12',
        }),
      ].join('\n'),
    );

    const lessons = await queryMulch('typescript', tempRoot);

    expect(lessons).toEqual([
      {
        id: 'project-1',
        topic: 'typescript',
        summary: 'tsconfig.spec.json needs customConditions null',
        recommendation: 'Set customConditions to null in Jest config',
        created: '2026-03-09',
      },
      {
        id: 'shared-1',
        topic: 'typescript',
        summary: 'Project-specific lesson should win ordering',
        recommendation: 'Read project mulch before global mulch',
        created: '2026-03-10',
      },
      {
        id: 'global-1',
        topic: 'jest',
        summary: 'TypeScript tooling can fail under Jest mocks',
        recommendation: 'Use manual wrappers around execFile',
        created: '2026-03-12',
      },
    ]);
    expect(lessons).toHaveLength(3);
    expect(
      lessons.some(
        (lesson) =>
          lesson.id === 'project-non-match' || lesson.id === 'global-non-match',
      ),
    ).toBe(false);
  });

  it('matches fallback lessons by topic or summary case-insensitively', async () => {
    mockExecFileError(createMulchNotFoundError('mulch: command not found'));

    await mkdir(join(tempHome, '.mulch'), { recursive: true });
    await writeFile(
      join(tempHome, '.mulch', 'mulch.jsonl'),
      [
        JSON.stringify({
          id: 'global-1',
          topic: 'Jest mocking',
          summary: 'Manual wrappers preserve behavior',
          recommendation: 'Use execFile wrappers',
          created: '2026-03-12',
        }),
        JSON.stringify({
          id: 'global-2',
          topic: 'node',
          summary: 'JEST transforms can affect util.promisify',
          recommendation: 'Avoid promisify in tests',
          created: '2026-03-13',
        }),
      ].join('\n'),
    );

    const lessons = await queryMulch('jest', tempRoot);

    expect(lessons.map((lesson) => lesson.id)).toEqual([
      'global-1',
      'global-2',
    ]);
  });

  it('falls back when the error message indicates mulch is unavailable', async () => {
    mockExecFileError(new Error('mulch: command not found'));

    await mkdir(join(tempHome, '.mulch'), { recursive: true });
    await writeFile(
      join(tempHome, '.mulch', 'mulch.jsonl'),
      JSON.stringify({
        id: 'global-1',
        topic: 'jest',
        summary: 'Fallback should still work',
        recommendation: 'Use local JSONL data',
        created: '2026-03-14',
      }),
    );

    await expect(queryMulch('jest', tempRoot)).resolves.toEqual([
      {
        id: 'global-1',
        topic: 'jest',
        summary: 'Fallback should still work',
        recommendation: 'Use local JSONL data',
        created: '2026-03-14',
      },
    ]);
  });

  it('throws when mulch returns malformed JSONL', async () => {
    mockExecFileSuccess(
      '{"id":"ok","topic":"docker","summary":"x","recommendation":"y","created":"2026-03-07"}\nnot-json',
    );

    await expect(queryMulch('docker', tempRoot)).rejects.toThrow();
  });

  it('throws when mulch returns an invalid lesson shape', async () => {
    mockExecFileSuccess(
      JSON.stringify({
        id: 'bad',
        topic: 'docker',
        summary: 'Missing recommendation',
        created: '2026-03-07',
      }),
    );

    await expect(queryMulch('docker', tempRoot)).rejects.toThrow(
      /invalid lesson/,
    );
  });

  it('preserves optional lesson fields when they are valid', async () => {
    mockExecFileSuccess(
      JSON.stringify({
        id: 'lesson-optional',
        topic: 'docker',
        summary: 'Optional fields are preserved',
        recommendation: 'Keep typed metadata',
        created: '2026-03-15',
        task_id: 'coreai-x3b.1',
        tags: ['docker', 'containers'],
        files: ['Dockerfile', 'docker-compose.yml'],
        service: 'agent-plugin-mulch',
      }),
    );

    await expect(queryMulch('docker', tempRoot)).resolves.toEqual([
      {
        id: 'lesson-optional',
        topic: 'docker',
        summary: 'Optional fields are preserved',
        recommendation: 'Keep typed metadata',
        created: '2026-03-15',
        task_id: 'coreai-x3b.1',
        tags: ['docker', 'containers'],
        files: ['Dockerfile', 'docker-compose.yml'],
        service: 'agent-plugin-mulch',
      },
    ]);
  });

  it('throws when optional fields have invalid shapes', async () => {
    mockExecFileSuccess(
      JSON.stringify({
        id: 'lesson-bad-optionals',
        topic: 'docker',
        summary: 'Optional fields are wrong',
        recommendation: 'This should fail',
        created: '2026-03-15',
        tags: 'not-an-array',
        files: [1, 2],
        service: 'agent-plugin-mulch',
      }),
    );

    await expect(queryMulch('docker', tempRoot)).rejects.toThrow(
      /invalid lesson/,
    );
  });

  it('propagates CLI execution errors when mulch exists but fails', async () => {
    mockExecFileError(new Error('mulch search failed'));

    await expect(queryMulch('docker', tempRoot)).rejects.toThrow(
      'mulch search failed',
    );
  });

  it('rejects an empty topic', async () => {
    await expect(queryMulch('   ', tempRoot)).rejects.toThrow(
      'queryMulch: topic must not be empty',
    );
  });

  it('rejects topics with control characters before invoking mulch', async () => {
    await expect(queryMulch('docker\nnetworking', tempRoot)).rejects.toThrow(
      'queryMulch: topic contains unsupported control characters',
    );
    expect(mockExecFile).not.toHaveBeenCalled();
  });
});
