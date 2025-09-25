/**
 * 🦊 Diffusion-Pipe Test Setup
 *
 * Test setup configuration for diffusion-pipe package
 * following Reynard's testing patterns.
 */

import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";

// Mock WebSocket for testing
class MockWebSocket {
  public readyState = WebSocket.CONNECTING;
  public url: string;
  public protocols: string[];
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  constructor(url: string, protocols?: string[]) {
    this.url = url;
    this.protocols = protocols || [];

    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event("open"));
      }
    }, 10);
  }

  send(data: string) {
    // Mock send implementation
  }

  close(code?: number, reason?: string) {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent("close", { code, reason }));
    }
  }
}

// Mock fetch for API testing
const mockFetch = vi.fn();

// Global test setup
beforeAll(() => {
  // Mock WebSocket
  global.WebSocket = MockWebSocket as any;

  // Mock fetch
  global.fetch = mockFetch;

  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
});

beforeEach(() => {
  // Reset mocks before each test
  mockFetch.mockClear();
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  vi.clearAllTimers();
});

afterAll(() => {
  // Clean up after all tests
  vi.restoreAllMocks();
});

// Export mock utilities for use in tests
export { mockFetch, MockWebSocket };
