/**
 * Audio Package Index Test Suite
 *
 * Tests for the main package exports to ensure all components
 * and utilities are properly exported.
 */

import { describe, it, expect } from "vitest";

describe("Audio Package Exports", () => {
  it("should export all components", async () => {
    const components = await import("../components");

    expect(components.AudioGrid).toBeDefined();
    expect(components.AudioPlayer).toBeDefined();
    expect(components.AudioAnalysisDashboard).toBeDefined();
    expect(components.AudioWaveformVisualizer).toBeDefined();
    expect(components.AudioWaveformComponents).toBeDefined();
  });

  it("should export all utilities", async () => {
    const utils = await import("../utils");

    expect(utils.isAudioFile).toBeDefined();
    expect(utils.getFileExtension).toBeDefined();
    expect(utils.formatDuration).toBeDefined();
    expect(utils.formatFileSize).toBeDefined();
  });

  it("should export all types", async () => {
    const types = await import("../types");

    // Check that types module exists and exports are available
    expect(types).toBeDefined();
  });

  it("should export from main index", async () => {
    const main = await import("../index");

    // Main index should re-export everything
    expect(main).toBeDefined();
  });
});
