import type { AgentContext, AgentPlugin } from '@coreai/agent-types';
import { PluginLoader } from './plugin-loader';

// Virtual modules used by load() tests
jest.mock(
  '@coreai/test-plugin-default',
  () => ({ default: { name: 'default-plugin', onSessionStart: jest.fn() } }),
  { virtual: true },
);
jest.mock(
  '@coreai/test-plugin-named',
  () => ({ plugin: { name: 'named-plugin', onTaskStart: jest.fn() } }),
  { virtual: true },
);
jest.mock('@coreai/test-plugin-invalid', () => ({ default: null }), {
  virtual: true,
});
jest.mock('@coreai/test-plugin-no-name', () => ({ default: { name: 42 } }), {
  virtual: true,
});

function makeContext(): AgentContext {
  return {
    repoRoot: '/repo',
    config: {},
    promptSegments: [],
    conversation: [],
    compressionSummaries: [],
  };
}

function makePlugin(
  name: string,
  overrides: Partial<AgentPlugin> = {},
): AgentPlugin {
  return { name, ...overrides };
}

function setPlugins(loader: PluginLoader, plugins: AgentPlugin[]): void {
  (loader as unknown as { plugins: AgentPlugin[] }).plugins = plugins;
}

describe('PluginLoader.load()', () => {
  it('registers a plugin with a default export', async () => {
    const loader = new PluginLoader();
    await loader.load(['@coreai/test-plugin-default']);
    expect(loader.getPlugins()).toHaveLength(1);
    expect(loader.getPlugins()[0].name).toBe('default-plugin');
  });

  it('registers a plugin with a named "plugin" export', async () => {
    const loader = new PluginLoader();
    await loader.load(['@coreai/test-plugin-named']);
    expect(loader.getPlugins()[0].name).toBe('named-plugin');
  });

  it('throws for a module with no valid export', async () => {
    const loader = new PluginLoader();
    await expect(loader.load(['@coreai/test-plugin-invalid'])).rejects.toThrow(
      'does not export a valid AgentPlugin',
    );
  });

  it('throws when the plugin name is not a string', async () => {
    const loader = new PluginLoader();
    await expect(loader.load(['@coreai/test-plugin-no-name'])).rejects.toThrow(
      'does not export a valid AgentPlugin',
    );
  });

  it('resets plugins on each load call', async () => {
    const loader = new PluginLoader();
    await loader.load(['@coreai/test-plugin-default']);
    await loader.load(['@coreai/test-plugin-named']);
    expect(loader.getPlugins()).toHaveLength(1);
    expect(loader.getPlugins()[0].name).toBe('named-plugin');
  });

  it('registers nothing for an empty array', async () => {
    const loader = new PluginLoader();
    await loader.load([]);
    expect(loader.getPlugins()).toHaveLength(0);
  });
});

describe('PluginLoader lifecycle hooks', () => {
  let loader: PluginLoader;
  const ctx = makeContext();

  beforeEach(() => {
    loader = new PluginLoader();
  });

  it('calls onSessionStart on plugins that implement it', async () => {
    const onSessionStart = jest.fn().mockResolvedValue(undefined);
    setPlugins(loader, [makePlugin('a', { onSessionStart })]);
    await loader.runSessionStart(ctx);
    expect(onSessionStart).toHaveBeenCalledWith(ctx);
  });

  it('calls onTaskStart on plugins that implement it', async () => {
    const onTaskStart = jest.fn().mockResolvedValue(undefined);
    setPlugins(loader, [makePlugin('a', { onTaskStart })]);
    await loader.runTaskStart(ctx);
    expect(onTaskStart).toHaveBeenCalledWith(ctx);
  });

  it('calls onConversationThreshold on plugins that implement it', async () => {
    const onConversationThreshold = jest.fn().mockResolvedValue(undefined);
    setPlugins(loader, [makePlugin('a', { onConversationThreshold })]);
    await loader.runConversationThreshold(ctx);
    expect(onConversationThreshold).toHaveBeenCalledWith(ctx);
  });

  it('calls onSessionEnd on plugins that implement it', async () => {
    const onSessionEnd = jest.fn().mockResolvedValue(undefined);
    setPlugins(loader, [makePlugin('a', { onSessionEnd })]);
    await loader.runSessionEnd(ctx);
    expect(onSessionEnd).toHaveBeenCalledWith(ctx);
  });

  it('is a no-op for plugins that do not implement the hook', async () => {
    setPlugins(loader, [makePlugin('no-hooks')]);
    await expect(loader.runSessionStart(ctx)).resolves.toBeUndefined();
  });

  it('calls hooks on all plugins in order', async () => {
    const order: string[] = [];
    setPlugins(loader, [
      makePlugin('first', {
        onSessionStart: jest.fn().mockImplementation(() => {
          order.push('first');
          return Promise.resolve();
        }),
      }),
      makePlugin('second', {
        onSessionStart: jest.fn().mockImplementation(() => {
          order.push('second');
          return Promise.resolve();
        }),
      }),
    ]);
    await loader.runSessionStart(ctx);
    expect(order).toEqual(['first', 'second']);
  });
});

describe('PluginLoader error isolation', () => {
  let loader: PluginLoader;
  const ctx = makeContext();

  beforeEach(() => {
    loader = new PluginLoader();
  });

  it('re-throws a single plugin error directly', async () => {
    const err = new Error('plugin-a failed');
    setPlugins(loader, [
      makePlugin('a', { onSessionStart: jest.fn().mockRejectedValue(err) }),
    ]);
    await expect(loader.runSessionStart(ctx)).rejects.toThrow(
      'plugin-a failed',
    );
  });

  it('runs remaining plugins even if an earlier one throws', async () => {
    const secondHook = jest.fn().mockResolvedValue(undefined);
    setPlugins(loader, [
      makePlugin('a', {
        onSessionStart: jest.fn().mockRejectedValue(new Error('fail')),
      }),
      makePlugin('b', { onSessionStart: secondHook }),
    ]);
    await expect(loader.runSessionStart(ctx)).rejects.toThrow();
    expect(secondHook).toHaveBeenCalled();
  });

  it('throws AggregateError when multiple plugins fail', async () => {
    setPlugins(loader, [
      makePlugin('a', {
        onSessionStart: jest.fn().mockRejectedValue(new Error('err-a')),
      }),
      makePlugin('b', {
        onSessionStart: jest.fn().mockRejectedValue(new Error('err-b')),
      }),
    ]);
    await expect(loader.runSessionStart(ctx)).rejects.toBeInstanceOf(
      AggregateError,
    );
  });

  it('AggregateError message lists all failing plugins', async () => {
    setPlugins(loader, [
      makePlugin('a', {
        onSessionStart: jest.fn().mockRejectedValue(new Error('err-a')),
      }),
      makePlugin('b', {
        onSessionStart: jest.fn().mockRejectedValue(new Error('err-b')),
      }),
    ]);
    try {
      await loader.runSessionStart(ctx);
    } catch (e) {
      expect((e as AggregateError).message).toContain('[a]');
      expect((e as AggregateError).message).toContain('[b]');
    }
  });
});
