"use strict";
/**
 * Test setup for color-media package
 */
// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;
// Mock document.documentElement for theme tests
Object.defineProperty(document, "documentElement", {
  value: {
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
  },
  writable: true,
});
