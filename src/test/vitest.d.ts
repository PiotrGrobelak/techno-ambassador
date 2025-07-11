/// <reference types="vitest" />
/// <reference types="@vue/test-utils" />

import 'vitest/globals';

declare global {
  // Extend Jest matchers if needed
  namespace Vi {}

  // Global test utilities
  const describe: typeof import('vitest').describe;
  const it: typeof import('vitest').it;
  const expect: typeof import('vitest').expect;
  const vi: typeof import('vitest').vi;
  const test: typeof import('vitest').test;
  const beforeEach: typeof import('vitest').beforeEach;
  const afterEach: typeof import('vitest').afterEach;
  const beforeAll: typeof import('vitest').beforeAll;
  const afterAll: typeof import('vitest').afterAll;
}

// Export types for test utilities
export type MockedFunction<T extends (...args: unknown[]) => unknown> =
  ReturnType<typeof vi.fn<T>>;

export type MockedObject<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown
    ? MockedFunction<T[K]>
    : T[K];
};
