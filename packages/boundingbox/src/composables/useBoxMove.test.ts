/**
 * useBoxMove Composable Tests
 *
 * Tests for the useBoxMove composable covering:
 * - Move functionality and constraints
 * - Event handling and callbacks
 * - Configuration options
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useBoxMove } from "./useBoxMove";
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

describe("useBoxMove", () => {
  let mockCallbacks: {
    onBoxMoved: ReturnType<typeof vi.fn>;
    onBoxMoveStart: ReturnType<typeof vi.fn>;
    onBoxMoveEnd: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockCallbacks = {
      onBoxMoved: vi.fn(),
      onBoxMoveStart: vi.fn(),
      onBoxMoveEnd: vi.fn(),
    };
  });

  describe("Initialization", () => {
    it("should initialize with default configuration", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      expect(moveEngine).toBeDefined();
      expect(typeof moveEngine.startBoxMove).toBe("function");
      expect(typeof moveEngine.updateBoxMove).toBe("function");
      expect(typeof moveEngine.endBoxMove).toBe("function");
      expect(typeof moveEngine.isMoving).toBe("function");
    });

    it("should initialize with custom configuration", () => {
      const customConfig = {
        imageInfo: mockImageInfo,
      };

      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, customConfig);

      expect(moveEngine).toBeDefined();
    });
  });

  describe("Move Operations", () => {
    it("should start move operation", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 100, 100);

      expect(mockCallbacks.onBoxMoveStart).toHaveBeenCalledWith(
        mockBoundingBox.id,
      );
      expect(moveEngine.isMoving()).toBe(true);
    });

    it("should update move operation", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 100, 100);
      moveEngine.updateBoxMove(150, 150);

      expect(mockCallbacks.onBoxMoved).toHaveBeenCalledWith(
        mockBoundingBox.id,
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
          width: mockBoundingBox.width,
          height: mockBoundingBox.height,
        }),
      );
    });

    it("should end move operation", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 100, 100);
      moveEngine.endBoxMove();

      expect(mockCallbacks.onBoxMoveEnd).toHaveBeenCalledWith(
        mockBoundingBox.id,
      );
      expect(moveEngine.isMoving()).toBe(false);
    });
  });

  describe("Constraints and Validation", () => {
    it("should enforce image bounds constraints", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      // Try to move box beyond image bounds
      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 2000, 2000);
      moveEngine.updateBoxMove(2000, 2000);

      const callArgs = mockCallbacks.onBoxMoved.mock.calls[0];
      const movedBox = callArgs[1];

      // Box should be constrained within image bounds
      expect(movedBox.x).toBeGreaterThanOrEqual(0);
      expect(movedBox.y).toBeGreaterThanOrEqual(0);
      expect(movedBox.x + movedBox.width).toBeLessThanOrEqual(
        mockImageInfo.width,
      );
      expect(movedBox.y + movedBox.height).toBeLessThanOrEqual(
        mockImageInfo.height,
      );
    });

    it("should allow movement beyond bounds when constraints are disabled", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      // Try to move box beyond image bounds
      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 2000, 2000);
      moveEngine.updateBoxMove(2000, 2000);

      const callArgs = mockCallbacks.onBoxMoved.mock.calls[0];
      const movedBox = callArgs[1];

      // Box should be allowed to move beyond bounds
      expect(movedBox.x).toBeGreaterThan(mockImageInfo.width);
      expect(movedBox.y).toBeGreaterThan(mockImageInfo.height);
    });

    it("should maintain box dimensions during move", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 200, 200);
      moveEngine.updateBoxMove(200, 200);

      const callArgs = mockCallbacks.onBoxMoved.mock.calls[0];
      const movedBox = callArgs[1];

      expect(movedBox.width).toBe(mockBoundingBox.width);
      expect(movedBox.height).toBe(mockBoundingBox.height);
    });
  });

  describe("Snapping and Alignment", () => {
    it("should enable snapping when configured", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      // Move to a position that should snap
      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 105, 105); // Close to 100, 100
      moveEngine.updateBoxMove(105, 105);

      const callArgs = mockCallbacks.onBoxMoved.mock.calls[0];
      const movedBox = callArgs[1];

      // Should snap to grid or alignment points
      expect(movedBox.x).toBe(100);
      expect(movedBox.y).toBe(100);
    });

    it("should disable snapping when configured", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      // Move to a position that would normally snap
      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 105, 105);
      moveEngine.updateBoxMove(105, 105);

      const callArgs = mockCallbacks.onBoxMoved.mock.calls[0];
      const movedBox = callArgs[1];

      // Should not snap
      expect(movedBox.x).toBe(105);
      expect(movedBox.y).toBe(105);
    });

    it("should enable alignment when configured", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      // Move to align with image center
      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 960, 540); // Image center
      moveEngine.updateBoxMove(960, 540);

      const callArgs = mockCallbacks.onBoxMoved.mock.calls[0];
      const movedBox = callArgs[1];

      // Should align with image center
      expect(movedBox.x).toBe(860); // 960 - 100 (half width)
      expect(movedBox.y).toBe(465); // 540 - 75 (half height)
    });
  });

  describe("Configuration Options", () => {
    it("should disable move when isEnabled is false", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 200, 200);

      // Should not call the callback when disabled
      expect(mockCallbacks.onBoxMoved).not.toHaveBeenCalled();
      expect(moveEngine.isMoving()).toBe(false);
    });

    it("should handle missing callbacks gracefully", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      expect(() => {
        moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 200, 200);
        moveEngine.updateBoxMove(250, 250);
        moveEngine.endBoxMove();
      }).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid box gracefully", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      const invalidBox = {
        ...mockBoundingBox,
        x: -100,
        y: -100,
        width: -50,
        height: -50,
      };

      expect(() => {
        moveEngine.startBoxMove(invalidBox.id, invalidBox, 200, 200);
      }).not.toThrow();
    });

    it("should handle invalid image info gracefully", () => {
      const invalidImageInfo = {
        ...mockImageInfo,
        width: 0,
        height: 0,
      };

      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: invalidImageInfo,
      });

      expect(() => {
        moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 200, 200);
      }).not.toThrow();
    });

    it("should handle update move without starting move", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      expect(() => {
        moveEngine.updateBoxMove(200, 200);
      }).not.toThrow();
    });

    it("should handle end move without starting move", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      expect(() => {
        moveEngine.endBoxMove();
      }).not.toThrow();
    });
  });

  describe("State Management", () => {
    it("should track move state correctly", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      expect(moveEngine.isMoving()).toBe(false);

      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 100, 100);
      expect(moveEngine.isMoving()).toBe(true);

      moveEngine.endBoxMove();
      expect(moveEngine.isMoving()).toBe(false);
    });

    it("should track current box during move", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 100, 100);
      expect(moveEngine.movingBoxId()).toBe(mockBoundingBox.id);

      moveEngine.endBoxMove();
      expect(moveEngine.movingBoxId()).toBe(null);
    });

    it("should track move state details", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 100, 100);

      const moveState = moveEngine.moveState();
      expect(moveState).toBeDefined();
      expect(moveState?.boxId).toBe(mockBoundingBox.id);
      expect(moveState?.startX).toBe(100);
      expect(moveState?.startY).toBe(100);

      moveEngine.endBoxMove();
      expect(moveEngine.moveState()).toBe(null);
    });
  });

  describe("Performance", () => {
    it("should handle rapid move updates efficiently", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      moveEngine.startBoxMove(mockBoundingBox.id, mockBoundingBox, 100, 100);

      // Simulate rapid updates
      for (let i = 0; i < 100; i++) {
        moveEngine.updateBoxMove(100 + i, 100 + i);
      }

      moveEngine.endBoxMove();

      // Should handle all updates without issues
      expect(mockCallbacks.onBoxMoved).toHaveBeenCalled();
    });

    it("should handle multiple boxes efficiently", () => {
      const mockBoundingBoxes = {
        updateBox: vi.fn().mockReturnValue(true),
      };

      const moveEngine = useBoxMove(mockBoundingBoxes, {
        imageInfo: mockImageInfo,
      });

      const boxes = Array.from({ length: 10 }, (_, i) => ({
        ...mockBoundingBox,
        id: `box-${i}`,
        x: i * 100,
        y: i * 100,
      }));

      // Move each box
      boxes.forEach((box) => {
        moveEngine.startBoxMove(box.id, box, box.x + 50, box.y + 50);
        moveEngine.endBoxMove();
      });

      expect(mockCallbacks.onBoxMoved).toHaveBeenCalledTimes(boxes.length);
    });
  });
});
