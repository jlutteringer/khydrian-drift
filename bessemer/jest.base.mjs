/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  passWithNoTests: true,
  moduleNameMapper: {
    '^@bessemer/([^/]*)$': '<rootDir>/../$1/src/index',
    '^@bessemer/([^/]*)/(.*)$': '<rootDir>/../$1/src/$2',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: ['/node_modules/(?!lodash-es/.*)'],
}
