/**
 * useBoxResize Composable Tests
 *
 * Tests for the useBoxResize composable covering:
 * - Resize functionality and constraints
 * - Event handling and callbacks
 * - Configuration options
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRoot } from "solid-js";
import { useBoxResize } from "../composables/useBoxResize";
import type { BoundingBox, ImageInfo } from "../types";

// Mock data
const mockImageInfo: ImageInfo = {
  width: 1920,
  height: 1080,
  src: "/test-image.jpg",
  alt: "Test image",
};

const mockBoundingBox: BoundingBox = {
  id: "test-box-1",
  label: "person",
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  color: "#007acc",
};

describe("useBoxResize", () => {
  let mockCallbacks: {
    onResizeStart: ReturnType<typeof vi.fn>;
    onResizeMove: ReturnType<typeof vi.fn>;
    onResizeEnd: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockCallbacks = {
      onResizeStart: vi.fn(),
      onResizeMove: vi.fn(),
      onResizeEnd: vi.fn(),
    };
  });

  describe("Initialization", () => {
    it("should initialize with default configuration", () => {
      createRoot(() => {
        const resizeEngine = useBoxResize({
          minWidth: 10,
          minHeight: 10,
          maxWidth: mockImageInfo.width,
          maxHeight: mockImageInfo.height,
        });

        expect(resizeEngine).toBeDefined();
        expect(typeof resizeEngine.startResize).toBe("function");
        expect(typeof resizeEngine.updateResize).toBe("function");
        expect(typeof resizeEngine.endResize).toBe("function");
        expect(typeof resizeEngine.isResizing).toBe("function");
      });
    });

    it("should initialize with custom configuration", () => {
      const customConfig = {
        minWidth: 20,
        minHeight: 20,
        maxWidth: 1000,
        maxHeight: 800,
        enableProportionalResizing: true,
        enableCornerHandles: true,
        enableEdgeHandles: false,
        onResizeStart: mockCallbacks.onResizeStart,
        onResizeMove: mockCallbacks.onResizeMove,
        onResizeEnd: mockCallbacks.onResizeEnd,
      };

      const resizeEngine = useBoxResize(customConfig);

      expect(resizeEngine).toBeDefined();
    });
  });

  describe("Resize Operations", () => {
    it("should start resize operation", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
        onResizeStart: mockCallbacks.onResizeStart,
      });

      const handle = resizeEngine.handles()[0]; // Get first available handle
      resizeEngine.startResize(mockBoundingBox.id, handle, {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });

      expect(mockCallbacks.onResizeStart).toHaveBeenCalledWith(
        mockBoundingBox.id,
        expect.objectContaining({
          ...handle,
          constraints: expect.objectContaining({
            ...handle.constraints,
            aspectRatio: expect.any(Number),
          }),
        })
      );
      expect(resizeEngine.isResizing()).toBe(true);
    });

    it("should update resize operation", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
        onResizeMove: mockCallbacks.onResizeMove,
      });

      const handle = resizeEngine.handles()[0];
      resizeEngine.startResize(mockBoundingBox.id, handle, {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
      resizeEngine.updateResize({ x: 100, y: 100, width: 250, height: 200 });

      expect(mockCallbacks.onResizeMove).toHaveBeenCalledWith(
        mockBoundingBox.id,
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
          width: expect.any(Number),
          height: expect.any(Number),
        })
      );
    });

    it("should end resize operation", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
        onResizeEnd: mockCallbacks.onResizeEnd,
      });

      const handle = resizeEngine.handles()[0];
      resizeEngine.startResize(mockBoundingBox.id, handle, {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
      resizeEngine.endResize();

      expect(mockCallbacks.onResizeEnd).toHaveBeenCalledWith(
        mockBoundingBox.id,
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
          width: expect.any(Number),
          height: expect.any(Number),
        })
      );
      expect(resizeEngine.isResizing()).toBe(false);
    });
  });

  describe("Constraints and Validation", () => {
    it("should enforce minimum width constraint", () => {
      const resizeEngine = useBoxResize({
        minWidth: 50,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
        onResizeMove: mockCallbacks.onResizeMove,
      });

      const handle = resizeEngine.handles()[0];
      resizeEngine.startResize(mockBoundingBox.id, handle, {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
      // Try to resize to smaller than minimum width
      resizeEngine.updateResize({ x: 100, y: 100, width: 20, height: 150 }); // Only 20px width

      const callArgs = mockCallbacks.onResizeMove.mock.calls[0];
      const dimensions = callArgs[1];
      expect(dimensions.width).toBeGreaterThanOrEqual(50);
    });

    it("should enforce minimum height constraint", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 50,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
        onResizeMove: mockCallbacks.onResizeMove,
      });

      const handle = resizeEngine.handles()[0];
      resizeEngine.startResize(mockBoundingBox.id, handle, {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
      // Try to resize to smaller than minimum height
      resizeEngine.updateResize({ x: 100, y: 100, width: 200, height: 20 }); // Only 20px height

      const callArgs = mockCallbacks.onResizeMove.mock.calls[0];
      const dimensions = callArgs[1];
      expect(dimensions.height).toBeGreaterThanOrEqual(50);
    });

    it("should enforce maximum width constraint", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: 100,
        maxHeight: mockImageInfo.height,
        onResizeMove: mockCallbacks.onResizeMove,
      });

      const handle = resizeEngine.handles()[0];
      resizeEngine.startResize(mockBoundingBox.id, handle, {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
      // Try to resize beyond maximum width
      resizeEngine.updateResize({ x: 100, y: 100, width: 200, height: 150 }); // 200px width

      const callArgs = mockCallbacks.onResizeMove.mock.calls[0];
      const dimensions = callArgs[1];
      expect(dimensions.width).toBeLessThanOrEqual(100);
    });

    it("should enforce maximum height constraint", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: 100,
        onResizeMove: mockCallbacks.onResizeMove,
      });

      const handles = resizeEngine.handles();
      const seHandle = handles.find(h => h.position === "bottom-right");
      resizeEngine.startResize(mockBoundingBox.id, seHandle!, {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
      // Try to resize beyond maximum height
      resizeEngine.updateResize({ x: 100, y: 100, width: 200, height: 200 }); // 200px height

      const callArgs = mockCallbacks.onResizeMove.mock.calls[0];
      const dimensions = callArgs[1];
      expect(dimensions.height).toBeLessThanOrEqual(100);
    });
  });

  describe("Proportional Resizing", () => {
    it("should maintain aspect ratio when proportional resizing is enabled", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
        enableProportionalResizing: true,
        onResizeMove: mockCallbacks.onResizeMove,
      });

      const handles = resizeEngine.handles();
      const seHandle = handles.find(h => h.position === "bottom-right");
      resizeEngine.startResize(mockBoundingBox.id, seHandle!, {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
      resizeEngine.updateResize({ x: 100, y: 100, width: 400, height: 300 }); // Double both dimensions

      const callArgs = mockCallbacks.onResizeMove.mock.calls[0];
      const dimensions = callArgs[1];

      // Should maintain the original aspect ratio (200/150 = 1.33...)
      const aspectRatio = dimensions.width / dimensions.height;
      const originalAspectRatio = mockBoundingBox.width / mockBoundingBox.height;
      expect(Math.abs(aspectRatio - originalAspectRatio)).toBeLessThan(0.1);
    });

    it("should allow free resizing when proportional resizing is disabled", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
        enableProportionalResizing: false,
        onResizeMove: mockCallbacks.onResizeMove,
      });

      const handles = resizeEngine.handles();
      const seHandle = handles.find(h => h.position === "bottom-right");
      resizeEngine.startResize(mockBoundingBox.id, seHandle!, {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
      resizeEngine.updateResize({ x: 100, y: 100, width: 200, height: 300 }); // Different ratios

      const callArgs = mockCallbacks.onResizeMove.mock.calls[0];
      const dimensions = callArgs[1];

      // Should allow different aspect ratio
      const aspectRatio = dimensions.width / dimensions.height;
      const originalAspectRatio = mockBoundingBox.width / mockBoundingBox.height;
      expect(Math.abs(aspectRatio - originalAspectRatio)).toBeGreaterThan(0.1);
    });
  });

  describe("Handle Types", () => {
    it("should handle corner resize handles", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
        enableCornerHandles: true,
        enableEdgeHandles: false,
        onResizeMove: mockCallbacks.onResizeMove,
      });

      const handles = resizeEngine.handles();
      const cornerHandles = handles.filter(
        h =>
          h.position === "top-left" ||
          h.position === "top-right" ||
          h.position === "bottom-left" ||
          h.position === "bottom-right"
      );

      cornerHandles.forEach(handle => {
        resizeEngine.startResize(mockBoundingBox.id, handle, {
          x: 100,
          y: 100,
          width: 200,
          height: 150,
        });
        resizeEngine.updateResize({ x: 100, y: 100, width: 300, height: 200 });
        resizeEngine.endResize();
      });

      expect(mockCallbacks.onResizeMove).toHaveBeenCalledTimes(cornerHandles.length);
    });

    it("should handle edge resize handles", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
        enableCornerHandles: false,
        enableEdgeHandles: true,
        onResizeMove: mockCallbacks.onResizeMove,
      });

      const handles = resizeEngine.handles();
      const edgeHandles = handles.filter(
        h => h.position === "top" || h.position === "bottom" || h.position === "left" || h.position === "right"
      );

      edgeHandles.forEach(handle => {
        resizeEngine.startResize(mockBoundingBox.id, handle, {
          x: 100,
          y: 100,
          width: 200,
          height: 150,
        });
        resizeEngine.updateResize({ x: 100, y: 100, width: 300, height: 200 });
        resizeEngine.endResize();
      });

      expect(mockCallbacks.onResizeMove).toHaveBeenCalledTimes(edgeHandles.length);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid box ID gracefully", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
      });

      expect(() => {
        const handles = resizeEngine.handles();
        const seHandle = handles.find(h => h.position === "bottom-right");
        resizeEngine.startResize("invalid-id", seHandle!, {
          x: 100,
          y: 100,
          width: 200,
          height: 150,
        });
      }).not.toThrow();
    });

    it("should handle invalid handle type gracefully", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
      });

      expect(() => {
        const invalidHandle = {
          id: "invalid",
          position: "invalid" as any,
          cursor: "default",
          constraints: {},
        };
        resizeEngine.startResize(mockBoundingBox.id, invalidHandle, {
          x: 100,
          y: 100,
          width: 200,
          height: 150,
        });
      }).not.toThrow();
    });

    it("should handle update resize without starting resize", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
      });

      expect(() => {
        resizeEngine.updateResize({ x: 100, y: 100, width: 300, height: 200 });
      }).not.toThrow();
    });

    it("should handle end resize without starting resize", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
      });

      expect(() => {
        resizeEngine.endResize();
      }).not.toThrow();
    });
  });

  describe("State Management", () => {
    it("should track resize state correctly", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
      });

      expect(resizeEngine.isResizing()).toBe(false);

      const handles = resizeEngine.handles();
      const seHandle = handles.find(h => h.position === "bottom-right");
      resizeEngine.startResize(mockBoundingBox.id, seHandle!, {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
      expect(resizeEngine.isResizing()).toBe(true);

      resizeEngine.endResize();
      expect(resizeEngine.isResizing()).toBe(false);
    });

    it("should track current box ID during resize", () => {
      const resizeEngine = useBoxResize({
        minWidth: 10,
        minHeight: 10,
        maxWidth: mockImageInfo.width,
        maxHeight: mockImageInfo.height,
      });

      const handles = resizeEngine.handles();
      const seHandle = handles.find(h => h.position === "bottom-right");
      resizeEngine.startResize(mockBoundingBox.id, seHandle!, {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });
      expect(resizeEngine.getCurrentBoxId()).toBe(mockBoundingBox.id);

      resizeEngine.endResize();
      expect(resizeEngine.getCurrentBoxId()).toBe(null);
    });
  });
});
