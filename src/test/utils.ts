import { mount, VueWrapper, type MountingOptions } from '@vue/test-utils';
import { vi } from 'vitest';
import type { Component } from 'vue';

/**
 * Enhanced mount function with common test configuration
 */
export function mountComponent(
  component: Component,
  options: MountingOptions<unknown> = {}
): VueWrapper<typeof component> {
  const defaultOptions: MountingOptions<unknown> = {
    global: {
      stubs: {
        // Add common stubs here
      },
      mocks: {
        // Add common mocks here
      },
    },
  };

  return mount(component, {
    ...defaultOptions,
    ...options,
    global: {
      ...defaultOptions.global,
      ...options.global,
    },
  });
}

/**
 * Mock API response helper
 */
export function createMockApiResponse<T>(data: T, success = true) {
  return {
    data: success ? data : null,
    error: success ? null : new Error('API Error'),
    status: success ? 200 : 500,
    statusText: success ? 'OK' : 'Internal Server Error',
  };
}

/**
 * Wait for DOM updates and next tick
 */
export async function flushPromises() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Create a spy function with TypeScript support
 */
export function createSpy<T extends (...args: unknown[]) => unknown>(
  implementation?: T
) {
  return vi.fn(implementation);
}

/**
 * Mock fetch with predefined responses
 */
export function mockFetch(
  responses: Array<{ url: string; response: unknown }>
) {
  const fetchMock = vi.fn();

  responses.forEach(({ url, response }) => {
    fetchMock.mockImplementationOnce((requestUrl: string) => {
      if (requestUrl.includes(url)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response),
          text: () => Promise.resolve(JSON.stringify(response)),
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  global.fetch = fetchMock;
  return fetchMock;
}

/**
 * Helper to wait for a component to emit an event
 */
export async function waitForEmit(
  wrapper: VueWrapper<unknown>,
  eventName: string,
  timeout = 1000
) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(`Event '${eventName}' was not emitted within ${timeout}ms`)
      );
    }, timeout);

    const unwatch = wrapper.vm.$watch(
      () => wrapper.emitted(eventName),
      (newVal: unknown) => {
        if (newVal && (newVal as unknown[]).length > 0) {
          clearTimeout(timer);
          unwatch();
          resolve((newVal as unknown[])[(newVal as unknown[]).length - 1]);
        }
      },
      { immediate: true }
    );
  });
}
