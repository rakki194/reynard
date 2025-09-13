/**
 * Overlay Management Tests
 *
 * Tests for adding, removing, and managing overlays.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@solidjs/testing-library";
import { useOverlayManager } from "../../composables/useOverlayManager";
describe("useOverlayManager - Overlay Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add overlay", () => {
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
    });

    expect(result.current.overlays()).toHaveLength(1);
    expect(result.current.overlays()[0]).toEqual(overlay);
  });

  it("should remove overlay", () => {
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
      result.current.removeOverlay("test-overlay");
    });

    expect(result.current.overlays()).toHaveLength(0);
  });

  it("should update overlay", () => {
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
      position: { top: 200, left: 200 },
    };
    act(() => {
      result.current.addOverlay(overlay);
      result.current.updateOverlay("test-overlay", updatedOverlay);
    });

    expect(result.current.overlays()[0]).toEqual(updatedOverlay);
  });

  it("should handle duplicate overlay IDs", () => {
    const { result } = renderHook(() => useOverlayManager());
    const overlay1 = {
      id: "duplicate-id",
      component: "TestComponent1",
      props: { title: "Test 1" },
      position: { top: 100, left: 100 },
      size: { width: 300, height: 200 },
      zIndex: 1000,
    };
    const overlay2 = {
      id: "duplicate-id",
      component: "TestComponent2",
      props: { title: "Test 2" },
      position: { top: 200, left: 200 },
      size: { width: 400, height: 300 },
      zIndex: 1001,
    };
    act(() => {
      result.current.addOverlay(overlay1);
      result.current.addOverlay(overlay2);
    });

    expect(result.current.overlays()).toHaveLength(1);
    expect(result.current.overlays()[0]).toEqual(overlay2);
  });

  it("should respect maxOverlays limit", () => {
    const config = { maxOverlays: 2 };
    const { result } = renderHook(() => useOverlayManager(config));
    const overlays = [
      {
        id: "overlay-1",
        component: "TestComponent1",
        props: { title: "Test 1" },
        position: { top: 100, left: 100 },
        size: { width: 300, height: 200 },
        zIndex: 1000,
      },
      {
        id: "overlay-2",
        component: "TestComponent2",
        props: { title: "Test 2" },
        position: { top: 200, left: 200 },
        size: { width: 300, height: 200 },
        zIndex: 1001,
      },
      {
        id: "overlay-3",
        component: "TestComponent3",
        props: { title: "Test 3" },
        position: { top: 300, left: 300 },
        size: { width: 300, height: 200 },
        zIndex: 1002,
      },
    ];
    act(() => {
      overlays.forEach((overlay) => result.current.addOverlay(overlay));
    });

    expect(result.current.overlays()).toHaveLength(2);
    expect(result.current.overlays()[0].id).toBe("overlay-2");
    expect(result.current.overlays()[1].id).toBe("overlay-3");
  });
});
