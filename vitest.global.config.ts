/**
 * Global Vitest Configuration for Reynard
 * 
 * This configuration ensures that no more than 4 vitest processes
 * run concurrently across all agents, creating a global queue system.
 * 
 * 🐺> *alpha wolf dominance* This is the pack leader configuration
 * that coordinates all testing across the entire Reynard ecosystem!
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Global worker limit - maximum 1 process per agent
    maxWorkers: 1,
    
    // Use forks pool for better process isolation and control
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 1, // Hard limit on child processes
        singleFork: true, // Force single fork per agent
      },
    },
    
    // Disable file parallelism to prevent multiple test files running simultaneously
    fileParallelism: false,
    
    // Disable test isolation to reduce process overhead
    // Only do this if your tests are properly designed for it
    isolate: false,
    
    // Global timeout settings
    testTimeout: 30000,
    hookTimeout: 10000,
    
    // Reporter configuration for better coordination
    reporters: [
      ['default', { summary: false }],
      ['json', { outputFile: '.vitest-reports/global-report.json' }],
    ],
    
    // Coverage settings
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '.vitest-coverage/global',
    },
    
    // Environment configuration
    environment: 'happy-dom',
    globals: true,
    
    // File patterns
    include: ['**/*.{test,spec}.{js,ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.cache',
      'coverage',
      '.vitest-reports',
      '.vitest-coverage',
    ],
  },
  
  // Resolve configuration
  resolve: {
    conditions: ['development', 'browser'],
  },
});

