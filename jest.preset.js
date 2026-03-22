/* eslint-disable @typescript-eslint/no-require-imports -- Jest preset is CommonJS */
const path = require('node:path');

const nxPreset = require('@nx/jest/preset').default;

const runtimeEntry = path.join(__dirname, 'packages/runtime/src/index.ts');

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    ...nxPreset.moduleNameMapper,
    '^@conscius/runtime$': runtimeEntry,
  },
};
