/**
 * Event Handling Tests
 *
 * Tests for overlay event handling and callbacks.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@solidjs/testing-library";
import { useOverlayManager } from "../../composables/useOverlayManager";
describe("useOverlayManager - Event Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle overlay close events", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useOverlayManager({ onClose }));
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
      result.current.closeOverlay("test-overlay");
    });

    expect(onClose).toHaveBeenCalledWith("test-overlay");
    expect(result.current.overlays()).toHaveLength(0);
  });

  it("should handle backdrop click events", () => {
    const onBackdropClick = vi.fn();
    const { result } = renderHook(() =>
      useOverlayManager({
        closeOnBackdrop: true,
        onBackdropClick,
      }),
    );
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
      result.current.handleBackdropClick();
    });

    expect(onBackdropClick).toHaveBeenCalled();
    expect(result.current.overlays()).toHaveLength(0);
  });

  it("should not close overlay on backdrop click when disabled", () => {
    const onBackdropClick = vi.fn();
    const { result } = renderHook(() =>
      useOverlayManager({
        closeOnBackdrop: false,
        onBackdropClick,
      }),
    );
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
      result.current.handleBackdropClick();
    });

    expect(onBackdropClick).toHaveBeenCalled();
    expect(result.current.overlays()).toHaveLength(1);
  });

  it("should handle overlay focus events", () => {
    const onFocus = vi.fn();
    const { result } = renderHook(() => useOverlayManager({ onFocus }));
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
      result.current.focusOverlay("test-overlay");
    });

    expect(onFocus).toHaveBeenCalledWith("test-overlay");
  });

  it("should handle overlay blur events", () => {
    const onBlur = vi.fn();
    const { result } = renderHook(() => useOverlayManager({ onBlur }));
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
      result.current.blurOverlay("test-overlay");
    });

    expect(onBlur).toHaveBeenCalledWith("test-overlay");
  });

  it("should handle multiple event callbacks", () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useOverlayManager({
        onAdd,
        onRemove,
        onUpdate,
      }),
    );
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
      result.current.updateOverlay("test-overlay", {
        ...overlay,
        props: { title: "Updated" },
      });

      result.current.removeOverlay("test-overlay");
    });

    expect(onAdd).toHaveBeenCalledWith(overlay);
    expect(onUpdate).toHaveBeenCalledWith("test-overlay", {
      ...overlay,
      props: { title: "Updated" },
    });

    expect(onRemove).toHaveBeenCalledWith("test-overlay");
  });
});
