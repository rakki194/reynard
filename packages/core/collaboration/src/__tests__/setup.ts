/**
 * 🦊 Reynard Collaboration Test Setup
 *
 * Test setup for the reynard-collaboration package
 * Provides common test utilities and mocks for collaboration features
 */

import { vi } from "vitest";

// Mock WebSocket for testing
const MockWebSocket = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
  send: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1, // OPEN
}));

// Add static properties to the mock
Object.assign(MockWebSocket, {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
});

global.WebSocket = MockWebSocket as any;

// Mock IndexedDB for testing
const mockIDBRequest = {
  result: null,
  error: null,
  onsuccess: null,
  onerror: null,
  onupgradeneeded: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

const mockIDBDatabase = {
  name: "test-db",
  version: 1,
  objectStoreNames: { contains: vi.fn(() => false), length: 0 },
  createObjectStore: vi.fn(),
  deleteObjectStore: vi.fn(),
  transaction: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// const mockIDBTransaction = {
//   objectStore: vi.fn(),
//   add: vi.fn(),
//   put: vi.fn(),
//   get: vi.fn(),
//   delete: vi.fn(),
//   clear: vi.fn(),
//   commit: vi.fn(),
//   abort: vi.fn(),
//   addEventListener: vi.fn(),
//   removeEventListener: vi.fn(),
// };

// const mockIDBObjectStore = {
//   name: "test-store",
//   keyPath: null,
//   indexNames: { contains: vi.fn(() => false), length: 0 },
//   add: vi.fn(() => mockIDBRequest),
//   put: vi.fn(() => mockIDBRequest),
//   get: vi.fn(() => mockIDBRequest),
//   delete: vi.fn(() => mockIDBRequest),
//   clear: vi.fn(() => mockIDBRequest),
//   count: vi.fn(() => mockIDBRequest),
//   openCursor: vi.fn(() => mockIDBRequest),
//   createIndex: vi.fn(),
//   deleteIndex: vi.fn(),
//   index: vi.fn(),
//   addEventListener: vi.fn(),
//   removeEventListener: vi.fn(),
// };

global.indexedDB = {
  open: vi.fn(() => {
    const request = { ...mockIDBRequest };
    setTimeout(() => {
      request.result = mockIDBDatabase as any;
      if (request.onsuccess) (request.onsuccess as any)({} as any);
    }, 0);
    return request;
  }),
  deleteDatabase: vi.fn(() => mockIDBRequest),
  cmp: vi.fn(),
} as any;

// Mock IDBKeyRange
global.IDBKeyRange = {
  bound: vi.fn(),
  only: vi.fn(),
  lowerBound: vi.fn(),
  upperBound: vi.fn(),
} as any;

// Mock performance.memory for metrics
Object.defineProperty(global.performance, "memory", {
  value: {
    usedJSHeapSize: 1024 * 1024, // 1MB
    totalJSHeapSize: 2 * 1024 * 1024, // 2MB
    jsHeapSizeLimit: 4 * 1024 * 1024, // 4MB
  },
  writable: true,
});

// Mock navigator.onLine
Object.defineProperty(global.navigator, "onLine", {
  value: true,
  writable: true,
});

// Mock window events
global.addEventListener = vi.fn();
global.removeEventListener = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Clean up after each test
// afterEach(() => {
//   vi.clearAllMocks();
// });
