/**
 * BoundingBoxEditor Integration Tests
 *
 * Integration tests for the BoundingBoxEditor component covering:
 * - Complete user workflows
 * - Canvas interactions with Fabric.js
 * - Real-time updates and state synchronization
 * - Complex scenarios and edge cases
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { BoundingBoxEditor } from "../BoundingBoxEditor";
import type {
  BoundingBox,
  ImageInfo,
  EditorConfig,
  AnnotationEventHandlers,
} from "../../types";
import { createSignal } from "solid-js";

// Mock Fabric.js more comprehensively for integration tests
const mockFabricCanvas = {
  add: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
  renderAll: vi.fn(),
  dispose: vi.fn(),
  getPointer: vi.fn().mockReturnValue({ x: 100, y: 100 }),
  findTarget: vi.fn().mockReturnValue(null),
  on: vi.fn(),
  off: vi.fn(),
  setActiveObject: vi.fn(),
  getActiveObject: vi.fn(),
  getElement: vi.fn().mockReturnValue({
    parentElement: {
      getBoundingClientRect: vi.fn().mockReturnValue({
        width: 800,
        height: 600,
      }),
    },
  }),
};

const mockFabricRect = {
  set: vi.fn(),
  setControlsVisibility: vi.fn(),
  data: {},
};

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

const defaultConfig: EditorConfig = {
  enableCreation: true,
  enableEditing: true,
  enableDeletion: true,
  labelClasses: ["person", "vehicle", "animal", "object"],
  defaultLabelClass: "person",
};

describe("BoundingBoxEditor Integration Tests", () => {
  let mockEventHandlers: AnnotationEventHandlers;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock fabric module
    vi.doMock("fabric", () => ({
      Canvas: vi.fn().mockImplementation(() => mockFabricCanvas),
      Rect: vi.fn().mockImplementation(() => mockFabricRect),
    }));

    mockEventHandlers = {
      onAnnotationCreate: vi.fn(),
      onAnnotationUpdate: vi.fn(),
      onAnnotationDelete: vi.fn(),
      onAnnotationSelect: vi.fn(),
      onEditingStart: vi.fn(),
      onEditingEnd: vi.fn(),
      onEditingCancel: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Complete User Workflows", () => {
    it("should handle complete box creation workflow", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
        />
      ));

      // Simulate canvas mouse events for box creation
      const canvas = screen
        .getByRole("img", { name: /bounding box editor canvas/i })
        .querySelector("canvas");
      expect(canvas).toBeInTheDocument();

      // Wait for component to fully initialize
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the mock fabric canvas instance
      const mockFabricCanvas = (global as any).getMockFabricCanvas();
      if (mockFabricCanvas) {
        // Simulate mouse down to start drawing
        mockFabricCanvas.triggerEvent("mouse:down", {
          e: { clientX: 100, clientY: 100 },
        });

        // Simulate mouse move to draw box
        mockFabricCanvas.triggerEvent("mouse:move", {
          e: { clientX: 200, clientY: 200 },
        });

        // Simulate mouse up to finish drawing
        mockFabricCanvas.triggerEvent("mouse:up", {
          e: { clientX: 200, clientY: 200 },
        });
      }

      await waitFor(() => {
        expect(mockEventHandlers.onAnnotationCreate).toHaveBeenCalled();
      });

      // Check that box count increased
      expect(screen.getByText("Bounding Boxes (1)")).toBeInTheDocument();
    });

    it("should handle complete box editing workflow", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Start editing
      const editButton = screen.getByRole("button", { name: /edit/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(mockEventHandlers.onEditingStart).toHaveBeenCalledWith(
          mockBoundingBox.id,
          "edit",
        );
      });

      // Save editing
      const saveButton = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockEventHandlers.onEditingEnd).toHaveBeenCalledWith(
          mockBoundingBox.id,
          "edit",
        );
      });
    });

    it("should handle complete box deletion workflow", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Delete box
      const deleteButton = screen.getByRole("button", { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockEventHandlers.onAnnotationDelete).toHaveBeenCalledWith(
          mockBoundingBox.id,
        );
      });

      // Check that box count decreased
      expect(screen.getByText("Bounding Boxes (0)")).toBeInTheDocument();
    });
  });

  describe("Canvas Interactions", () => {
    it("should handle canvas click on existing box", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      const canvas = screen
        .getByRole("img", { name: /bounding box editor canvas/i })
        .querySelector("canvas");

      // Wait for component to fully initialize
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the mock fabric canvas instance
      const mockFabricCanvas = (global as any).getMockFabricCanvas();
      if (mockFabricCanvas) {
        // Mock findTarget to return the box object
        mockFabricCanvas.findTarget.mockReturnValue({
          data: { boxId: mockBoundingBox.id },
        });

        // Simulate click on existing box
        mockFabricCanvas.triggerEvent("mouse:down", {
          e: { clientX: 150, clientY: 150 },
        });
      }

      await waitFor(() => {
        expect(mockEventHandlers.onAnnotationSelect).toHaveBeenCalledWith(
          mockBoundingBox.id,
        );
      });
    });

    it("should handle canvas click on empty area", async () => {
      // Mock not finding a target object
      mockFabricCanvas.findTarget.mockReturnValue(null);

      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
        />
      ));

      const canvas = screen
        .getByRole("img", { name: /bounding box editor canvas/i })
        .querySelector("canvas");

      // Simulate click on empty area
      fireEvent.mouseDown(canvas!, { clientX: 50, clientY: 50 });

      // Should not call select handler
      expect(mockEventHandlers.onAnnotationSelect).not.toHaveBeenCalled();
    });

    it("should handle canvas resize interactions", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Simulate resize start
      const canvas = screen
        .getByRole("img", { name: /bounding box editor canvas/i })
        .querySelector("canvas");

      // Wait for component to fully initialize
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the mock fabric canvas instance
      const mockFabricCanvas = (global as any).getMockFabricCanvas();
      if (mockFabricCanvas) {
        // Mock findTarget to return the box object for resize
        mockFabricCanvas.findTarget.mockReturnValue({
          data: { boxId: mockBoundingBox.id },
        });

        // Simulate resize start
        mockFabricCanvas.triggerEvent("mouse:down", {
          e: { clientX: 300, clientY: 250 },
        });

        // Simulate resize move
        mockFabricCanvas.triggerEvent("mouse:move", {
          e: { clientX: 350, clientY: 300 },
        });

        // Simulate resize end
        mockFabricCanvas.triggerEvent("mouse:up", {
          e: { clientX: 350, clientY: 300 },
        });
      }

      await waitFor(() => {
        expect(mockEventHandlers.onAnnotationUpdate).toHaveBeenCalled();
      });
    });
  });

  describe("State Synchronization", () => {
    it("should synchronize box selection between canvas and UI", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Box should be selected by default
      const boxItem = screen
        .getByText("person", { selector: ".box-label" })
        .closest(".box-item");
      expect(boxItem).toHaveClass("selected");

      // Simulate clicking on another box (if we had multiple)
      const secondBox: BoundingBox = {
        ...mockBoundingBox,
        id: "box-2",
        x: 300,
        y: 300,
      };

      // Wait for component to fully initialize
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the mock fabric canvas instance
      const mockFabricCanvas = (global as any).getMockFabricCanvas();
      if (mockFabricCanvas) {
        // Mock findTarget to return the second box
        mockFabricCanvas.findTarget.mockReturnValue({
          data: { boxId: secondBox.id },
        });

        // Simulate clicking on the second box
        mockFabricCanvas.triggerEvent("mouse:down", {
          e: { clientX: 350, clientY: 350 },
        });
      }

      await waitFor(() => {
        expect(mockEventHandlers.onAnnotationSelect).toHaveBeenCalledWith(
          secondBox.id,
        );
      });
    });

    it("should update box count in real-time", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[]}
        />
      ));

      // Initially no boxes
      expect(screen.getByText("Bounding Boxes (0)")).toBeInTheDocument();

      // Wait for component to fully initialize
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Simulate adding a box through canvas interaction
      const mockFabricCanvas = (global as any).getMockFabricCanvas();
      if (mockFabricCanvas) {
        // Simulate box creation
        mockFabricCanvas.triggerEvent("mouse:down", {
          e: { clientX: 100, clientY: 100 },
        });
        mockFabricCanvas.triggerEvent("mouse:move", {
          e: { clientX: 200, clientY: 200 },
        });
        mockFabricCanvas.triggerEvent("mouse:up", {
          e: { clientX: 200, clientY: 200 },
        });
      }

      await waitFor(() => {
        // Box count should update
        expect(screen.getByText("Bounding Boxes (1)")).toBeInTheDocument();
      });
    });

    it("should maintain box data consistency during operations", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Verify initial box data
      expect(screen.getByText("(100, 100) 200×150")).toBeInTheDocument();

      // Simulate box update through editing
      const editButton = screen.getByRole("button", { name: /edit/i });
      fireEvent.click(editButton);

      // Box data should remain consistent
      expect(screen.getByText("(100, 100) 200×150")).toBeInTheDocument();
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle multiple boxes with different labels", async () => {
      const multipleBoxes: BoundingBox[] = [
        { ...mockBoundingBox, id: "box-1", label: "person" },
        { ...mockBoundingBox, id: "box-2", label: "vehicle", x: 300, y: 300 },
        { ...mockBoundingBox, id: "box-3", label: "animal", x: 500, y: 500 },
      ];

      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={multipleBoxes}
        />
      ));

      // Check that all boxes are displayed
      expect(screen.getByText("Bounding Boxes (3)")).toBeInTheDocument();
      expect(
        screen.getByText("person", { selector: ".box-label" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("vehicle", { selector: ".box-label" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("animal", { selector: ".box-label" }),
      ).toBeInTheDocument();

      // Check that each box has its coordinates
      expect(screen.getByText("(100, 100) 200×150")).toBeInTheDocument();
      expect(screen.getByText("(300, 300) 200×150")).toBeInTheDocument();
      expect(screen.getByText("(500, 500) 200×150")).toBeInTheDocument();
    });

    it("should handle rapid user interactions", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Rapidly click edit and cancel multiple times
      for (let i = 0; i < 5; i++) {
        const editButton = screen.getByRole("button", { name: /edit/i });
        fireEvent.click(editButton);

        const cancelButton = screen.getByRole("button", { name: /cancel/i });
        fireEvent.click(cancelButton);
      }

      // Should handle all interactions without errors
      expect(mockEventHandlers.onEditingStart).toHaveBeenCalledTimes(5);
      expect(mockEventHandlers.onEditingCancel).toHaveBeenCalledTimes(5);
    });

    it("should respect initial configuration settings", () => {
      const disabledConfig = { ...defaultConfig, enableEditing: false };

      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={disabledConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Edit button should not be present when editing is disabled
      expect(
        screen.queryByRole("button", { name: /edit/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Error Recovery", () => {
    it("should recover from canvas errors gracefully", async () => {
      // Mock canvas error
      mockFabricCanvas.renderAll.mockImplementation(() => {
        throw new Error("Canvas render error");
      });

      expect(() => {
        render(() => (
          <BoundingBoxEditor
            imageInfo={mockImageInfo}
            config={defaultConfig}
            eventHandlers={mockEventHandlers}
            initialBoxes={[mockBoundingBox]}
          />
        ));
      }).not.toThrow();
    });

    it("should handle invalid box data gracefully", async () => {
      const invalidBox: BoundingBox = {
        ...mockBoundingBox,
        x: -100,
        y: -100,
        width: -50,
        height: -50,
      };

      expect(() => {
        render(() => (
          <BoundingBoxEditor
            imageInfo={mockImageInfo}
            config={defaultConfig}
            eventHandlers={mockEventHandlers}
            initialBoxes={[invalidBox]}
          />
        ));
      }).not.toThrow();
    });

    it("should handle missing event handlers gracefully", async () => {
      expect(() => {
        render(() => (
          <BoundingBoxEditor
            imageInfo={mockImageInfo}
            config={defaultConfig}
            initialBoxes={[mockBoundingBox]}
          />
        ));
      }).not.toThrow();
    });
  });

  describe("Performance Integration", () => {
    it("should handle large numbers of boxes efficiently", async () => {
      const manyBoxes: BoundingBox[] = Array.from({ length: 100 }, (_, i) => ({
        ...mockBoundingBox,
        id: `box-${i}`,
        x: (i % 10) * 200,
        y: Math.floor(i / 10) * 200,
      }));

      const startTime = performance.now();

      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={manyBoxes}
        />
      ));

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
      expect(screen.getByText("Bounding Boxes (100)")).toBeInTheDocument();
    });

    it("should handle rapid canvas updates efficiently", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      const canvas = screen
        .getByRole("img", { name: /bounding box editor canvas/i })
        .querySelector("canvas");

      // Get the mock fabric canvas instance
      const mockFabricCanvas = (global as any).getMockFabricCanvas();
      if (mockFabricCanvas) {
        // Simulate rapid mouse movements
        for (let i = 0; i < 50; i++) {
          mockFabricCanvas.triggerEvent("mouse:move", {
            e: { clientX: 100 + i, clientY: 100 + i },
          });
        }

        // Should handle all updates without performance issues
        expect(mockFabricCanvas.renderAll).toHaveBeenCalled();
      }
    });
  });
});
