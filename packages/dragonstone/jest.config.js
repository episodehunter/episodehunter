module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/', '<rootDir>/coverage/'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/data-sources/pg/schema.ts']
};
