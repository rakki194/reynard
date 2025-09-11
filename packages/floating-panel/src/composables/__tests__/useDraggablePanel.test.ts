/**
 * Draggable Panel Composable Test Suite
 * 
 * Tests for the useDraggablePanel composable including drag functionality,
 * constraints, and snap points.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@solidjs/testing-library";
import { useDraggablePanel } from "../useDraggablePanel";

describe("useDraggablePanel", () => {
  const mockPanelRef = () => document.createElement("div");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef)
      );
      
      expect(result.current.isVisible()).toBe(true);
      expect(result.current.isDragging()).toBe(false);
      expect(result.current.position()).toEqual({ top: 0, left: 0 });
    });

    it("should initialize with custom position", () => {
      const initialPosition = { top: 100, left: 200 };
      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { initialPosition })
      );
      
      expect(result.current.position()).toEqual(initialPosition);
    });

    it("should initialize with constraints", () => {
      const constraints = {
        minWidth: 200,
        minHeight: 100,
        maxWidth: 800,
        maxHeight: 600,
      };

      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { constraints })
      );
      
      expect(result.current.constrainPosition).toBeDefined();
    });

    it("should initialize with snap points", () => {
      const snapPoints = [
        { top: 0, left: 0 },
        { top: 0, left: 400 },
        { top: 300, left: 0 },
        { top: 300, left: 400 },
      ];

      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { snapPoints })
      );
      
      expect(result.current.snapToPoint).toBeDefined();
    });
  });

  describe("Drag Functionality", () => {
    it("should start drag operation", () => {
      const onDragStart = vi.fn();
      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { onDragStart })
      );
      
      const mockEvent = new PointerEvent("pointerdown", {
        clientX: 100,
        clientY: 100,
      });
      
      act(() => {
        result.current.startDrag(mockEvent);
      });
      
      expect(result.current.isDragging()).toBe(true);
      expect(onDragStart).toHaveBeenCalledWith({ top: 0, left: 0 });
    });

    it("should update drag position", () => {
      const onDrag = vi.fn();
      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { onDrag })
      );
      
      const startEvent = new PointerEvent("pointerdown", {
        clientX: 100,
        clientY: 100,
      });
      
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 150,
        clientY: 150,
      });
      
      act(() => {
        result.current.startDrag(startEvent);
        result.current.updateDrag(moveEvent);
      });
      
      expect(result.current.isDragging()).toBe(true);
      expect(onDrag).toHaveBeenCalled();
    });

    it("should end drag operation", () => {
      const onDragEnd = vi.fn();
      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { onDragEnd })
      );
      
      const startEvent = new PointerEvent("pointerdown", {
        clientX: 100,
        clientY: 100,
      });
      
      act(() => {
        result.current.startDrag(startEvent);
        result.current.endDrag();
      });
      
      expect(result.current.isDragging()).toBe(false);
      expect(onDragEnd).toHaveBeenCalled();
    });

    it("should not drag when disabled", () => {
      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { enabled: false })
      );
      
      const mockEvent = new PointerEvent("pointerdown", {
        clientX: 100,
        clientY: 100,
      });
      
      act(() => {
        result.current.startDrag(mockEvent);
      });
      
      expect(result.current.isDragging()).toBe(false);
    });
  });

  describe("Position Constraints", () => {
    it("should constrain position to viewport", () => {
      const constraints = {
        minWidth: 200,
        minHeight: 100,
        maxWidth: 800,
        maxHeight: 600,
      };

      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { constraints })
      );
      
      const position = { top: -50, left: -50 };
      const constrained = result.current.constrainPosition(position);
      
      expect(constrained.top).toBeGreaterThanOrEqual(0);
      expect(constrained.left).toBeGreaterThanOrEqual(0);
    });

    it("should constrain position to custom bounds", () => {
      const constraints = {
        minWidth: 200,
        minHeight: 100,
        maxWidth: 800,
        maxHeight: 600,
        bounds: {
          top: 100,
          left: 100,
          right: 900,
          bottom: 700,
        },
      };

      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { constraints })
      );
      
      const position = { top: 50, left: 50 };
      const constrained = result.current.constrainPosition(position);
      
      expect(constrained.top).toBeGreaterThanOrEqual(100);
      expect(constrained.left).toBeGreaterThanOrEqual(100);
    });
  });

  describe("Snap Points", () => {
    it("should snap to nearest point", () => {
      const snapPoints = [
        { top: 0, left: 0 },
        { top: 0, left: 400 },
        { top: 300, left: 0 },
        { top: 300, left: 400 },
      ];

      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { snapPoints })
      );
      
      const position = { top: 10, left: 10 };
      const snapped = result.current.snapToPoint(position);
      
      expect(snapped).toEqual({ top: 0, left: 0 });
    });

    it("should snap to point within threshold", () => {
      const snapPoints = [
        { top: 0, left: 0 },
        { top: 0, left: 400 },
      ];

      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { 
          snapPoints,
          snapThreshold: 50,
        })
      );
      
      const position = { top: 25, left: 25 };
      const snapped = result.current.snapToPoint(position);
      
      expect(snapped).toEqual({ top: 0, left: 0 });
    });

    it("should not snap when outside threshold", () => {
      const snapPoints = [
        { top: 0, left: 0 },
        { top: 0, left: 400 },
      ];

      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { 
          snapPoints,
          snapThreshold: 10,
        })
      );
      
      const position = { top: 50, left: 50 };
      const snapped = result.current.snapToPoint(position);
      
      expect(snapped).toEqual(position);
    });
  });

  describe("Drag Handle", () => {
    it("should only allow dragging from handle", () => {
      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { dragHandle: ".drag-handle" })
      );
      
      const mockEvent = new PointerEvent("pointerdown", {
        clientX: 100,
        clientY: 100,
      });
      
      // Mock target element
      const mockTarget = document.createElement("div");
      mockTarget.className = "drag-handle";
      Object.defineProperty(mockEvent, "target", { value: mockTarget });
      
      act(() => {
        result.current.startDrag(mockEvent);
      });
      
      expect(result.current.isDragging()).toBe(true);
    });

    it("should not allow dragging from non-handle elements", () => {
      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { dragHandle: ".drag-handle" })
      );
      
      const mockEvent = new PointerEvent("pointerdown", {
        clientX: 100,
        clientY: 100,
      });
      
      // Mock target element without drag handle class
      const mockTarget = document.createElement("div");
      mockTarget.className = "other-element";
      Object.defineProperty(mockEvent, "target", { value: mockTarget });
      
      act(() => {
        result.current.startDrag(mockEvent);
      });
      
      expect(result.current.isDragging()).toBe(false);
    });
  });

  describe("Event Handlers", () => {
    it("should call onDragStart when drag starts", () => {
      const onDragStart = vi.fn();
      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { onDragStart })
      );
      
      const mockEvent = new PointerEvent("pointerdown", {
        clientX: 100,
        clientY: 100,
      });
      
      act(() => {
        result.current.startDrag(mockEvent);
      });
      
      expect(onDragStart).toHaveBeenCalledWith({ top: 0, left: 0 });
    });

    it("should call onDrag during drag", () => {
      const onDrag = vi.fn();
      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { onDrag })
      );
      
      const startEvent = new PointerEvent("pointerdown", {
        clientX: 100,
        clientY: 100,
      });
      
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 150,
        clientY: 150,
      });
      
      act(() => {
        result.current.startDrag(startEvent);
        result.current.updateDrag(moveEvent);
      });
      
      expect(onDrag).toHaveBeenCalled();
    });

    it("should call onDragEnd when drag ends", () => {
      const onDragEnd = vi.fn();
      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef, { onDragEnd })
      );
      
      const startEvent = new PointerEvent("pointerdown", {
        clientX: 100,
        clientY: 100,
      });
      
      act(() => {
        result.current.startDrag(startEvent);
        result.current.endDrag();
      });
      
      expect(onDragEnd).toHaveBeenCalled();
    });
  });

  describe("State Management", () => {
    it("should track drag state", () => {
      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef)
      );
      
      const startEvent = new PointerEvent("pointerdown", {
        clientX: 100,
        clientY: 100,
      });
      
      act(() => {
        result.current.startDrag(startEvent);
      });
      
      const dragState = result.current.dragState();
      expect(dragState.isDragging).toBe(true);
      expect(dragState.startPosition).toEqual({ top: 0, left: 0 });
      expect(dragState.currentPosition).toEqual({ top: 0, left: 0 });
      expect(dragState.delta).toEqual({ x: 0, y: 0 });
    });

    it("should update position during drag", () => {
      const { result } = renderHook(() => 
        useDraggablePanel(mockPanelRef)
      );
      
      const startEvent = new PointerEvent("pointerdown", {
        clientX: 100,
        clientY: 100,
      });
      
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 150,
        clientY: 150,
      });
      
      act(() => {
        result.current.startDrag(startEvent);
        result.current.updateDrag(moveEvent);
      });
      
      const dragState = result.current.dragState();
      expect(dragState.delta).toEqual({ x: 50, y: 50 });
    });
  });
});
