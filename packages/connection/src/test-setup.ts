/**
 * Test setup for reynard-connection
 */

import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@solidjs/testing-library';

// Mock WebSocket
global.WebSocket = vi.fn().mockImplementation(() => ({
  readyState: WebSocket.CONNECTING,
  url: '',
  protocol: '',
  extensions: '',
  bufferedAmount: 0,
  binaryType: 'blob' as BinaryType,
  onopen: null,
  onclose: null,
  onmessage: null,
  onerror: null,
  close: vi.fn(),
  send: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn().mockReturnValue(true),
}));

// Mock EventSource
global.EventSource = vi.fn().mockImplementation(() => ({
  readyState: EventSource.CONNECTING,
  url: '',
  withCredentials: false,
  onopen: null,
  onmessage: null,
  onerror: null,
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn().mockReturnValue(true),
}));

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    clone: vi.fn().mockReturnThis(),
  })
);

// Mock crypto
global.crypto = {
  randomUUID: vi.fn().mockReturnValue('00000000-0000-4000-8000-000000000000'),
  getRandomValues: vi.fn().mockImplementation((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  subtle: {} as SubtleCrypto,
};

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
