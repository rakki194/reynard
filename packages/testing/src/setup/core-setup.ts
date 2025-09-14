/**
 * Core Test Setup - For packages that need basic browser APIs and storage
 */

import { vi } from "vitest";
import { setupBrowserTest } from "./browser-setup.js";

/**
 * Setup for core packages (reynard-core, etc.)
 * Includes browser APIs, storage, and common utilities
 */
export function setupCoreTest() {
  setupBrowserTest();

  // Mock process if not available (for Node.js specific code)
  if (typeof process === "undefined") {
    global.process = {
      env: {
        NODE_ENV: "test",
        VITEST: "true",
      },
      memoryUsage: vi.fn(() => ({
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
        arrayBuffers: 0,
      })),
      nextTick: vi.fn((callback) => setTimeout(callback, 0)),
      cwd: vi.fn(() => "/test"),
      platform: "test",
      version: "v18.0.0",
      versions: {
        node: "18.0.0",
        v8: "10.0.0",
        uv: "1.0.0",
        zlib: "1.0.0",
        brotli: "1.0.0",
        ares: "1.0.0",
        modules: "108",
        nghttp2: "1.0.0",
        napi: "8",
        llhttp: "6.0.0",
        openssl: "3.0.0",
        cldr: "41.0",
        icu: "71.0",
        tz: "2022a",
        unicode: "14.0",
      },
    } as any;
  }

  // Mock setTimeout and clearTimeout for consistent testing
  global.setTimeout = vi.fn((callback, delay) => {
    return setTimeout(callback, delay) as any;
  }) as any;

  global.clearTimeout = vi.fn((id) => {
    return clearTimeout(id);
  }) as any;

  global.setInterval = vi.fn((callback, delay) => {
    return setInterval(callback, delay) as any;
  }) as any;

  global.clearInterval = vi.fn((id) => {
    return clearInterval(id);
  }) as any;
}
