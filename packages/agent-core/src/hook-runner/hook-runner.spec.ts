import { join } from 'node:path';
import { HookRunner, DEFAULT_AGENT_CONFIG, HOOK_NAMES } from './hook-runner';
import type { AgentContext } from '@coreai/agent-types';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('node:fs/promises', () => ({
  access: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));

jest.mock('node:child_process', () => ({
  spawn: jest.fn(),
}));

jest.mock('node:os', () => ({
  homedir: jest.fn(() => '/home/user'),
}));

jest.mock('os', () => ({
  homedir: jest.fn(() => '/home/user'),
}));

import { access, readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { homedir } from 'node:os';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REPO = '/repo';

function makeContext(taskId?: string): AgentContext {
  return {
    repoRoot: REPO,
    config: {},
    promptSegments: [],
    conversation: [],
    compressionSummaries: [],
    ...(taskId
      ? {
          activeTask: {
            id: taskId,
            title: taskId,
            status: 'in_progress' as const,
          },
        }
      : {}),
  };
}

/** Makes spawn emit close(0) asynchronously. */
function mockSpawnSuccess(): void {
  (spawn as jest.Mock).mockReturnValue({
    on: jest.fn((event: string, cb: (code?: number) => void) => {
      if (event === 'close') process.nextTick(() => cb(0));
    }),
  });
}

/** Makes spawn emit close(1) asynchronously. */
function mockSpawnFailure(code = 1): void {
  (spawn as jest.Mock).mockReturnValue({
    on: jest.fn((event: string, cb: (code?: number) => void) => {
      if (event === 'close') process.nextTick(() => cb(code));
    }),
  });
}

// ─── HOOK_NAMES ───────────────────────────────────────────────────────────────

describe('HOOK_NAMES', () => {
  it('maps all four lifecycle methods', () => {
    expect(HOOK_NAMES.onSessionStart).toBe('session-start');
    expect(HOOK_NAMES.onTaskStart).toBe('task-start');
    expect(HOOK_NAMES.onConversationThreshold).toBe('conversation-threshold');
    expect(HOOK_NAMES.onSessionEnd).toBe('session-end');
  });
});

// ─── DEFAULT_AGENT_CONFIG ─────────────────────────────────────────────────────

describe('DEFAULT_AGENT_CONFIG', () => {
  it('has expected default hook dirs', () => {
    expect(DEFAULT_AGENT_CONFIG.hooks?.repoHooksDir).toBe('.agent/hooks');
    expect(DEFAULT_AGENT_CONFIG.hooks?.globalHooksDir).toBe('~/.agent/hooks');
  });

  it('allows writing to SESSION.md and .mulch/mulch.jsonl', () => {
    expect(DEFAULT_AGENT_CONFIG.permissions?.allowWrite).toContain(
      'SESSION.md',
    );
    expect(DEFAULT_AGENT_CONFIG.permissions?.allowWrite).toContain(
      '.mulch/mulch.jsonl',
    );
  });
});

// ─── resolveHook ──────────────────────────────────────────────────────────────

describe('HookRunner.resolveHook()', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (homedir as jest.Mock).mockReturnValue('/home/user');
  });

  it('returns null when no hook script exists', async () => {
    (access as jest.Mock).mockRejectedValue(new Error('ENOENT'));
    const runner = new HookRunner(REPO, DEFAULT_AGENT_CONFIG);
    const result = await runner.resolveHook('session-start');
    expect(result).toBeNull();
  });

  it('resolves the repo hook before the global hook', async () => {
    const repoHook = join(REPO, '.agent/hooks/session-start.sh');
    (access as jest.Mock).mockImplementation((p: string) =>
      p === repoHook ? Promise.resolve() : Promise.reject(new Error('ENOENT')),
    );
    const runner = new HookRunner(REPO, DEFAULT_AGENT_CONFIG);
    const result = await runner.resolveHook('session-start');
    expect(result).toBe(repoHook);
  });

  it('falls back to the global hook when no repo hook exists', async () => {
    const globalHook = '/home/user/.agent/hooks/session-start.sh';
    (access as jest.Mock).mockImplementation((p: string) =>
      p === globalHook
        ? Promise.resolve()
        : Promise.reject(new Error('ENOENT')),
    );
    const runner = new HookRunner(REPO, DEFAULT_AGENT_CONFIG);
    const result = await runner.resolveHook('session-start');
    expect(result).toBe(globalHook);
  });

  it('tries .sh first then .js then .mjs then .cjs', async () => {
    const jsHook = join(REPO, '.agent/hooks/task-start.js');
    (access as jest.Mock).mockImplementation((p: string) =>
      p === jsHook ? Promise.resolve() : Promise.reject(new Error('ENOENT')),
    );
    const runner = new HookRunner(REPO, DEFAULT_AGENT_CONFIG);
    const result = await runner.resolveHook('task-start');
    expect(result).toBe(jsHook);
  });
});

// ─── isApprovedWrite ──────────────────────────────────────────────────────────

describe('HookRunner.isApprovedWrite()', () => {
  it('returns true for a path explicitly approved in approvedWrites', () => {
    const runner = new HookRunner(REPO, {
      approvedWrites: { 'SESSION.md': true },
    });
    expect(runner.isApprovedWrite('SESSION.md')).toBe(true);
  });

  it('returns false for a path explicitly denied in approvedWrites', () => {
    const runner = new HookRunner(REPO, {
      approvedWrites: { 'SESSION.md': false },
    });
    expect(runner.isApprovedWrite('SESSION.md')).toBe(false);
  });

  it('falls back to permissions.allowWrite when not in approvedWrites', () => {
    const runner = new HookRunner(REPO, {
      permissions: { allowWrite: ['.mulch/mulch.jsonl'] },
    });
    expect(runner.isApprovedWrite('.mulch/mulch.jsonl')).toBe(true);
  });

  it('returns false for a path not in either list', () => {
    const runner = new HookRunner(REPO, DEFAULT_AGENT_CONFIG);
    expect(runner.isApprovedWrite('random.txt')).toBe(false);
  });

  it('returns false for an absolute path outside the repo', () => {
    const runner = new HookRunner(REPO, DEFAULT_AGENT_CONFIG);
    expect(runner.isApprovedWrite('/etc/passwd')).toBe(false);
  });
});

// ─── ensureConfig ─────────────────────────────────────────────────────────────

describe('HookRunner.ensureConfig()', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (homedir as jest.Mock).mockReturnValue('/home/user');
  });

  it('reads and parses an existing config file', async () => {
    const stored = {
      plugins: ['@coreai/plugin-beads'],
      hooks: {},
      permissions: {},
      approvedWrites: {},
    };
    (readFile as jest.Mock).mockResolvedValue(JSON.stringify(stored));
    const config = await HookRunner.ensureConfig(REPO);
    expect(config.plugins).toEqual(['@coreai/plugin-beads']);
  });

  it('returns default config in non-TTY environment when no config file exists', async () => {
    Object.defineProperty(process.stdin, 'isTTY', {
      value: false,
      configurable: true,
    });
    Object.defineProperty(process.stdout, 'isTTY', {
      value: false,
      configurable: true,
    });
    (readFile as jest.Mock).mockRejectedValue(new Error('ENOENT'));
    (mkdir as jest.Mock).mockResolvedValue(undefined);
    (writeFile as jest.Mock).mockResolvedValue(undefined);

    const config = await HookRunner.ensureConfig(REPO);

    expect(mkdir).toHaveBeenCalledWith(join(REPO, '.agent'), {
      recursive: true,
    });
    expect(writeFile).toHaveBeenCalled();
    expect(config.plugins).toEqual([]);
    expect(config.approvedWrites).toEqual({});
  });
});

// ─── runHook ──────────────────────────────────────────────────────────────────

describe('HookRunner.runHook()', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (homedir as jest.Mock).mockReturnValue('/home/user');
  });

  it('resolves silently when no hook script is found', async () => {
    (access as jest.Mock).mockRejectedValue(new Error('ENOENT'));
    const runner = new HookRunner(REPO, DEFAULT_AGENT_CONFIG);
    await expect(
      runner.runHook('session-start', makeContext()),
    ).resolves.toBeUndefined();
    expect(spawn).not.toHaveBeenCalled();
  });

  it('spawns sh for .sh hooks with correct cwd and env vars', async () => {
    const hookPath = join(REPO, '.agent/hooks/session-start.sh');
    (access as jest.Mock).mockImplementation((p: string) =>
      p === hookPath ? Promise.resolve() : Promise.reject(new Error('ENOENT')),
    );
    mockSpawnSuccess();

    const ctx = makeContext('task-123');
    const runner = new HookRunner(REPO, {
      ...DEFAULT_AGENT_CONFIG,
      approvedWrites: { 'SESSION.md': true },
    });
    await runner.runHook('session-start', ctx);

    expect(spawn).toHaveBeenCalledWith(
      'sh',
      [hookPath],
      expect.objectContaining({
        cwd: REPO,
        env: expect.objectContaining({
          AGENT_REPO_ROOT: REPO,
          AGENT_ACTIVE_TASK_ID: 'task-123',
          AGENT_APPROVED_WRITES: 'SESSION.md',
        }),
      }),
    );
  });

  it('rejects when the hook exits with a non-zero code', async () => {
    const hookPath = join(REPO, '.agent/hooks/session-start.sh');
    (access as jest.Mock).mockImplementation((p: string) =>
      p === hookPath ? Promise.resolve() : Promise.reject(new Error('ENOENT')),
    );
    mockSpawnFailure(2);

    const runner = new HookRunner(REPO, DEFAULT_AGENT_CONFIG);
    await expect(
      runner.runHook('session-start', makeContext()),
    ).rejects.toThrow('exited with code 2');
  });

  it('uses node to execute .js hooks', async () => {
    const hookPath = join(REPO, '.agent/hooks/session-start.js');
    (access as jest.Mock).mockImplementation((p: string) =>
      p === hookPath ? Promise.resolve() : Promise.reject(new Error('ENOENT')),
    );
    mockSpawnSuccess();

    const runner = new HookRunner(REPO, DEFAULT_AGENT_CONFIG);
    await runner.runHook('session-start', makeContext());

    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      [hookPath],
      expect.anything(),
    );
  });

  it('rejects when the resolved hook path is outside approved hook directories', async () => {
    const outsidePath = '/other-repo/.agent/hooks/session-start.sh';
    (access as jest.Mock).mockResolvedValue(undefined);

    const runner = new HookRunner(REPO, DEFAULT_AGENT_CONFIG);
    jest.spyOn(runner, 'resolveHook').mockResolvedValue(outsidePath);

    await expect(
      runner.runHook('session-start', makeContext()),
    ).rejects.toThrow('outside approved hook directories');
  });
});
