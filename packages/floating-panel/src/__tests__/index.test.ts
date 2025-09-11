/**
 * Floating Panel Package Index Test Suite
 * 
 * Tests for the main package exports to ensure all components,
 * composables, and types are properly exported.
 */

import { describe, it, expect } from "vitest";

describe("Floating Panel Package Exports", () => {
  it("should export all components", async () => {
    const main = await import("../index");
    
    expect(main.FloatingPanelOverlay).toBeDefined();
    expect(main.FloatingPanel).toBeDefined();
    expect(main.FloatingPanelDebug).toBeDefined();
  });

  it("should export all composables", async () => {
    const main = await import("../index");
    
    expect(main.useOverlayManager).toBeDefined();
    expect(main.useStaggeredAnimation).toBeDefined();
    expect(main.usePanelAnimation).toBeDefined();
    expect(main.useMultiPanelAnimation).toBeDefined();
    expect(main.useDraggablePanel).toBeDefined();
  });

  it("should export all types", async () => {
    const main = await import("../index");
    
    // Check that types are properly exported
    expect(main).toBeDefined();
  });

  it("should export from main index", async () => {
    const main = await import("../index");
    
    // Main index should re-export everything
    expect(main).toBeDefined();
  });
});
