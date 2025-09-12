/**
 * Base Test Setup - Common mocking patterns used across all packages
 */

import { cleanup } from "@solidjs/testing-library";
import { afterEach, beforeEach, vi } from "vitest";

/**
 * Base test setup that all other setups extend
 * Provides common mocking patterns and cleanup
 */
export function setupBaseTest() {
  // Mock fetch globally
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      formData: () => Promise.resolve(new FormData()),
      bytes: () => Promise.resolve(new Uint8Array(0)),
      clone: vi.fn().mockReturnThis(),
      url: "",
      redirected: false,
      type: "basic" as ResponseType,
      body: null,
      bodyUsed: false,
    } as Response),
  ) as any;

  // Mock crypto API
  Object.defineProperty(global, "crypto", {
    value: {
      randomUUID: vi
        .fn()
        .mockReturnValue("00000000-0000-4000-8000-000000000000"),
      getRandomValues: vi.fn().mockImplementation((array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      }),
      subtle: {
        digest: vi.fn(async (algorithm: string, data: Uint8Array) => {
          const hash = new Uint8Array(32);
          const algorithmOffset = algorithm === "SHA-1" ? 100 : 200;
          const dataHash = data.reduce((acc, byte) => acc + byte, 0);
          for (let i = 0; i < hash.length; i++) {
            hash[i] =
              (data[i % data.length] + i + algorithmOffset + dataHash) % 256;
          }
          return hash;
        }),
      } as any,
    },
    writable: true,
    configurable: true,
  });

  // Mock performance API
  global.performance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    },
  } as any;

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock URL
  global.URL.createObjectURL = vi.fn(() => "mock-url");
  global.URL.revokeObjectURL = vi.fn();

  // Mock btoa/atob
  global.btoa = vi.fn((str: string) =>
    Buffer.from(str, "binary").toString("base64"),
  );
  global.atob = vi.fn((str: string) =>
    Buffer.from(str, "base64").toString("binary"),
  );

  // Mock TextEncoder/TextDecoder
  global.TextEncoder = class TextEncoder {
    encode(input: string): Uint8Array {
      return new Uint8Array(Buffer.from(input, "utf8"));
    }
    encodeInto(
      input: string,
      destination: Uint8Array,
    ): { read: number; written: number } {
      const encoded = this.encode(input);
      const written = Math.min(encoded.length, destination.length);
      destination.set(encoded.subarray(0, written));
      return { read: input.length, written };
    }
    get encoding() {
      return "utf-8";
    }
  } as any;

  global.TextDecoder = class TextDecoder {
    constructor(
      public encoding = "utf-8",
      public fatal = false,
      public ignoreBOM = false,
    ) {}
    decode(input: Uint8Array): string {
      return Buffer.from(input).toString("utf8");
    }
  } as any;

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    return setTimeout(callback, 16) as any;
  });

  global.cancelAnimationFrame = vi.fn((id: number) => {
    clearTimeout(id);
  });

  // Setup cleanup
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
}

/**
 * Suppress console warnings in tests
 */
export function suppressConsoleWarnings() {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("computations created outside a `createRoot`") ||
        args[0].includes("Warning:") ||
        args[0].includes("Deprecated:"))
    ) {
      return; // Suppress these warnings
    }
    originalWarn(...args);
  };

  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Error: computations created outside a `createRoot`")
    ) {
      return; // Suppress SolidJS lifecycle errors
    }
    originalError(...args);
  };
}
