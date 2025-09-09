/**
 * Test Setup
 * Global test configuration and mocks
 */

import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock localStorage and sessionStorage
const createStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
};

Object.defineProperty(window, "localStorage", {
  value: createStorage(),
  writable: true,
});

Object.defineProperty(window, "sessionStorage", {
  value: createStorage(),
  writable: true,
});

// Mock crypto API
Object.defineProperty(global, "crypto", {
  value: {
    getRandomValues: (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        // Use a more random approach for testing
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    subtle: {
      digest: vi.fn(async (algorithm: string, data: Uint8Array) => {
        const hash = new Uint8Array(32);
        // Use algorithm name and data to create different hashes
        const algorithmOffset = algorithm === "SHA-1" ? 100 : 200;
        const dataHash = data.reduce((acc, byte) => acc + byte, 0);
        for (let i = 0; i < hash.length; i++) {
          hash[i] =
            (data[i % data.length] + i + algorithmOffset + dataHash) % 256;
        }
        return hash;
      }),
    },
  },
  writable: true,
});

// Mock fetch
global.fetch = vi.fn();

// Mock performance API
Object.defineProperty(global, "performance", {
  value: {
    now: vi.fn(() => Date.now()),
  },
  writable: true,
});

// Mock btoa for base64 encoding
global.btoa = vi.fn((str: string) =>
  Buffer.from(str, "binary").toString("base64"),
);

// Mock TextEncoder
global.TextEncoder = class TextEncoder {
  encode(input: string): Uint8Array {
    return new Uint8Array(Buffer.from(input, "utf8"));
  }
};

// Mock TextDecoder
global.TextDecoder = class TextDecoder {
  decode(input: Uint8Array): string {
    return Buffer.from(input).toString("utf8");
  }
};
