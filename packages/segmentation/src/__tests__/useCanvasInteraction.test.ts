/**
 * Canvas Interaction Tests
 *
 * Test suite for the useCanvasInteraction composable.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCanvasInteraction } from "../composables/useCanvasInteraction.js";
import type { 
  SegmentationEditorConfig, 
  SegmentationEditorState,
  Point 
} from "../types/index.js";

describe("useCanvasInteraction", () => {
  let config: SegmentationEditorConfig;
  let state: SegmentationEditorState;
  let mockCanvas: HTMLCanvasElement;
  let mockOnMouseMove: ReturnType<typeof vi.fn>;
  let mockOnZoomChange: ReturnType<typeof vi.fn>;
  let mockOnPanChange: ReturnType<typeof vi.fn>;
  let mockOnPolygonComplete: ReturnType<typeof vi.fn>;
  let mockOnPolygonUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    config = {
      enabled: true,
      showGrid: true,
      gridSize: 20,
      snapToGrid: true,
      showVertices: true,
      vertexSize: 8,
      showEdges: true,
      edgeThickness: 2,
      showFill: true,
      fillOpacity: 0.3,
      showBoundingBox: false,
      allowVertexEdit: true,
      allowEdgeEdit: true,
      allowPolygonCreation: true,
      allowPolygonDeletion: true,
      maxPolygons: 50,
      minPolygonArea: 100,
      maxPolygonArea: 1000000,
    };

    state = {
      selectedSegmentation: undefined,
      isCreating: false,
      isEditing: false,
      zoom: 1,
      panOffset: { x: 0, y: 0 },
    };

    mockCanvas = document.createElement("canvas");
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    
    // Mock getBoundingClientRect to return proper bounds
    mockCanvas.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }));

    mockOnMouseMove = vi.fn();
    mockOnZoomChange = vi.fn();
    mockOnPanChange = vi.fn();
    mockOnPolygonComplete = vi.fn();
    mockOnPolygonUpdate = vi.fn();
  });

  describe("Initialization", () => {
    it("should initialize with canvas and handlers", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onMouseMove: mockOnMouseMove,
        onZoomChange: mockOnZoomChange,
        onPanChange: mockOnPanChange,
        onPolygonComplete: mockOnPolygonComplete,
        onPolygonUpdate: mockOnPolygonUpdate,
      });

      expect(interaction).toBeDefined();
      expect(typeof interaction.handleMouseMove).toBe("function");
      expect(typeof interaction.handleWheel).toBe("function");
      expect(typeof interaction.handleMouseDown).toBe("function");
      expect(typeof interaction.handleMouseUp).toBe("function");
      expect(typeof interaction.handleDoubleClick).toBe("function");
      expect(typeof interaction.handleTouchStart).toBe("function");
      expect(typeof interaction.handleTouchMove).toBe("function");
      expect(typeof interaction.handleTouchEnd).toBe("function");
    });

    it("should initialize without optional handlers", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
      });

      expect(interaction).toBeDefined();
    });
  });

  describe("Mouse Events", () => {
    it("should handle mouse move", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onMouseMove: mockOnMouseMove,
      });

      const mouseEvent = new MouseEvent("mousemove", {
        clientX: 100,
        clientY: 200,
      });

      interaction.handleMouseMove(mouseEvent);

      expect(mockOnMouseMove).toHaveBeenCalledWith(
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    });

    it("should handle mouse down", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state: { ...state, isCreating: true },
        onPolygonComplete: mockOnPolygonComplete,
      });

      const mouseEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
        button: 0, // Left button
      });

      interaction.handleMouseDown(mouseEvent);

      // Should not complete polygon on first click
      expect(mockOnPolygonComplete).not.toHaveBeenCalled();
    });

    it("should handle mouse up", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onPolygonUpdate: mockOnPolygonUpdate,
      });

      const mouseEvent = new MouseEvent("mouseup", {
        clientX: 100,
        clientY: 200,
        button: 0,
      });

      interaction.handleMouseUp(mouseEvent);

      // Should not update polygon if not creating
      expect(mockOnPolygonUpdate).not.toHaveBeenCalled();
    });

    it("should handle double click", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state: { ...state, isCreating: true },
        onPolygonComplete: mockOnPolygonComplete,
      });

      // First add some points to the polygon by simulating mouse down events
      const mouseDownEvent1 = new MouseEvent("mousedown", {
        clientX: 50,
        clientY: 50,
        button: 0,
      });
      const mouseDownEvent2 = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 50,
        button: 0,
      });
      const mouseDownEvent3 = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 100,
        button: 0,
      });

      interaction.handleMouseDown(mouseDownEvent1);
      interaction.handleMouseDown(mouseDownEvent2);
      interaction.handleMouseDown(mouseDownEvent3);

      // Now double click to complete the polygon
      const mouseEvent = new MouseEvent("dblclick", {
        clientX: 100,
        clientY: 200,
      });

      interaction.handleDoubleClick(mouseEvent);

      expect(mockOnPolygonComplete).toHaveBeenCalled();
    });

    it("should handle right click", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state: { ...state, isCreating: true },
        onPolygonComplete: mockOnPolygonComplete,
      });

      // First add some points to the polygon by simulating mouse down events
      const mouseDownEvent1 = new MouseEvent("mousedown", {
        clientX: 50,
        clientY: 50,
        button: 0,
      });
      const mouseDownEvent2 = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 50,
        button: 0,
      });
      const mouseDownEvent3 = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 100,
        button: 0,
      });

      interaction.handleMouseDown(mouseDownEvent1);
      interaction.handleMouseDown(mouseDownEvent2);
      interaction.handleMouseDown(mouseDownEvent3);

      // Now right click to complete the polygon
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
        button: 2, // Right button
      });

      interaction.handleMouseDown(mouseEvent);

      expect(mockOnPolygonComplete).toHaveBeenCalled();
    });
  });

  describe("Wheel Events", () => {
    it("should handle wheel zoom in", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onZoomChange: mockOnZoomChange,
      });

      const wheelEvent = new WheelEvent("wheel", {
        deltaY: -100, // Negative deltaY for zoom in
        clientX: 400,
        clientY: 300,
      });

      interaction.handleWheel(wheelEvent);

      expect(mockOnZoomChange).toHaveBeenCalledWith(expect.any(Number));
    });

    it("should handle wheel zoom out", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onZoomChange: mockOnZoomChange,
      });

      const wheelEvent = new WheelEvent("wheel", {
        deltaY: 100, // Positive deltaY for zoom out
        clientX: 400,
        clientY: 300,
      });

      interaction.handleWheel(wheelEvent);

      expect(mockOnZoomChange).toHaveBeenCalledWith(expect.any(Number));
    });

    it("should handle wheel with ctrl key for zoom", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onZoomChange: mockOnZoomChange,
      });

      const wheelEvent = new WheelEvent("wheel", {
        deltaY: -100,
        clientX: 400,
        clientY: 300,
        ctrlKey: true,
      });

      interaction.handleWheel(wheelEvent);

      expect(mockOnZoomChange).toHaveBeenCalled();
    });

    it("should handle wheel without ctrl key for pan", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onPanChange: mockOnPanChange,
      });

      const wheelEvent = new WheelEvent("wheel", {
        deltaY: 100,
        clientX: 400,
        clientY: 300,
        ctrlKey: false,
      });

      interaction.handleWheel(wheelEvent);

      expect(mockOnPanChange).toHaveBeenCalledWith(
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    });
  });

  describe("Touch Events", () => {
    it("should handle touch start", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onMouseMove: mockOnMouseMove,
      });

      const touchEvent = new TouchEvent("touchstart", {
        touches: [
          new Touch({
            identifier: 1,
            target: mockCanvas,
            clientX: 100,
            clientY: 200,
          }),
        ],
      });

      interaction.handleTouchStart(touchEvent);

      // Should not call mouse move for touch start
      expect(mockOnMouseMove).not.toHaveBeenCalled();
    });

    it("should handle touch move", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onMouseMove: mockOnMouseMove,
      });

      const touchEvent = new TouchEvent("touchmove", {
        touches: [
          new Touch({
            identifier: 1,
            target: mockCanvas,
            clientX: 150,
            clientY: 250,
          }),
        ],
      });

      interaction.handleTouchMove(touchEvent);

      expect(mockOnMouseMove).toHaveBeenCalledWith(
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    });

    it("should handle touch end", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state: { ...state, isCreating: true },
        onPolygonComplete: mockOnPolygonComplete,
      });

      const touchEvent = new TouchEvent("touchend", {
        changedTouches: [
          new Touch({
            identifier: 1,
            target: mockCanvas,
            clientX: 100,
            clientY: 200,
          }),
        ],
      });

      interaction.handleTouchEnd(touchEvent);

      // Should not complete polygon on touch end unless configured
      expect(mockOnPolygonComplete).not.toHaveBeenCalled();
    });

    it("should handle multi-touch", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onZoomChange: mockOnZoomChange,
        onPanChange: mockOnPanChange,
      });

      const touchEvent = new TouchEvent("touchmove", {
        touches: [
          new Touch({
            identifier: 1,
            target: mockCanvas,
            clientX: 100,
            clientY: 200,
          }),
          new Touch({
            identifier: 2,
            target: mockCanvas,
            clientX: 200,
            clientY: 300,
          }),
        ],
      });

      interaction.handleTouchMove(touchEvent);

      // Multi-touch should be handled differently (zoom/pan)
      expect(mockOnMouseMove).not.toHaveBeenCalled();
    });
  });

  describe("Coordinate Transformation", () => {
    it("should transform coordinates correctly", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state: {
          ...state,
          zoom: 2,
          panOffset: { x: 50, y: 100 },
        },
        onMouseMove: mockOnMouseMove,
      });

      const mouseEvent = new MouseEvent("mousemove", {
        clientX: 100,
        clientY: 200,
      });

      interaction.handleMouseMove(mouseEvent);

      expect(mockOnMouseMove).toHaveBeenCalledWith(
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    });

    it("should handle canvas bounds", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onMouseMove: mockOnMouseMove,
      });

      // Test coordinates outside canvas bounds
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: -100,
        clientY: -100,
      });

      interaction.handleMouseMove(mouseEvent);

      expect(mockOnMouseMove).toHaveBeenCalled();
    });
  });

  describe("Grid Snapping", () => {
    it("should snap to grid when enabled", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config: { ...config, snapToGrid: true, gridSize: 20 },
        state,
        onMouseMove: mockOnMouseMove,
      });

      const mouseEvent = new MouseEvent("mousemove", {
        clientX: 105, // Should snap to 100
        clientY: 205, // Should snap to 200
      });

      interaction.handleMouseMove(mouseEvent);

      expect(mockOnMouseMove).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 100,
          y: 200,
        })
      );
    });

    it("should not snap to grid when disabled", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config: { ...config, snapToGrid: false },
        state,
        onMouseMove: mockOnMouseMove,
      });

      const mouseEvent = new MouseEvent("mousemove", {
        clientX: 105,
        clientY: 205,
      });

      interaction.handleMouseMove(mouseEvent);

      expect(mockOnMouseMove).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 105,
          y: 205,
        })
      );
    });
  });

  describe("State-Based Behavior", () => {
    it("should handle creating state", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state: { ...state, isCreating: true },
        onPolygonUpdate: mockOnPolygonUpdate,
      });

      const mouseEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
        button: 0,
      });

      interaction.handleMouseDown(mouseEvent);

      // Should start creating polygon
      expect(mockOnPolygonUpdate).toHaveBeenCalled();
    });

    it("should handle editing state", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state: { ...state, isEditing: true, selectedSegmentation: "test-seg" },
        onPolygonUpdate: mockOnPolygonUpdate,
      });

      const mouseEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 200,
        button: 0,
      });

      interaction.handleMouseDown(mouseEvent);

      // Should update existing polygon
      expect(mockOnPolygonUpdate).toHaveBeenCalledWith(
        expect.any(Array),
        "test-seg"
      );
    });

    it("should handle disabled state", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config: { ...config, enabled: false },
        state,
        onMouseMove: mockOnMouseMove,
      });

      const mouseEvent = new MouseEvent("mousemove", {
        clientX: 100,
        clientY: 200,
      });

      interaction.handleMouseMove(mouseEvent);

      // Should not handle events when disabled
      expect(mockOnMouseMove).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle missing canvas gracefully", () => {
      const interaction = useCanvasInteraction({
        canvas: () => undefined,
        config,
        state,
        onMouseMove: mockOnMouseMove,
      });

      const mouseEvent = new MouseEvent("mousemove", {
        clientX: 100,
        clientY: 200,
      });

      expect(() => interaction.handleMouseMove(mouseEvent)).not.toThrow();
    });

    it("should handle invalid events gracefully", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onMouseMove: mockOnMouseMove,
      });

      expect(() => interaction.handleMouseMove(null as any)).not.toThrow();
      expect(() => interaction.handleWheel(null as any)).not.toThrow();
      expect(() => interaction.handleMouseDown(null as any)).not.toThrow();
    });

    it("should handle missing event handlers gracefully", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
      });

      const mouseEvent = new MouseEvent("mousemove", {
        clientX: 100,
        clientY: 200,
      });

      expect(() => interaction.handleMouseMove(mouseEvent)).not.toThrow();
    });
  });

  describe("Performance", () => {
    it("should handle rapid mouse movements efficiently", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onMouseMove: mockOnMouseMove,
      });

      const startTime = performance.now();

      // Simulate rapid mouse movements
      for (let i = 0; i < 100; i++) {
        const mouseEvent = new MouseEvent("mousemove", {
          clientX: i,
          clientY: i,
        });
        interaction.handleMouseMove(mouseEvent);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100); // Should complete in less than 100ms
      expect(mockOnMouseMove).toHaveBeenCalledTimes(100);
    });

    it("should handle rapid wheel events efficiently", () => {
      const interaction = useCanvasInteraction({
        canvas: () => mockCanvas,
        config,
        state,
        onZoomChange: mockOnZoomChange,
      });

      const startTime = performance.now();

      // Simulate rapid wheel events
      for (let i = 0; i < 50; i++) {
        const wheelEvent = new WheelEvent("wheel", {
          deltaY: -100,
          clientX: 400,
          clientY: 300,
        });
        interaction.handleWheel(wheelEvent);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(50); // Should complete in less than 50ms
    });
  });
});





