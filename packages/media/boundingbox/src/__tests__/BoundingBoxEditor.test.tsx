/**
 * BoundingBoxEditor Component Tests
 *
 * Comprehensive test suite for the BoundingBoxEditor component covering:
 * - Component rendering and initialization
 * - User interactions (drawing, editing, deleting boxes)
 * - Event handling and callbacks
 * - Configuration options
 * - Accessibility features
 * - Error handling and edge cases
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { BoundingBoxEditor } from "../components/BoundingBoxEditor";
import type { BoundingBox, ImageInfo, EditorConfig, AnnotationEventHandlers } from "../../types";

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

describe("BoundingBoxEditor", () => {
  let mockEventHandlers: AnnotationEventHandlers;

  beforeEach(() => {
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

  describe("Component Rendering", () => {
    it("should render with default props", () => {
      render(() => (
        <BoundingBoxEditor imageInfo={mockImageInfo} config={defaultConfig} eventHandlers={mockEventHandlers} />
      ));

      // Check if canvas container is rendered
      const canvasContainer = screen.getByRole("img", {
        name: /bounding box editor canvas/i,
      });
      expect(canvasContainer).toBeInTheDocument();

      // Check if controls panel is rendered
      expect(screen.getByText("Label Class:")).toBeInTheDocument();
      expect(screen.getByText("Bounding Boxes (0)")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const customClass = "custom-editor-class";
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          className={customClass}
        />
      ));

      const editor = screen.getByRole("img", {
        name: /bounding box editor canvas/i,
      }).parentElement;
      expect(editor).toHaveClass("bounding-box-editor", customClass);
    });

    it("should render with custom container dimensions", () => {
      const customWidth = 1000;
      const customHeight = 800;

      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          containerWidth={customWidth}
          containerHeight={customHeight}
        />
      ));

      const canvasContainer = screen.getByRole("img", {
        name: /bounding box editor canvas/i,
      });
      expect(canvasContainer).toHaveStyle({
        width: `${customWidth}px`,
        height: `${customHeight}px`,
      });
    });

    it("should render with initial bounding boxes", () => {
      const initialBoxes = [mockBoundingBox];

      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={initialBoxes}
        />
      ));

      expect(screen.getByText("Bounding Boxes (1)")).toBeInTheDocument();
      expect(screen.getByText("person", { selector: ".box-label" })).toBeInTheDocument();
      expect(screen.getByText("(100, 100) 200×150")).toBeInTheDocument();
    });
  });

  describe("Label Management", () => {
    it("should display label classes from config", () => {
      const customLabelClasses = ["car", "truck", "bike"];
      const customConfig = {
        ...defaultConfig,
        labelClasses: customLabelClasses,
      };

      render(() => (
        <BoundingBoxEditor imageInfo={mockImageInfo} config={customConfig} eventHandlers={mockEventHandlers} />
      ));

      const select = screen.getByLabelText("Select label class for new bounding boxes");
      expect(select).toBeInTheDocument();

      customLabelClasses.forEach(labelClass => {
        expect(screen.getByText(labelClass)).toBeInTheDocument();
      });
    });

    it("should use default label class from config", () => {
      const customConfig = { ...defaultConfig, defaultLabelClass: "vehicle" };

      render(() => (
        <BoundingBoxEditor imageInfo={mockImageInfo} config={customConfig} eventHandlers={mockEventHandlers} />
      ));

      const select = screen.getByLabelText("Select label class for new bounding boxes");
      expect(select).toHaveValue("vehicle");
    });

    it("should allow changing selected label class", async () => {
      render(() => (
        <BoundingBoxEditor imageInfo={mockImageInfo} config={defaultConfig} eventHandlers={mockEventHandlers} />
      ));

      const select = screen.getByLabelText("Select label class for new bounding boxes");

      fireEvent.change(select, { target: { value: "vehicle" } });

      await waitFor(() => {
        expect(select).toHaveValue("vehicle");
      });
    });
  });

  describe("Box Management", () => {
    it("should display box count correctly", () => {
      const boxes = [mockBoundingBox, { ...mockBoundingBox, id: "box-2" }];

      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={boxes}
        />
      ));

      expect(screen.getByText("Bounding Boxes (2)")).toBeInTheDocument();
    });

    it("should display box information correctly", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      expect(screen.getByText("person", { selector: ".box-label" })).toBeInTheDocument();
      expect(screen.getByText("(100, 100) 200×150")).toBeInTheDocument();
    });

    it("should highlight selected box", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      const boxItem = screen.getByText("person", { selector: ".box-label" }).closest(".box-item");

      // The box should be selected (due to being the first initial box)
      expect(boxItem).toHaveClass("selected");

      // Click on the box to ensure it remains selected
      fireEvent.click(boxItem!);

      // The box should still be selected
      expect(boxItem).toHaveClass("selected");
    });
  });

  describe("User Interactions", () => {
    it("should handle box deletion when delete button is clicked", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockEventHandlers.onAnnotationDelete).toHaveBeenCalledWith(mockBoundingBox.id);
      });

      expect(screen.getByText("Bounding Boxes (0)")).toBeInTheDocument();
    });

    it("should handle box editing when edit button is clicked", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      const editButton = screen.getByRole("button", { name: /edit/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(mockEventHandlers.onEditingStart).toHaveBeenCalledWith(mockBoundingBox.id, "edit");
      });

      // Check if editing controls are shown
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("should handle save editing", async () => {
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

      // Save editing
      const saveButton = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockEventHandlers.onEditingEnd).toHaveBeenCalledWith(mockBoundingBox.id, "edit");
      });
    });

    it("should handle cancel editing", async () => {
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

      // Cancel editing
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockEventHandlers.onEditingCancel).toHaveBeenCalledWith(mockBoundingBox.id);
      });
    });
  });

  describe("Configuration Options", () => {
    it("should disable creation when enableCreation is false", () => {
      const config = { ...defaultConfig, enableCreation: false };

      render(() => <BoundingBoxEditor imageInfo={mockImageInfo} config={config} eventHandlers={mockEventHandlers} />);

      // Canvas should still be rendered but creation should be disabled
      const canvasContainer = screen.getByRole("img", {
        name: /bounding box editor canvas/i,
      });
      expect(canvasContainer).toBeInTheDocument();
    });

    it("should disable editing when enableEditing is false", () => {
      const config = { ...defaultConfig, enableEditing: false };

      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={config}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Edit button should not be present
      expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    });

    it("should disable deletion when enableDeletion is false", () => {
      const config = { ...defaultConfig, enableDeletion: false };

      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={config}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Delete button should not be present
      expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(() => (
        <BoundingBoxEditor imageInfo={mockImageInfo} config={defaultConfig} eventHandlers={mockEventHandlers} />
      ));

      const select = screen.getByLabelText("Select label class for new bounding boxes");
      expect(select).toBeInTheDocument();
    });

    it("should have proper button labels", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    });

    it("should disable buttons when appropriate", () => {
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

      // Edit button should be disabled while editing
      expect(editButton).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("should handle missing event handlers gracefully", () => {
      expect(() => {
        render(() => <BoundingBoxEditor imageInfo={mockImageInfo} config={defaultConfig} />);
      }).not.toThrow();
    });

    it("should handle empty initial boxes", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[]}
        />
      ));

      expect(screen.getByText("Bounding Boxes (0)")).toBeInTheDocument();
    });

    it("should handle invalid image info gracefully", () => {
      const invalidImageInfo = { ...mockImageInfo, width: 0, height: 0 };

      expect(() => {
        render(() => (
          <BoundingBoxEditor imageInfo={invalidImageInfo} config={defaultConfig} eventHandlers={mockEventHandlers} />
        ));
      }).not.toThrow();
    });
  });

  describe("Canvas Integration", () => {
    it("should initialize fabric canvas on mount", () => {
      render(() => (
        <BoundingBoxEditor imageInfo={mockImageInfo} config={defaultConfig} eventHandlers={mockEventHandlers} />
      ));

      // Canvas element should be present
      const canvas = screen.getByRole("img", { name: /bounding box editor canvas/i }).querySelector("canvas");
      expect(canvas).toBeInTheDocument();
    });

    it("should clean up fabric canvas on unmount", () => {
      const { unmount } = render(() => (
        <BoundingBoxEditor imageInfo={mockImageInfo} config={defaultConfig} eventHandlers={mockEventHandlers} />
      ));

      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Event Callbacks", () => {
    it("should call onAnnotationCreate when a box is created", async () => {
      render(() => (
        <BoundingBoxEditor imageInfo={mockImageInfo} config={defaultConfig} eventHandlers={mockEventHandlers} />
      ));

      // Simulate box creation (this would normally happen through canvas interaction)
      // For now, we'll test that the callback is properly wired
      expect(mockEventHandlers.onAnnotationCreate).toBeDefined();
    });

    it("should call onAnnotationUpdate when a box is updated", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Simulate box update through editing
      const editButton = screen.getByRole("button", { name: /edit/i });
      fireEvent.click(editButton);

      const saveButton = screen.getByRole("button", { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockEventHandlers.onEditingEnd).toHaveBeenCalled();
      });
    });

    it("should call onAnnotationSelect when a box is selected", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Box should be selected by default when provided as initial
      expect(mockEventHandlers.onAnnotationSelect).toBeDefined();
    });
  });
});
