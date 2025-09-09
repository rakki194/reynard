import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { testConfigExports } from "./test-config-exports.js";
import { testUtilityExports } from "./test-utility-exports.js";
import { testRenderExports } from "./test-render-exports.js";
import { testAssertionExports } from "./test-assertion-exports.js";
import { testMockExports } from "./test-mock-exports.js";
import { testBrowserExports } from "./test-browser-exports.js";
import { testSolidExports } from "./test-solid-exports.js";

describe("Package Exports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset any global state if needed
  });

  testConfigExports();
  testUtilityExports();
  testRenderExports();
  testAssertionExports();
  testMockExports();
  testBrowserExports();
  testSolidExports();
});
