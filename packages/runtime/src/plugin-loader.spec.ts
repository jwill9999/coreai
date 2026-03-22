import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { createHostRuntimeContext } from './host-context.js';
import type { MemorySegment, Plugin } from './public-types.js';
import { PluginLoader, resolvePluginSpecifier } from './plugin-loader.js';

jest.mock(
  '@conscius/test-plugin-default',
  () => ({ default: { name: 'default-plugin', onSessionStart: jest.fn() } }),
  { virtual: true },
);
jest.mock(
  '@conscius/test-plugin-named',
  () => ({ plugin: { name: 'named-plugin', onTaskStart: jest.fn() } }),
  { virtual: true },
);
jest.mock('@conscius/test-plugin-invalid', () => ({ default: null }), {
  virtual: true,
});
jest.mock('@conscius/test-plugin-no-name', () => ({ default: { name: 42 } }), {
  virtual: true,
});

function makeHostContext() {
  return createHostRuntimeContext({
    repoRoot: '/repo',
    config: {},
  });
}

function makePlugin(name: string, overrides: Partial<Plugin> = {}): Plugin {
  return { name, ...overrides };
}

function setPlugins(loader: PluginLoader, plugins: Plugin[]): void {
  (loader as unknown as { plugins: Plugin[] }).plugins = plugins;
}

describe('PluginLoader.load()', () => {
  it('registers a plugin with a default export', async () => {
    const loader = new PluginLoader();
    await loader.load(['@conscius/test-plugin-default']);
    expect(loader.getPlugins()).toHaveLength(1);
    expect(loader.getPlugins()[0].name).toBe('default-plugin');
  });

  it('registers a plugin with a named "plugin" export', async () => {
    const loader = new PluginLoader();
    await loader.load(['@conscius/test-plugin-named']);
    expect(loader.getPlugins()[0].name).toBe('named-plugin');
  });

  it('throws for a module with no valid export', async () => {
    const loader = new PluginLoader();
    await expect(
      loader.load(['@conscius/test-plugin-invalid']),
    ).rejects.toThrow('does not export a valid plugin');
  });

  it('throws when the plugin name is not a string', async () => {
    const loader = new PluginLoader();
    await expect(
      loader.load(['@conscius/test-plugin-no-name']),
    ).rejects.toThrow('does not export a valid plugin');
  });

  it('resets plugins on each load call', async () => {
    const loader = new PluginLoader();
    await loader.load(['@conscius/test-plugin-default']);
    await loader.load(['@conscius/test-plugin-named']);
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
  const ctx = makeHostContext();

  beforeEach(() => {
    loader = new PluginLoader();
  });

  it('calls onSessionStart on plugins that implement it', async () => {
    const onSessionStart = jest.fn().mockResolvedValue(undefined);
    setPlugins(loader, [makePlugin('a', { onSessionStart })]);
    await loader.runSessionStart(ctx);
    expect(onSessionStart.mock.calls[0][0]).not.toHaveProperty(
      'promptSegments',
    );
  });

  it('calls onTaskStart on plugins that implement it', async () => {
    const onTaskStart = jest.fn().mockResolvedValue(undefined);
    setPlugins(loader, [makePlugin('a', { onTaskStart })]);
    await loader.runTaskStart(ctx);
    expect(onTaskStart).toHaveBeenCalled();
  });

  it('calls onMemoryCompose on plugins that implement it', async () => {
    const onMemoryCompose = jest.fn().mockImplementation((c) => {
      c.memorySegments.push({ type: 'context', content: 'ok' });
      return Promise.resolve();
    });
    setPlugins(loader, [makePlugin('a', { onMemoryCompose })]);
    await loader.runMemoryCompose(ctx);
    expect(onMemoryCompose).toHaveBeenCalled();
    expect(ctx.memorySegments.some((s) => s.content === 'ok')).toBe(true);
  });

  it('calls onSessionEnd on plugins that implement it', async () => {
    const onSessionEnd = jest.fn().mockResolvedValue(undefined);
    setPlugins(loader, [makePlugin('a', { onSessionEnd })]);
    await loader.runSessionEnd(ctx);
    expect(onSessionEnd).toHaveBeenCalled();
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

  it('tags pre-existing segments without source as host and only new segments with the plugin', async () => {
    const preExisting: MemorySegment = {
      type: 'context',
      content: 'from host',
    };
    const ctx = createHostRuntimeContext({
      repoRoot: '/repo',
      config: {},
      memorySegments: [preExisting],
    });
    setPlugins(loader, [
      makePlugin('p1', {
        onSessionStart: jest.fn().mockImplementation((c) => {
          c.memorySegments.push({ type: 'context', content: 'from p1' });
          return Promise.resolve();
        }),
      }),
      makePlugin('p2', {
        onSessionStart: jest.fn().mockImplementation((c) => {
          c.memorySegments.push({ type: 'context', content: 'from p2' });
          return Promise.resolve();
        }),
      }),
    ]);
    await loader.runSessionStart(ctx);
    expect(preExisting.source).toBe('host');
    expect(
      ctx.memorySegments.find((s) => s.content === 'from p1')?.source,
    ).toBe('p1');
    expect(
      ctx.memorySegments.find((s) => s.content === 'from p2')?.source,
    ).toBe('p2');
  });
});

describe('resolvePluginSpecifier', () => {
  it('returns bare package specifiers unchanged', () => {
    expect(resolvePluginSpecifier('@conscius/foo', '/repo')).toBe(
      '@conscius/foo',
    );
    expect(resolvePluginSpecifier('lodash', '/repo')).toBe('lodash');
  });

  it('resolves ./ and ../ against repoRoot to a file URL', () => {
    const root = '/repo/root';
    expect(resolvePluginSpecifier('./plugins/x.js', root)).toBe(
      pathToFileURL(resolve(root, 'plugins/x.js')).href,
    );
    expect(resolvePluginSpecifier('../outside/p.js', root)).toBe(
      pathToFileURL(resolve(root, '../outside/p.js')).href,
    );
  });

  it('converts absolute filesystem paths to file URLs', () => {
    expect(resolvePluginSpecifier('/abs/p.js', '/repo')).toBe(
      pathToFileURL('/abs/p.js').href,
    );
  });

  it('passes through existing file: URLs', () => {
    const url = 'file:///tmp/x.js';
    expect(resolvePluginSpecifier(url, '/repo')).toBe(url);
  });
});

describe('PluginLoader error isolation', () => {
  let loader: PluginLoader;
  const ctx = makeHostContext();

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
