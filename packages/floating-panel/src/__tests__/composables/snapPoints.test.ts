/**
 * Snap Points Tests
 *
 * Tests for snap point functionality and positioning.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@solidjs/testing-library";
import { useDraggablePanel } from "../../../useDraggablePanel";
describe("useDraggablePanel - Snap Points", () => {
  const mockPanelRef = () => document.createElement("div");
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should snap to nearest snap point", () => {
    const snapPoints = [
      { top: 0, left: 0 },
      { top: 100, left: 100 },
      { top: 200, left: 200 },
    ];
    const { result } = renderHook(() =>
      useDraggablePanel(mockPanelRef, { snapPoints }),
    );
    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });

      result.current.updateDrag({ clientX: 95, clientY: 105 });

      result.current.endDrag();
    });

    const position = result.current.position();
    expect(position).toEqual({ top: 100, left: 100 });

  });

  it("should handle snap threshold", () => {
    const snapPoints = [
      { top: 0, left: 0 },
      { top: 100, left: 100 },
    ];
    const { result } = renderHook(() =>
      useDraggablePanel(mockPanelRef, { 
        snapPoints,
        snapThreshold: 20,
      }),
    );
    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });

      result.current.updateDrag({ clientX: 85, clientY: 85 });

      result.current.endDrag();
    });

    const position = result.current.position();
    expect(position).toEqual({ top: 100, left: 100 });

  });

  it("should not snap when beyond threshold", () => {
    const snapPoints = [
      { top: 0, left: 0 },
      { top: 100, left: 100 },
    ];
    const { result } = renderHook(() =>
      useDraggablePanel(mockPanelRef, { 
        snapPoints,
        snapThreshold: 10,
      }),
    );
    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });

      result.current.updateDrag({ clientX: 150, clientY: 150 });

      result.current.endDrag();
    });

    const position = result.current.position();
    expect(position).toEqual({ top: 50, left: 50 });

  });

  it("should handle empty snap points", () => {
    const { result } = renderHook(() =>
      useDraggablePanel(mockPanelRef, { snapPoints: [] }),
    );
    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });

      result.current.updateDrag({ clientX: 150, clientY: 250 });

      result.current.endDrag();
    });

    expect(result.current.position()).toEqual({ top: 50, left: 50 });

  });

  it("should handle single snap point", () => {
    const snapPoints = [{ top: 50, left: 75 }];
    const { result } = renderHook(() =>
      useDraggablePanel(mockPanelRef, { snapPoints }),
    );
    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });

      result.current.updateDrag({ clientX: 200, clientY: 300 });

      result.current.endDrag();
    });

    expect(result.current.position()).toEqual({ top: 50, left: 75 });

  });

  it("should handle snap points with constraints", () => {
    const snapPoints = [
      { top: -50, left: -50 },
      { top: 0, left: 0 },
      { top: 100, left: 100 },
    ];
    const constraints = {
      minTop: 0,
      minLeft: 0,
      maxTop: 500,
      maxLeft: 500,
    };
    const { result } = renderHook(() =>
      useDraggablePanel(mockPanelRef, { 
        snapPoints,
        constraints,
      }),
    );
    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });

      result.current.updateDrag({ clientX: 50, clientY: 50 });

      result.current.endDrag();
    });

    const position = result.current.position();
    expect(position).toEqual({ top: 0, left: 0 });

  });

  it("should handle dynamic snap points", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));
    act(() => {
      result.current.setSnapPoints([
        { top: 25, left: 25 },
        { top: 75, left: 75 },
      ]);
    });

    expect(result.current.snapToNearest).toBeDefined();
  });

});

