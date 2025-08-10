module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.ts'],
  testTimeout: 30000,
  maxConcurrency: 16,
};
