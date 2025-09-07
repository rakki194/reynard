/**
 * Test setup for reynard-ai-shared
 * 
 * This file sets up the testing environment for the AI shared package.
 */

import { vi } from 'vitest'

// Mock global objects that might not be available in test environment
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}

// Mock performance API if not available
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn()
  } as any
}

// Mock process if not available (for Node.js specific code)
if (typeof process === 'undefined') {
  global.process = {
    memoryUsage: vi.fn(() => ({
      rss: 0,
      heapTotal: 0,
      heapUsed: 0,
      external: 0,
      arrayBuffers: 0
    })),
    nextTick: vi.fn((callback) => setTimeout(callback, 0))
  } as any
}

// Mock setTimeout and clearTimeout for consistent testing
global.setTimeout = vi.fn((callback, delay) => {
  return setTimeout(callback, delay) as any
}) as any

global.clearTimeout = vi.fn((id) => {
  return clearTimeout(id)
}) as any

global.setInterval = vi.fn((callback, delay) => {
  return setInterval(callback, delay) as any
}) as any

global.clearInterval = vi.fn((id) => {
  return clearInterval(id)
}) as any
