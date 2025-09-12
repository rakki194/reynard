/**
 * Active Overlay Tests
 *
 * Tests for active overlay management and state tracking.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@solidjs/testing-library";
import { useOverlayManager } from "../../composables/useOverlayManager";

describe("useOverlayManager - Active Overlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should set active overlay", () => {
    const { result } = renderHook(() => useOverlayManager());

    const overlay = {
      id: "test-overlay",
      component: "TestComponent",
      props: { title: "Test" },
      position: { top: 100, left: 100 },
      size: { width: 300, height: 200 },
      zIndex: 1000,
    };

    act(() => {
      result.current.addOverlay(overlay);
      result.current.setActiveOverlay("test-overlay");
    });

    expect(result.current.activeOverlay()).toEqual(overlay);
    expect(result.current.isOverlayActive()).toBe(true);
  });

  it("should clear active overlay", () => {
    const { result } = renderHook(() => useOverlayManager());

    const overlay = {
      id: "test-overlay",
      component: "TestComponent",
      props: { title: "Test" },
      position: { top: 100, left: 100 },
      size: { width: 300, height: 200 },
      zIndex: 1000,
    };

    act(() => {
      result.current.addOverlay(overlay);
      result.current.setActiveOverlay("test-overlay");
      result.current.clearActiveOverlay();
    });

    expect(result.current.activeOverlay()).toBe(null);
    expect(result.current.isOverlayActive()).toBe(false);
  });

  it("should handle setting non-existent overlay as active", () => {
    const { result } = renderHook(() => useOverlayManager());

    act(() => {
      result.current.setActiveOverlay("non-existent");
    });

    expect(result.current.activeOverlay()).toBe(null);
    expect(result.current.isOverlayActive()).toBe(false);
  });

  it("should update active overlay when overlay is updated", () => {
    const { result } = renderHook(() => useOverlayManager());

    const overlay = {
      id: "test-overlay",
      component: "TestComponent",
      props: { title: "Test" },
      position: { top: 100, left: 100 },
      size: { width: 300, height: 200 },
      zIndex: 1000,
    };

    const updatedOverlay = {
      ...overlay,
      props: { title: "Updated Test" },
    };

    act(() => {
      result.current.addOverlay(overlay);
      result.current.setActiveOverlay("test-overlay");
      result.current.updateOverlay("test-overlay", updatedOverlay);
    });

    expect(result.current.activeOverlay()).toEqual(updatedOverlay);
  });

  it("should clear active overlay when it's removed", () => {
    const { result } = renderHook(() => useOverlayManager());

    const overlay = {
      id: "test-overlay",
      component: "TestComponent",
      props: { title: "Test" },
      position: { top: 100, left: 100 },
      size: { width: 300, height: 200 },
      zIndex: 1000,
    };

    act(() => {
      result.current.addOverlay(overlay);
      result.current.setActiveOverlay("test-overlay");
      result.current.removeOverlay("test-overlay");
    });

    expect(result.current.activeOverlay()).toBe(null);
    expect(result.current.isOverlayActive()).toBe(false);
  });
});
