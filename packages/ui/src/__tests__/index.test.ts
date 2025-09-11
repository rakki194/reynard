/**
 * UI Package Index Test Suite
 * 
 * Tests for the main package exports to ensure all components
 * and utilities are properly exported.
 */

import { describe, it, expect } from "vitest";

describe("UI Package Exports", () => {
  it("should export all layout components", async () => {
    const layouts = await import("../layouts");
    
    expect(layouts.AppLayout).toBeDefined();
    expect(layouts.Grid).toBeDefined();
  });

  it("should export all navigation components", async () => {
    const navigation = await import("../navigation");
    
    expect(navigation.Breadcrumb).toBeDefined();
    expect(navigation.NavMenu).toBeDefined();
  });

  it("should export all data components", async () => {
    const data = await import("../data");
    
    expect(data.DataTable).toBeDefined();
  });

  it("should export all overlay components", async () => {
    const overlays = await import("../overlays");
    
    expect(overlays.Drawer).toBeDefined();
  });

  it("should export from main index", async () => {
    const main = await import("../index");
    
    // Main index should re-export everything
    expect(main).toBeDefined();
  });
});
