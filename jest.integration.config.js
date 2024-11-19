/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['<rootDir>/src/__integration__/**/*.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true,
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ansi-styles|supports-color)/)'
  ],
  moduleNameMapper: {
    '#(.*)': '<rootDir>/node_modules/$1',
    '^chalk$': '<rootDir>/node_modules/chalk/source/index.js',
    '^ansi-styles$': '<rootDir>/node_modules/ansi-styles/index.js',
    '^supports-color$': '<rootDir>/node_modules/supports-color/index.js',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest.setup.js']
}
