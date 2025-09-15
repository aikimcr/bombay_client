module.exports = {
  clearMocks: false,
  resetMocks: true,
  resetModules: true,
  restoreMocks: false,
  reporters: ['default'],
  collectCoverage: false,
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
    '.+\\.(scss|css)$': 'jest-css-modules-transform',
  },
  testEnvironment: 'jest-fixed-jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },

  verbose: true,
  testTimeout: 30000,
  moduleDirectories: ['node_modules'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/scripts/',
    '<rootDir>/config/',
  ],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '^@utilities/(.*)$': '<rootDir>/src/utilities/$1',
    '^@network/(.*)$': '<rootDir>/src/Network/$1',
  },
};
