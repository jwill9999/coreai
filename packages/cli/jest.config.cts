module.exports = {
  displayName: '@conscius/cli',
  preset: '../../jest.preset.js',
  coverageDirectory: 'test-output/jest/coverage',
  coverageReporters: ['lcov', 'text-summary'],
  passWithNoTests: true,
};
