/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts'],
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
    '^supports-color$': '<rootDir>/node_modules/supports-color/index.js'
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFiles: ['<rootDir>/jest.setup.js']
}
