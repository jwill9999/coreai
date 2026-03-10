import { toMessage } from './utils';

describe('toMessage()', () => {
  it('returns the message for an Error instance', () => {
    expect(toMessage(new Error('something went wrong'))).toBe('something went wrong');
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
});
