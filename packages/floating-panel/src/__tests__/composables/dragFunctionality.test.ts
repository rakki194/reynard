/**
 * Drag Functionality Tests
 *
 * Tests for drag operations and state management.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@solidjs/testing-library";
import { useDraggablePanel } from "../../../useDraggablePanel";

describe("useDraggablePanel - Drag Functionality", () => {
  const mockPanelRef = () => document.createElement("div");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start drag operation", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));

    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });
    });

    expect(result.current.isDragging()).toBe(true);
  });

  it("should update position during drag", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));

    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });
      result.current.updateDrag({ clientX: 150, clientY: 250 });
    });

    expect(result.current.position()).toEqual({ top: 50, left: 50 });
  });

  it("should end drag operation", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));

    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });
      result.current.endDrag();
    });

    expect(result.current.isDragging()).toBe(false);
  });

  it("should handle drag with constraints", () => {
    const constraints = {
      minTop: 0,
      minLeft: 0,
      maxTop: 500,
      maxLeft: 800,
    };

    const { result } = renderHook(() =>
      useDraggablePanel(mockPanelRef, { constraints }),
    );

    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });
      result.current.updateDrag({ clientX: -50, clientY: -100 });
    });

    const position = result.current.position();
    expect(position.top).toBeGreaterThanOrEqual(0);
    expect(position.left).toBeGreaterThanOrEqual(0);
  });

  it("should handle rapid drag movements", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));

    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });
      result.current.updateDrag({ clientX: 150, clientY: 250 });
      result.current.updateDrag({ clientX: 200, clientY: 300 });
      result.current.updateDrag({ clientX: 250, clientY: 350 });
    });

    expect(result.current.position()).toEqual({ top: 150, left: 150 });
  });

  it("should handle drag without starting drag first", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));

    act(() => {
      result.current.updateDrag({ clientX: 150, clientY: 250 });
    });

    expect(result.current.position()).toEqual({ top: 0, left: 0 });
    expect(result.current.isDragging()).toBe(false);
  });

  it("should handle end drag without starting drag first", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));

    act(() => {
      result.current.endDrag();
    });

    expect(result.current.isDragging()).toBe(false);
  });
});
