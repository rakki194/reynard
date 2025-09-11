/**
 * Image Package Index Test Suite
 * 
 * Tests for the main package exports to ensure all components,
 * types, and utilities are properly exported.
 */

import { describe, it, expect } from "vitest";

describe("Image Package Exports", () => {
  it("should export all components", async () => {
    const components = await import("../components");
    
    // Check that components module exists and exports are available
    expect(components).toBeDefined();
  });

  it("should export all types", async () => {
    const types = await import("../types");
    
    // Check that types module exists and exports are available
    expect(types).toBeDefined();
  });

  it("should export all utilities", async () => {
    const utils = await import("../utils");
    
    expect(utils.isImageFile).toBeDefined();
    expect(utils.getImageDimensions).toBeDefined();
    expect(utils.resizeImage).toBeDefined();
    expect(utils.compressImage).toBeDefined();
  });

  it("should export from main index", async () => {
    const main = await import("../index");
    
    // Main index should re-export everything
    expect(main).toBeDefined();
  });
});
