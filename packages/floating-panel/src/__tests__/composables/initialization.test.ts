/**
 * Overlay Manager Initialization Tests
 *
 * Tests for overlay manager initialization and configuration.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@solidjs/testing-library";
import { useOverlayManager } from "../../composables/useOverlayManager";

describe("useOverlayManager - Initialization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useOverlayManager());

    expect(result.current.overlays()).toEqual([]);
    expect(result.current.activeOverlay()).toBe(null);
    expect(result.current.isOverlayActive()).toBe(false);
  });

  it("should initialize with custom configuration", () => {
    const config = {
      maxOverlays: 5,
      zIndexBase: 1000,
      autoClose: true,
      closeOnBackdrop: true,
    };

    const { result } = renderHook(() => useOverlayManager(config));

    expect(result.current.overlays()).toEqual([]);
  });

  it("should handle invalid configuration gracefully", () => {
    const invalidConfig = {
      maxOverlays: -1,
      zIndexBase: -100,
    };

    const { result } = renderHook(() => useOverlayManager(invalidConfig));

    expect(result.current.overlays()).toEqual([]);
  });
});
