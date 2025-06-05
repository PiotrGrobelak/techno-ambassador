import { vi } from 'vitest';
import { config } from '@vue/test-utils';

// Global mocks for browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Configure Vue Test Utils global properties
config.global.mocks = {
  // Add global mocks here if needed
};

// Global stubs for common components
config.global.stubs = {
  // Stub router-link if using Vue Router
  'router-link': true,
  'router-view': true,
};

// Setup for PrimeVue components if needed
config.global.plugins = [
  // Add global plugins here
];

// Mock fetch for API testing
global.fetch = vi.fn();

// Console suppression for cleaner test output
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress Vue warnings during tests
  if (typeof args[0] === 'string' && args[0].includes('[Vue warn]')) {
    return;
  }
  originalConsoleError(...args);
}; 