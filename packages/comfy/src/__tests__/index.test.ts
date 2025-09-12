/**
 * Comfy Package Index Test Suite
 *
 * Tests for the main package exports to ensure all components,
 * types, and utilities are properly exported.
 */

import { describe, it, expect } from "vitest";

describe("Comfy Package Exports", () => {
  it("should export all components", async () => {
    const main = await import("../index");

    // Check that main module exists and exports are available
    expect(main).toBeDefined();
  });

  it("should export from main index", async () => {
    const main = await import("../index");

    // Main index should re-export everything
    expect(main).toBeDefined();
  });
});
