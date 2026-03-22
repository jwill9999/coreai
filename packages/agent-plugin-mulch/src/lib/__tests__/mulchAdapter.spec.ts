import { execFile } from 'node:child_process';
import { access } from 'node:fs/promises';
import {
  assertMlRunnable,
  queryMulch,
  resolveMlExecutable,
  runMlInit,
  runMlPrime,
} from '../mulchAdapter.js';

jest.mock('node:child_process');
jest.mock('node:fs/promises', () => ({
  ...jest.requireActual('node:fs/promises'),
  access: jest.fn(),
}));

const mockExecFile = execFile as jest.MockedFunction<typeof execFile>;
const mockAccess = access as jest.MockedFunction<typeof access>;

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

function mockExecFileError(error: Error) {
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

describe('resolveMlExecutable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env['PATH'] = '/usr/local/bin:/opt/homebrew/bin';
  });

  it('finds ml on PATH', async () => {
    mockAccess.mockImplementation(async (path) => {
      if (String(path).endsWith('/usr/local/bin/ml')) {
        return;
      }
      throw Object.assign(new Error('not found'), { code: 'ENOENT' });
    });

    const result = await resolveMlExecutable();
    expect(result).toBe('/usr/local/bin/ml');
  });

  it('throws with install instructions when ml is not on PATH', async () => {
    mockAccess.mockRejectedValue(
      Object.assign(new Error('not found'), { code: 'ENOENT' }),
    );

    await expect(resolveMlExecutable()).rejects.toThrow(
      'agent-plugin-mulch: ml is required but was not found on PATH',
    );
    await expect(resolveMlExecutable()).rejects.toThrow(
      'npm install -g @os-eco/mulch-cli',
    );
  });

  it('throws when PATH is empty', async () => {
    delete process.env['PATH'];

    await expect(resolveMlExecutable()).rejects.toThrow(
      'agent-plugin-mulch: ml is required but was not found on PATH',
    );
  });
});

describe('assertMlRunnable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('succeeds when ml --version executes', async () => {
    mockExecFileSuccess('0.6.3');

    await expect(
      assertMlRunnable('/usr/local/bin/ml'),
    ).resolves.toBeUndefined();
  });

  it('throws with bun install instructions when bun is missing', async () => {
    mockExecFileError(new Error('env: bun: No such file or directory'));

    await expect(assertMlRunnable('/usr/local/bin/ml')).rejects.toThrow(
      'agent-plugin-mulch: ml requires Bun to run',
    );
    await expect(assertMlRunnable('/usr/local/bin/ml')).rejects.toThrow(
      'curl -fsSL https://bun.sh/install | bash',
    );
  });

  it('throws with bun install instructions on ENOENT', async () => {
    const error = Object.assign(new Error('spawn bun ENOENT'), {
      code: 'ENOENT',
      syscall: 'spawn',
      path: 'bun',
    });
    mockExecFileError(error);

    await expect(assertMlRunnable('/usr/local/bin/ml')).rejects.toThrow(
      'agent-plugin-mulch: ml requires Bun to run',
    );
  });

  it('re-throws non-bun errors as-is', async () => {
    mockExecFileError(new Error('permission denied'));

    await expect(assertMlRunnable('/usr/local/bin/ml')).rejects.toThrow(
      'permission denied',
    );
  });
});

describe('runMlInit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls ml init with the correct cwd and timeout', async () => {
    mockExecFileSuccess('');

    await runMlInit('/usr/local/bin/ml', '/repo');

    expect(mockExecFile).toHaveBeenCalledWith(
      '/usr/local/bin/ml',
      ['init'],
      expect.objectContaining({ cwd: '/repo', timeout: 10_000 }),
      expect.any(Function),
    );
  });

  it('throws with stderr on failure', async () => {
    mockExecFileError(new Error('config file corrupt'));

    await expect(runMlInit('/usr/local/bin/ml', '/repo')).rejects.toThrow(
      'agent-plugin-mulch: ml init failed in /repo',
    );
    await expect(runMlInit('/usr/local/bin/ml', '/repo')).rejects.toThrow(
      'config file corrupt',
    );
  });
});

describe('runMlPrime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls ml prime with no topic args', async () => {
    mockExecFileSuccess('## Experience\n\nSome lessons...');

    await runMlPrime('/usr/local/bin/ml', '/repo');

    expect(mockExecFile).toHaveBeenCalledWith(
      '/usr/local/bin/ml',
      ['prime'],
      expect.objectContaining({ cwd: '/repo' }),
      expect.any(Function),
    );
  });

  it('returns stdout as-is', async () => {
    mockExecFileSuccess('## Experience\n\nSome lessons...');

    const result = await runMlPrime('/usr/local/bin/ml', '/repo');
    expect(result).toBe('## Experience\n\nSome lessons...');
  });

  it('throws with stderr on failure', async () => {
    mockExecFileError(new Error('no expertise files found'));

    await expect(runMlPrime('/usr/local/bin/ml', '/repo')).rejects.toThrow(
      'agent-plugin-mulch: ml prime failed',
    );
  });
});

describe('queryMulch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env['PATH'] = '/usr/local/bin';
    mockAccess.mockImplementation(async (path) => {
      if (String(path).endsWith('/usr/local/bin/ml')) {
        return;
      }
      throw Object.assign(new Error('not found'), { code: 'ENOENT' });
    });
  });

  it('returns trimmed ml prime stdout', async () => {
    // First call: assertMlRunnable (ml --version)
    // Second call: runMlPrime (ml prime)
    let callCount = 0;
    mockExecFile.mockImplementation(
      (_cmd: unknown, _args: unknown, _opts: unknown, callback: unknown) => {
        callCount++;
        const stdout = callCount === 1 ? '0.6.3' : '## Lessons\n\nContent\n';
        (callback as (err: null, stdout: string, stderr: string) => void)(
          null,
          stdout,
          '',
        );
        return {} as ReturnType<typeof execFile>;
      },
    );

    const result = await queryMulch('/repo');
    expect(result).toBe('## Lessons\n\nContent');
  });

  it('propagates ml prime failures', async () => {
    let callCount = 0;
    mockExecFile.mockImplementation(
      (_cmd: unknown, _args: unknown, _opts: unknown, callback: unknown) => {
        callCount++;
        if (callCount === 1) {
          (callback as (err: null, stdout: string, stderr: string) => void)(
            null,
            '0.6.3',
            '',
          );
        } else {
          const error = Object.assign(new Error('no expertise files found'), {
            code: 1,
          });
          (callback as (err: Error, stdout: string, stderr: string) => void)(
            error,
            '',
            'no expertise files found',
          );
        }
        return {} as ReturnType<typeof execFile>;
      },
    );

    await expect(queryMulch('/repo')).rejects.toThrow(
      /agent-plugin-mulch: ml prime failed[\s\S]*no expertise files found/,
    );
  });
});
