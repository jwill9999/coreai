import { toMessage } from './utils';

describe('toMessage()', () => {
  it('returns the message for an Error instance', () => {
    expect(toMessage(new Error('something went wrong'))).toBe(
      'something went wrong',
    );
  });

  it('returns the string directly for a string value', () => {
    expect(toMessage('plain error string')).toBe('plain error string');
  });

  it('JSON-stringifies arbitrary objects', () => {
    expect(toMessage({ code: 42 })).toBe('{"code":42}');
  });

  it('handles null', () => {
    expect(toMessage(null)).toBe('null');
  });

  it('handles numbers', () => {
    expect(toMessage(404)).toBe('404');
  });

  it('falls back to String() for non-serialisable values (circular reference)', () => {
    const circular: Record<string, unknown> = {};
    circular['self'] = circular;
    const result = toMessage(circular);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('falls back to String() for BigInt', () => {
    const result = toMessage(BigInt(9007199254740991));
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
