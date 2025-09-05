/**
 * Test setup for Fluent Icons package
 */

import { beforeAll } from "vitest";

// Mock DOM environment for tests
beforeAll(() => {
  // Create a mock document.createElement for SVG elements
  if (typeof document === "undefined") {
    global.document = {
      createElement: (tagName: string) => {
        if (tagName === "span") {
          return {
            innerHTML: "",
            children: [],
          };
        }
        return {};
      },
    } as any;
  }
});
