import { definePlugin } from './define-plugin.js';

describe('definePlugin', () => {
  it('accepts a minimal valid plugin', () => {
    const p = definePlugin({ name: 'p1' });
    expect(p.name).toBe('p1');
  });

  it('trims name', () => {
    const p = definePlugin({ name: '  my-plugin  ' });
    expect(p.name).toBe('my-plugin');
  });

  it('rejects non-object', () => {
    expect(() => definePlugin(null)).toThrow('expected a plugin object');
  });

  it('rejects missing name', () => {
    expect(() => definePlugin({})).toThrow('name');
  });

  it('rejects unknown hook keys', () => {
    expect(() =>
      definePlugin({
        name: 'x',
        onConversationThreshold: jest.fn(),
      }),
    ).toThrow('unknown hook');
  });

  it('rejects non-function hook values', () => {
    expect(() =>
      definePlugin({
        name: 'x',
        onSessionStart: 'nope' as unknown as () => void,
      }),
    ).toThrow('must be a function');
  });

  it('copies allowed hooks', () => {
    const fn = jest.fn();
    const p = definePlugin({
      name: 'x',
      onMemoryCompose: fn,
    });
    expect(p.onMemoryCompose).toBe(fn);
    expect(p.onSessionStart).toBeUndefined();
  });
});
