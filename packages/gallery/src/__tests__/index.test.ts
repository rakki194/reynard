/**
 * Gallery Package Index Test Suite
 *
 * Tests for the main package exports to ensure all components,
 * composables, and utilities are properly exported.
 */

import { describe, it, expect } from "vitest";

describe("Gallery Package Exports", () => {
  it("should export all components", async () => {
    const components = await import("../components");

    expect(components.Gallery).toBeDefined();
    expect(components.GalleryGrid).toBeDefined();
    expect(components.BreadcrumbNavigation).toBeDefined();
    expect(components.FileUploadZone).toBeDefined();
    expect(components.FileUpload).toBeDefined();
    expect(components.MultiSelect).toBeDefined();
  });

  it("should export all composables", async () => {
    const composables = await import("../composables");

    expect(composables.useGalleryState).toBeDefined();
    expect(composables.useFileUpload).toBeDefined();
    expect(composables.useFileUploadHelpers).toBeDefined();
    expect(composables.useFileValidation).toBeDefined();
    expect(composables.useSingleFileUpload).toBeDefined();
    expect(composables.useUploadActions).toBeDefined();
    expect(composables.useUploadState).toBeDefined();
    expect(composables.useUploadStats).toBeDefined();
  });

  it("should export all types", async () => {
    const types = await import("../types");

    // Check that types module exists and exports are available
    expect(types).toBeDefined();
  });

  it("should export all utilities", async () => {
    const utils = await import("../utils");

    // Check that utils module exists and exports are available
    expect(utils).toBeDefined();
  });

  it("should export demo component", async () => {
    const main = await import("../index");

    expect(main.AdvancedComponentsDemo).toBeDefined();
  });

  it("should export from main index", async () => {
    const main = await import("../index");

    // Main index should re-export everything
    expect(main).toBeDefined();
  });
});
