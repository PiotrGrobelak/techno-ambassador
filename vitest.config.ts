import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    // Use jsdom environment for DOM testing
    environment: 'jsdom',
    
    // Global test setup files
    setupFiles: ['./src/test/setup.ts'],
    
    // Include patterns for test files
    include: ['src/**/*.{test,spec}.{js,ts,vue}'],
    
    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.astro/**'
    ],
    
    // Enable globals for describe, it, expect, vi
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text','html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/test/**',
        '**/*.config.*',
        '**/*.d.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Reporter configuration
    reporters: ['verbose', 'html'],
    
    // Test timeout
    testTimeout: 10000,
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
}); 