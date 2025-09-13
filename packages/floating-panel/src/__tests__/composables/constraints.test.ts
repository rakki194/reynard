/**
 * Constraints Tests
 *
 * Tests for position and size constraints.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@solidjs/testing-library";
import {
  useDraggablePanel,
  type UseDraggablePanelOptions,
} from "../../composables/useDraggablePanel";
import type { PanelConstraints, PanelPosition } from "../../types.js";
import type { RenderHookResult } from "@testing-library/react";
describe("useDraggablePanel - Constraints", () => {
  const mockPanelRef = () => document.createElement("div");
  const createTestHook = (constraints: PanelConstraints) =>
    renderHook(() => useDraggablePanel(mockPanelRef, { constraints }));
  const performDrag = (
    result: RenderHookResult<ReturnType<typeof useDraggablePanel>>,
    start: PanelPosition,
    end: PanelPosition,
  ) => {
    act(() => {
      result.current.startDrag(start);
      result.current.updateDrag(end);
    });
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should constrain position to viewport bounds", () => {
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

  it("should constrain position to maximum bounds", () => {
    const constraints = {
      minTop: 0,
      minLeft: 0,
      maxTop: 100,
      maxLeft: 200,
    };
    const { result } = renderHook(() =>
      useDraggablePanel(mockPanelRef, { constraints }),
    );
    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });

      result.current.updateDrag({ clientX: 1000, clientY: 1000 });
    });

    const position = result.current.position();
    expect(position.top).toBeLessThanOrEqual(100);
    expect(position.left).toBeLessThanOrEqual(200);
  });

  it("should handle dynamic constraints", () => {
    const { result } = renderHook(() => useDraggablePanel(mockPanelRef));
    act(() => {
      result.current.setConstraints({
        minTop: 50,
        minLeft: 50,
        maxTop: 300,
        maxLeft: 400,
      });
    });

    expect(result.current.constrainPosition).toBeDefined();
  });

  it("should handle invalid constraints gracefully", () => {
    const invalidConstraints = {
      minTop: 100,
      minLeft: 200,
      maxTop: 50,
      maxLeft: 100,
    };
    const { result } = renderHook(() =>
      useDraggablePanel(mockPanelRef, { constraints: invalidConstraints }),
    );
    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });

      result.current.updateDrag({ clientX: 150, clientY: 250 });
    });

    expect(result.current.position()).toBeDefined();
  });

  it("should handle zero constraints", () => {
    const zeroConstraints = {
      minTop: 0,
      minLeft: 0,
      maxTop: 0,
      maxLeft: 0,
    };
    const { result } = renderHook(() =>
      useDraggablePanel(mockPanelRef, { constraints: zeroConstraints }),
    );
    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });

      result.current.updateDrag({ clientX: 150, clientY: 250 });
    });

    expect(result.current.position()).toEqual({ top: 0, left: 0 });
  });

  it("should handle negative constraints", () => {
    const negativeConstraints = {
      minTop: -100,
      minLeft: -200,
      maxTop: -50,
      maxLeft: -100,
    };
    const { result } = renderHook(() =>
      useDraggablePanel(mockPanelRef, { constraints: negativeConstraints }),
    );
    act(() => {
      result.current.startDrag({ clientX: 100, clientY: 200 });

      result.current.updateDrag({ clientX: 150, clientY: 250 });
    });

    const position = result.current.position();
    expect(position.top).toBeGreaterThanOrEqual(-100);
    expect(position.left).toBeGreaterThanOrEqual(-200);
    expect(position.top).toBeLessThanOrEqual(-50);
    expect(position.left).toBeLessThanOrEqual(-100);
  });
});
