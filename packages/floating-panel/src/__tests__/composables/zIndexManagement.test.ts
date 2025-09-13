/**
 * Z-Index Management Tests
 *
 * Tests for z-index handling and layering.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@solidjs/testing-library";
import { useOverlayManager } from "../../composables/useOverlayManager";
describe("useOverlayManager - Z-Index Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should assign incremental z-index values", () => {
    const config = { zIndexBase: 1000 };
    const { result } = renderHook(() => useOverlayManager(config));
    const overlays = [
      {
        id: "overlay-1",
        component: "TestComponent1",
        props: { title: "Test 1" },
        position: { top: 100, left: 100 },
        size: { width: 300, height: 200 },
      },
      {
        id: "overlay-2",
        component: "TestComponent2",
        props: { title: "Test 2" },
        position: { top: 200, left: 200 },
        size: { width: 300, height: 200 },
      },
    ];
    act(() => {
      overlays.forEach((overlay) => result.current.addOverlay(overlay));
    });

    const addedOverlays = result.current.overlays();
    expect(addedOverlays[0].zIndex).toBe(1000);
    expect(addedOverlays[1].zIndex).toBe(1001);
  });

  it("should bring overlay to front when activated", () => {
    const config = { zIndexBase: 1000 };
    const { result } = renderHook(() => useOverlayManager(config));
    const overlays = [
      {
        id: "overlay-1",
        component: "TestComponent1",
        props: { title: "Test 1" },
        position: { top: 100, left: 100 },
        size: { width: 300, height: 200 },
      },
      {
        id: "overlay-2",
        component: "TestComponent2",
        props: { title: "Test 2" },
        position: { top: 200, left: 200 },
        size: { width: 300, height: 200 },
      },
    ];
    act(() => {
      overlays.forEach((overlay) => result.current.addOverlay(overlay));
      result.current.bringToFront("overlay-1");
    });

    const addedOverlays = result.current.overlays();
    const overlay1 = addedOverlays.find((o) => o.id === "overlay-1");
    const overlay2 = addedOverlays.find((o) => o.id === "overlay-2");
    expect(overlay1?.zIndex).toBeGreaterThan(overlay2?.zIndex || 0);
  });

  it("should handle custom z-index values", () => {
    const { result } = renderHook(() => useOverlayManager());
    const overlay = {
      id: "test-overlay",
      component: "TestComponent",
      props: { title: "Test" },
      position: { top: 100, left: 100 },
      size: { width: 300, height: 200 },
      zIndex: 5000,
    };
    act(() => {
      result.current.addOverlay(overlay);
    });

    expect(result.current.overlays()[0].zIndex).toBe(5000);
  });

  it("should maintain z-index order when overlays are removed", () => {
    const config = { zIndexBase: 1000 };
    const { result } = renderHook(() => useOverlayManager(config));
    const overlays = [
      {
        id: "overlay-1",
        component: "TestComponent1",
        props: { title: "Test 1" },
        position: { top: 100, left: 100 },
        size: { width: 300, height: 200 },
      },
      {
        id: "overlay-2",
        component: "TestComponent2",
        props: { title: "Test 2" },
        position: { top: 200, left: 200 },
        size: { width: 300, height: 200 },
      },
      {
        id: "overlay-3",
        component: "TestComponent3",
        props: { title: "Test 3" },
        position: { top: 300, left: 300 },
        size: { width: 300, height: 200 },
      },
    ];
    act(() => {
      overlays.forEach((overlay) => result.current.addOverlay(overlay));
      result.current.removeOverlay("overlay-2");
      result.current.addOverlay({
        id: "overlay-4",
        component: "TestComponent4",
        props: { title: "Test 4" },
        position: { top: 400, left: 400 },
        size: { width: 300, height: 200 },
      });
    });

    const addedOverlays = result.current.overlays();
    expect(addedOverlays).toHaveLength(3);
    expect(addedOverlays[2].zIndex).toBe(1002);
  });

  it("should handle negative z-index base", () => {
    const config = { zIndexBase: -1000 };
    const { result } = renderHook(() => useOverlayManager(config));
    const overlay = {
      id: "test-overlay",
      component: "TestComponent",
      props: { title: "Test" },
      position: { top: 100, left: 100 },
      size: { width: 300, height: 200 },
    };
    act(() => {
      result.current.addOverlay(overlay);
    });

    expect(result.current.overlays()[0].zIndex).toBe(-1000);
  });
});
