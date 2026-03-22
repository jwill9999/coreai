module.exports = {
  displayName: '@conscius/runtime',
  preset: '../../jest.preset.js',
  coverageDirectory: 'test-output/jest/coverage',
  coverageReporters: ['lcov', 'text-summary'],
  passWithNoTests: true,
};
