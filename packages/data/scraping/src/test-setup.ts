/**
 * Test setup for scraping package
 * Provides mocks for dependencies and test utilities
 */

import { vi } from "vitest";

// Mock the connection client
vi.mock("reynard-connection", () => ({
  createConnection: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    websocket: vi.fn(),
  })),
}));

// Mock the validation package
vi.mock("reynard-validation", () => ({
  validateUrl: vi.fn((url: string) => {
    try {
      new URL(url);
      return { isValid: true, error: null };
    } catch {
      return { isValid: false, error: "Invalid URL" };
    }
  }),
  validateScrapingConfig: vi.fn((config: any) => {
    return { isValid: true, errors: [] };
  }),
}));

// Mock the gallery-dl package
vi.mock("reynard-gallery-dl", () => ({
  useGalleryDownloads: vi.fn(() => ({
    downloads: vi.fn(() => []),
    startDownload: vi.fn(),
    cancelDownload: vi.fn(),
    deleteDownload: vi.fn(),
    refetch: vi.fn(),
  })),
  useGalleryProgress: vi.fn(() => ({
    progress: vi.fn(() => null),
    isConnected: vi.fn(() => true),
    error: vi.fn(() => null),
  })),
}));

// Mock the optional i18n system - it should gracefully handle missing i18n
vi.mock("reynard-i18n", () => {
  // Simulate i18n not being available by throwing an error
  throw new Error("Module not found");
});

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Global test utilities
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

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
