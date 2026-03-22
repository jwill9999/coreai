import { toMessage } from '@conscius/runtime';

describe('@conscius/cli (shared error helper)', () => {
  it('re-exports runtime toMessage behaviour via dependency', () => {
    expect(toMessage(new Error('x'))).toBe('x');
  });
});
