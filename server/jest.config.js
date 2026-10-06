import { createDefaultEsmPreset } from 'ts-jest';

/** @type {import('jest').Config} */
export default {
  ...createDefaultEsmPreset(),
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/generated/**', '!src/index.ts'],
  clearMocks: true,
};
