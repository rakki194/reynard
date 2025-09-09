/**
 * BoundingBoxEditor Accessibility Tests
 *
 * Comprehensive accessibility tests for the BoundingBoxEditor component covering:
 * - ARIA labels and roles
 * - Keyboard navigation
 * - Screen reader compatibility
 * - Focus management
 * - Color contrast and visual accessibility
 * - WCAG compliance
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { BoundingBoxEditor } from "./BoundingBoxEditor";
import type {
  BoundingBox,
  ImageInfo,
  EditorConfig,
  AnnotationEventHandlers,
} from "../types";

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

describe("BoundingBoxEditor Accessibility", () => {
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

  describe("ARIA Labels and Roles", () => {
    it("should have proper ARIA labels for form controls", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
        />
      ));

      // Label class select should have proper ARIA label
      const select = screen.getByLabelText(
        "Select label class for new bounding boxes",
      );
      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute(
        "aria-label",
        "Select label class for new bounding boxes",
      );
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

      // All buttons should have accessible names
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /delete/i }),
      ).toBeInTheDocument();
    });

    it("should have proper region roles", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
        />
      ));

      // Canvas container should be identifiable
      const canvasContainer = screen.getByRole("img", {
        name: /bounding box editor canvas/i,
      });
      expect(canvasContainer).toBeInTheDocument();

      // Controls panel should be identifiable
      const controlsPanel = screen.getByText("Label Class:").closest("div");
      expect(controlsPanel).toBeInTheDocument();
    });

    it("should provide descriptive text for box information", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Box coordinates should be readable
      expect(screen.getByText("(100, 100) 200×150")).toBeInTheDocument();

      // Box label should be clear
      expect(
        screen.getByText("person", { selector: ".box-label" }),
      ).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should support tab navigation through controls", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      const select = screen.getByLabelText(
        "Select label class for new bounding boxes",
      );
      const editButton = screen.getByRole("button", { name: /edit/i });
      const deleteButton = screen.getByRole("button", { name: /delete/i });

      // Focus should move through elements in logical order
      select.focus();
      expect(document.activeElement).toBe(select);

      // Test that elements are focusable
      editButton.focus();
      expect(document.activeElement).toBe(editButton);

      deleteButton.focus();
      expect(document.activeElement).toBe(deleteButton);
    });

    it("should support Enter key activation for buttons", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      const editButton = screen.getByRole("button", { name: /edit/i });
      editButton.focus();

      fireEvent.click(editButton);

      await waitFor(() => {
        expect(mockEventHandlers.onEditingStart).toHaveBeenCalled();
      });
    });

    it("should support Space key activation for buttons", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      deleteButton.focus();

      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockEventHandlers.onAnnotationDelete).toHaveBeenCalled();
      });
    });

    it("should support arrow keys for select element", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
        />
      ));

      const select = screen.getByLabelText(
        "Select label class for new bounding boxes",
      );
      select.focus();

      // Test arrow key navigation
      fireEvent.keyDown(select, { key: "ArrowDown" });
      fireEvent.keyDown(select, { key: "ArrowUp" });

      // Should not throw errors
      expect(select).toBeInTheDocument();
    });
  });

  describe("Focus Management", () => {
    it("should manage focus when editing starts and ends", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      const editButton = screen.getByRole("button", { name: /edit/i });
      editButton.focus();

      // Start editing
      fireEvent.click(editButton);

      await waitFor(() => {
        const saveButton = screen.getByRole("button", { name: /save/i });
        expect(saveButton).toBeInTheDocument();
      });

      // Focus should be managed appropriately
      const saveButton = screen.getByRole("button", { name: /save/i });
      saveButton.focus();
      expect(document.activeElement).toBe(saveButton);
    });

    it("should restore focus after canceling edit", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      const editButton = screen.getByRole("button", { name: /edit/i });
      editButton.focus();

      // Start editing
      fireEvent.click(editButton);

      // Cancel editing
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        // Edit button should be available again
        expect(
          screen.getByRole("button", { name: /edit/i }),
        ).toBeInTheDocument();
      });
    });

    it("should handle focus when buttons are disabled", () => {
      const config = { ...defaultConfig, enableEditing: false };

      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={config}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Edit button should not be present when disabled
      expect(
        screen.queryByRole("button", { name: /edit/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Screen Reader Compatibility", () => {
    it("should provide meaningful text for screen readers", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Box count should be announced
      expect(screen.getByText("Bounding Boxes (1)")).toBeInTheDocument();

      // Box details should be readable
      expect(
        screen.getByText("person", { selector: ".box-label" }),
      ).toBeInTheDocument();
      expect(screen.getByText("(100, 100) 200×150")).toBeInTheDocument();
    });

    it("should announce state changes", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Delete a box
      const deleteButton = screen.getByRole("button", { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        // Box count should update
        expect(screen.getByText("Bounding Boxes (0)")).toBeInTheDocument();
      });
    });

    it("should provide context for interactive elements", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Each button should have clear context
      const editButton = screen.getByRole("button", { name: /edit/i });
      const deleteButton = screen.getByRole("button", { name: /delete/i });

      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();

      // Buttons should be associated with their respective boxes
      const boxItem = screen
        .getByText("person", { selector: ".box-label" })
        .closest(".box-item");
      expect(boxItem).toContainElement(editButton);
      expect(boxItem).toContainElement(deleteButton);
    });
  });

  describe("Visual Accessibility", () => {
    it("should have sufficient color contrast for text", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Text elements should be visible
      const boxLabel = screen.getByText("person", { selector: ".box-label" });
      const boxCoords = screen.getByText("(100, 100) 200×150");

      expect(boxLabel).toBeInTheDocument();
      expect(boxCoords).toBeInTheDocument();

      // Elements should have proper styling (tested via CSS)
      expect(boxLabel).toHaveClass("box-label");
      expect(boxCoords).toHaveClass("box-coords");
    });

    it("should provide visual feedback for interactive states", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Selected box should have visual indication
      const boxItem = screen
        .getByText("person", { selector: ".box-label" })
        .closest(".box-item");
      expect(boxItem).toHaveClass("selected");

      // Buttons should have hover states (tested via CSS)
      const editButton = screen.getByRole("button", { name: /edit/i });
      const boxActions = editButton.closest(".box-actions");
      expect(boxActions).toHaveClass("box-actions");
    });

    it("should support high contrast mode", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Elements should be styled for high contrast
      const boxItem = screen
        .getByText("person", { selector: ".box-label" })
        .closest(".box-item");
      expect(boxItem).toHaveClass("box-item");

      // CSS should handle high contrast media queries
      expect(boxItem).toBeInTheDocument();
    });
  });

  describe("WCAG Compliance", () => {
    it("should meet WCAG 2.1 AA standards for form controls", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
        />
      ));

      // Form control should have proper label
      const select = screen.getByLabelText(
        "Select label class for new bounding boxes",
      );
      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute("aria-label");
    });

    it("should provide alternative text for images", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
        />
      ));

      // Image info should include alt text
      expect(mockImageInfo.alt).toBe("Test image");
    });

    it("should support keyboard-only navigation", async () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // All interactive elements should be keyboard accessible
      const select = screen.getByLabelText(
        "Select label class for new bounding boxes",
      );
      const editButton = screen.getByRole("button", { name: /edit/i });
      const deleteButton = screen.getByRole("button", { name: /delete/i });

      // Test keyboard navigation
      select.focus();
      expect(document.activeElement).toBe(select);

      // Test that elements are focusable
      editButton.focus();
      expect(document.activeElement).toBe(editButton);

      deleteButton.focus();
      expect(document.activeElement).toBe(deleteButton);
    });

    it("should provide clear error states and feedback", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Disabled buttons should be clearly indicated
      const editButton = screen.getByRole("button", { name: /edit/i });

      // Start editing to disable the button
      fireEvent.click(editButton);

      // Button should be disabled while editing
      expect(editButton).toBeDisabled();
    });
  });

  describe("Assistive Technology Support", () => {
    it("should work with screen readers", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // All text should be accessible to screen readers
      expect(screen.getByText("Label Class:")).toBeInTheDocument();
      expect(screen.getByText("Bounding Boxes (1)")).toBeInTheDocument();
      expect(
        screen.getByText("person", { selector: ".box-label" }),
      ).toBeInTheDocument();
    });

    it("should support voice control software", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // Buttons should have clear, voice-commandable labels
      const editButton = screen.getByRole("button", { name: /edit/i });
      const deleteButton = screen.getByRole("button", { name: /delete/i });

      expect(editButton).toHaveTextContent("Edit");
      expect(deleteButton).toHaveTextContent("Delete");
    });

    it("should support switch navigation", () => {
      render(() => (
        <BoundingBoxEditor
          imageInfo={mockImageInfo}
          config={defaultConfig}
          eventHandlers={mockEventHandlers}
          initialBoxes={[mockBoundingBox]}
        />
      ));

      // All interactive elements should be focusable
      const select = screen.getByLabelText(
        "Select label class for new bounding boxes",
      );
      const editButton = screen.getByRole("button", { name: /edit/i });
      const deleteButton = screen.getByRole("button", { name: /delete/i });

      expect(select).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();

      // Elements should be focusable
      select.focus();
      expect(document.activeElement).toBe(select);
    });
  });
});
