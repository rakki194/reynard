/**
 * Visibility Tests
 *
 * Tests for panel visibility and state management.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@solidjs/testing-library";
import { useDraggablePanel } from "../../../useDraggablePanel";

describe("useDraggablePanel - Visibility", () => {
  const mockPanelRef = () => document.createElement("div");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show panel", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));

    act(() => {
      result.current.show();
    });

    expect(result.current.isVisible()).toBe(true);
  });

  it("should hide panel", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));

    act(() => {
      result.current.hide();
    });

    expect(result.current.isVisible()).toBe(false);
  });

  it("should toggle panel visibility", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));

    expect(result.current.isVisible()).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isVisible()).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isVisible()).toBe(true);
  });

  it("should handle multiple show calls", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));

    act(() => {
      result.current.show();
      result.current.show();
      result.current.show();
    });

    expect(result.current.isVisible()).toBe(true);
  });

  it("should handle multiple hide calls", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));

    act(() => {
      result.current.hide();
      result.current.hide();
      result.current.hide();
    });

    expect(result.current.isVisible()).toBe(false);
  });

  it("should maintain position when toggling visibility", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));

    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });
      result.current.updateDrag({ clientX: 150, clientY: 250 });
      result.current.endDrag();
      result.current.hide();
      result.current.show();
    });

    expect(result.current.position()).toEqual({ top: 50, left: 50 });
  });

  it("should handle drag operations when hidden", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));

    act(() => {
      result.current.hide();
      result.current.startDrag({ clientX: 100, clientY: 200 });
      result.current.updateDrag({ clientX: 150, clientY: 250 });
      result.current.endDrag();
    });

    expect(result.current.isVisible()).toBe(false);
    expect(result.current.isDragging()).toBe(false);
  });
});
