import { adaptLegacyPromptArrays } from './legacy-adapter.js';

describe('adaptLegacyPromptArrays', () => {
  it('merges chunks then segments as context segments', () => {
    const out = adaptLegacyPromptArrays(['a'], ['b']);
    expect(out).toEqual([
      { type: 'context', content: 'a', priority: 0 },
      { type: 'context', content: 'b', priority: 0 },
    ]);
  });

  it('skips empty strings', () => {
    expect(adaptLegacyPromptArrays(['  ', ''], ['x'])).toEqual([
      { type: 'context', content: 'x', priority: 0 },
    ]);
  });
});
