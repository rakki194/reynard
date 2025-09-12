/**
 * Overlay Manager Composable Test Suite
 *
 * Tests for the useOverlayManager composable including overlay management,
 * state tracking, and event handling.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@solidjs/testing-library";
import { useOverlayManager } from "../useOverlayManager";

describe("useOverlayManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
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
  });

  describe("Overlay Management", () => {
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

    it("should clear all overlays", () => {
      const { result } = renderHook(() => useOverlayManager());

      const overlay1 = {
        id: "overlay-1",
        component: "TestComponent1",
        props: { title: "Test 1" },
        position: { top: 100, left: 100 },
        size: { width: 300, height: 200 },
        zIndex: 1000,
      };

      const overlay2 = {
        id: "overlay-2",
        component: "TestComponent2",
        props: { title: "Test 2" },
        position: { top: 200, left: 200 },
        size: { width: 300, height: 200 },
        zIndex: 1001,
      };

      act(() => {
        result.current.addOverlay(overlay1);
        result.current.addOverlay(overlay2);
        result.current.clearOverlays();
      });

      expect(result.current.overlays()).toHaveLength(0);
    });
  });

  describe("Active Overlay Management", () => {
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

      expect(result.current.activeOverlay()).toBe("test-overlay");
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

    it("should automatically set active overlay when adding", () => {
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
        result.current.addOverlay(overlay, { setActive: true });
      });

      expect(result.current.activeOverlay()).toBe("test-overlay");
    });
  });

  describe("Z-Index Management", () => {
    it("should assign incremental z-index values", () => {
      const { result } = renderHook(() => useOverlayManager());

      const overlay1 = {
        id: "overlay-1",
        component: "TestComponent1",
        props: { title: "Test 1" },
        position: { top: 100, left: 100 },
        size: { width: 300, height: 200 },
      };

      const overlay2 = {
        id: "overlay-2",
        component: "TestComponent2",
        props: { title: "Test 2" },
        position: { top: 200, left: 200 },
        size: { width: 300, height: 200 },
      };

      act(() => {
        result.current.addOverlay(overlay1);
        result.current.addOverlay(overlay2);
      });

      expect(result.current.overlays()[0].zIndex).toBe(1000);
      expect(result.current.overlays()[1].zIndex).toBe(1001);
    });

    it("should bring overlay to front", () => {
      const { result } = renderHook(() => useOverlayManager());

      const overlay1 = {
        id: "overlay-1",
        component: "TestComponent1",
        props: { title: "Test 1" },
        position: { top: 100, left: 100 },
        size: { width: 300, height: 200 },
      };

      const overlay2 = {
        id: "overlay-2",
        component: "TestComponent2",
        props: { title: "Test 2" },
        position: { top: 200, left: 200 },
        size: { width: 300, height: 200 },
      };

      act(() => {
        result.current.addOverlay(overlay1);
        result.current.addOverlay(overlay2);
        result.current.bringToFront("overlay-1");
      });

      expect(result.current.overlays()[0].zIndex).toBe(1002);
      expect(result.current.overlays()[1].zIndex).toBe(1001);
    });
  });

  describe("Configuration", () => {
    it("should respect maxOverlays limit", () => {
      const { result } = renderHook(() =>
        useOverlayManager({ maxOverlays: 2 }),
      );

      const overlay1 = {
        id: "overlay-1",
        component: "TestComponent1",
        props: { title: "Test 1" },
        position: { top: 100, left: 100 },
        size: { width: 300, height: 200 },
      };

      const overlay2 = {
        id: "overlay-2",
        component: "TestComponent2",
        props: { title: "Test 2" },
        position: { top: 200, left: 200 },
        size: { width: 300, height: 200 },
      };

      const overlay3 = {
        id: "overlay-3",
        component: "TestComponent3",
        props: { title: "Test 3" },
        position: { top: 300, left: 300 },
        size: { width: 300, height: 200 },
      };

      act(() => {
        result.current.addOverlay(overlay1);
        result.current.addOverlay(overlay2);
        result.current.addOverlay(overlay3);
      });

      expect(result.current.overlays()).toHaveLength(2);
      expect(result.current.overlays()[0].id).toBe("overlay-2");
      expect(result.current.overlays()[1].id).toBe("overlay-3");
    });

    it("should use custom z-index base", () => {
      const { result } = renderHook(() =>
        useOverlayManager({ zIndexBase: 2000 }),
      );

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

      expect(result.current.overlays()[0].zIndex).toBe(2000);
    });
  });

  describe("Event Handling", () => {
    it("should call onOverlayAdd when overlay is added", () => {
      const onOverlayAdd = vi.fn();
      const { result } = renderHook(() => useOverlayManager({ onOverlayAdd }));

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

      expect(onOverlayAdd).toHaveBeenCalledWith(overlay);
    });

    it("should call onOverlayRemove when overlay is removed", () => {
      const onOverlayRemove = vi.fn();
      const { result } = renderHook(() =>
        useOverlayManager({ onOverlayRemove }),
      );

      const overlay = {
        id: "test-overlay",
        component: "TestComponent",
        props: { title: "Test" },
        position: { top: 100, left: 100 },
        size: { width: 300, height: 200 },
      };

      act(() => {
        result.current.addOverlay(overlay);
        result.current.removeOverlay("test-overlay");
      });

      expect(onOverlayRemove).toHaveBeenCalledWith("test-overlay");
    });

    it("should call onActiveOverlayChange when active overlay changes", () => {
      const onActiveOverlayChange = vi.fn();
      const { result } = renderHook(() =>
        useOverlayManager({ onActiveOverlayChange }),
      );

      const overlay = {
        id: "test-overlay",
        component: "TestComponent",
        props: { title: "Test" },
        position: { top: 100, left: 100 },
        size: { width: 300, height: 200 },
      };

      act(() => {
        result.current.addOverlay(overlay);
        result.current.setActiveOverlay("test-overlay");
      });

      expect(onActiveOverlayChange).toHaveBeenCalledWith("test-overlay");
    });
  });

  describe("Utility Functions", () => {
    it("should get overlay by id", () => {
      const { result } = renderHook(() => useOverlayManager());

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

      const foundOverlay = result.current.getOverlay("test-overlay");
      expect(foundOverlay).toEqual(overlay);
    });

    it("should return null for non-existent overlay", () => {
      const { result } = renderHook(() => useOverlayManager());

      const foundOverlay = result.current.getOverlay("non-existent");
      expect(foundOverlay).toBe(null);
    });

    it("should check if overlay exists", () => {
      const { result } = renderHook(() => useOverlayManager());

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

      expect(result.current.hasOverlay("test-overlay")).toBe(true);
      expect(result.current.hasOverlay("non-existent")).toBe(false);
    });

    it("should get overlay count", () => {
      const { result } = renderHook(() => useOverlayManager());

      const overlay1 = {
        id: "overlay-1",
        component: "TestComponent1",
        props: { title: "Test 1" },
        position: { top: 100, left: 100 },
        size: { width: 300, height: 200 },
      };

      const overlay2 = {
        id: "overlay-2",
        component: "TestComponent2",
        props: { title: "Test 2" },
        position: { top: 200, left: 200 },
        size: { width: 300, height: 200 },
      };

      act(() => {
        result.current.addOverlay(overlay1);
        result.current.addOverlay(overlay2);
      });

      expect(result.current.getOverlayCount()).toBe(2);
    });
  });
});
