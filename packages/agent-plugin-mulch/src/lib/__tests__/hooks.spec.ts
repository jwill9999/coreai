import { access } from 'node:fs/promises';
import type { RuntimeContext } from '@conscius/runtime';
import { mulchPlugin, ensureMlReady } from '../hooks.js';
import {
  assertMlRunnable,
  queryMulch,
  resolveMlExecutable,
  runMlInit,
} from '../mulchAdapter.js';

jest.mock('../mulchAdapter.js', () => ({
  resolveMlExecutable: jest.fn(),
  assertMlRunnable: jest.fn(),
  runMlInit: jest.fn(),
  queryMulch: jest.fn(),
}));
jest.mock('node:fs/promises', () => ({
  ...jest.requireActual('node:fs/promises'),
  access: jest.fn(),
}));

const mockResolveMl = resolveMlExecutable as jest.MockedFunction<
  typeof resolveMlExecutable
>;
const mockAssertRunnable = assertMlRunnable as jest.MockedFunction<
  typeof assertMlRunnable
>;
const mockRunMlInit = runMlInit as jest.MockedFunction<typeof runMlInit>;
const mockQueryMulch = queryMulch as jest.MockedFunction<typeof queryMulch>;
const mockAccess = access as jest.MockedFunction<typeof access>;

function createContext(
  overrides: Partial<RuntimeContext> = {},
): RuntimeContext {
  return {
    repoRoot: '/repo',
    config: {},
    memorySegments: [],
    pendingMulchLessons: [],
    conversation: [],
    compressionSummaries: [],
    ...overrides,
  };
}

describe('ensureMlReady', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveMl.mockResolvedValue('/usr/local/bin/ml');
    mockAssertRunnable.mockResolvedValue(undefined);
  });

  it('skips ml init when mulch.config.yaml exists', async () => {
    mockAccess.mockResolvedValue(undefined);

    await ensureMlReady('/repo');

    expect(mockResolveMl).toHaveBeenCalled();
    expect(mockAssertRunnable).toHaveBeenCalledWith('/usr/local/bin/ml');
    expect(mockRunMlInit).not.toHaveBeenCalled();
  });

  it('calls ml init when mulch.config.yaml is absent', async () => {
    mockAccess.mockRejectedValue(
      Object.assign(new Error('not found'), { code: 'ENOENT' }),
    );
    mockRunMlInit.mockResolvedValue(undefined);

    await ensureMlReady('/repo');

    expect(mockRunMlInit).toHaveBeenCalledWith('/usr/local/bin/ml', '/repo');
  });

  it('calls ml init when access fails with non-ENOENT error', async () => {
    mockAccess.mockRejectedValue(
      Object.assign(new Error('permission denied'), { code: 'EACCES' }),
    );
    mockRunMlInit.mockResolvedValue(undefined);

    await ensureMlReady('/repo');

    expect(mockRunMlInit).toHaveBeenCalledWith('/usr/local/bin/ml', '/repo');
  });

  it('throws when ml is not installed', async () => {
    mockResolveMl.mockRejectedValue(
      new Error(
        'agent-plugin-mulch: ml is required but was not found on PATH.',
      ),
    );

    await expect(ensureMlReady('/repo')).rejects.toThrow(
      'ml is required but was not found on PATH',
    );
  });

  it('throws when bun is missing', async () => {
    mockAssertRunnable.mockRejectedValue(
      new Error('agent-plugin-mulch: ml requires Bun to run'),
    );

    await expect(ensureMlReady('/repo')).rejects.toThrow(
      'ml requires Bun to run',
    );
  });
});

describe('mulchPlugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveMl.mockResolvedValue('/usr/local/bin/ml');
    mockAssertRunnable.mockResolvedValue(undefined);
    mockAccess.mockResolvedValue(undefined);
  });

  it('has the correct name', () => {
    expect(mulchPlugin.name).toBe('agent-plugin-mulch');
  });

  it('has no onSessionEnd method', () => {
    expect(mulchPlugin.onSessionEnd).toBeUndefined();
  });

  it('pushes ml prime output to memorySegments as experience', async () => {
    mockQueryMulch.mockResolvedValue('## Experience\n\nSome lessons...');

    const context = createContext();
    await mulchPlugin.onSessionStart?.(context);

    expect(mockQueryMulch).toHaveBeenCalledWith('/repo');
    expect(context.memorySegments).toEqual([
      {
        type: 'experience',
        content: '## Experience\n\nSome lessons...',
      },
    ]);
  });

  it('skips when ml prime returns empty string', async () => {
    mockQueryMulch.mockResolvedValue('');

    const context = createContext();
    await mulchPlugin.onSessionStart?.(context);

    expect(context.memorySegments).toEqual([]);
  });

  it('throws when ml is not installed', async () => {
    mockResolveMl.mockRejectedValue(
      new Error(
        'agent-plugin-mulch: ml is required but was not found on PATH.',
      ),
    );

    const context = createContext();
    await expect(mulchPlugin.onSessionStart?.(context)).rejects.toThrow(
      'ml is required but was not found on PATH',
    );
  });

  it('throws when bun is missing', async () => {
    mockAssertRunnable.mockRejectedValue(
      new Error('agent-plugin-mulch: ml requires Bun to run'),
    );

    const context = createContext();
    await expect(mulchPlugin.onSessionStart?.(context)).rejects.toThrow(
      'ml requires Bun to run',
    );
  });
});
