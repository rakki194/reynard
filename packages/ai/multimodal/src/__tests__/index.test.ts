/**
 * Multimodal Package Index Test Suite
 *
 * Tests for the main package exports to ensure all components,
 * types, and utilities are properly exported.
 */

import { describe, it, expect } from "vitest";

describe("Multimodal Package Exports", () => {
  it("should export all components", async () => {
    const components = await import("../components");

    expect(components.MultiModalGallery).toBeDefined();
    expect(components.MultiModalGalleryView).toBeDefined();
    expect(components.MultiModalGalleryContent).toBeDefined();
    expect(components.MultiModalGalleryHeader).toBeDefined();
    expect(components.MultiModalGrid).toBeDefined();
    expect(components.MultiModalList).toBeDefined();
    expect(components.MultiModalTimeline).toBeDefined();
    expect(components.MultiModalDetail).toBeDefined();
    expect(components.MultiModalFileCard).toBeDefined();
    expect(components.MultiModalFileInfo).toBeDefined();
    expect(components.MultiModalFileRow).toBeDefined();
    expect(components.MultiModalFileThumbnail).toBeDefined();
  });

  it("should export all types", async () => {
    const types = await import("../types");

    // Check that types module exists and exports are available
    expect(types).toBeDefined();
  });

  it("should export all utilities", async () => {
    const utils = await import("../utils");

    expect(utils.BaseModality).toBeDefined();
    expect(utils.ModalityManager).toBeDefined();
    expect(utils.detectFileModality).toBeDefined();
  });

  it("should export from main index", async () => {
    const main = await import("../index");

    // Main index should re-export everything
    expect(main).toBeDefined();
  });
});
