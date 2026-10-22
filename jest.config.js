// Node-only tests for pure data logic (SQL builders, migrations) run against better-sqlite3.
// No React Native / UI tests here.
/** @type {import('jest').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
