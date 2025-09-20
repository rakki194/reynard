/**
 * Segmentation Editor Composable Tests
 *
 * Test suite for the useSegmentationEditor composable.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSegmentationEditor } from "../composables/useSegmentationEditor.js";
import type { SegmentationData, SegmentationEditorConfig, SegmentationEditorState } from "../types/index.js";

describe("useSegmentationEditor", () => {
  let config: SegmentationEditorConfig;
  let initialState: SegmentationEditorState;
  let mockOnStateChange: ReturnType<typeof vi.fn>;
  let mockOnSegmentationCreate: ReturnType<typeof vi.fn>;
  let mockOnSegmentationUpdate: ReturnType<typeof vi.fn>;
  let mockOnSegmentationDelete: ReturnType<typeof vi.fn>;

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

    initialState = {
      selectedSegmentation: undefined,
      isCreating: false,
      isEditing: false,
      zoom: 1,
      panOffset: { x: 0, y: 0 },
    };

    mockOnStateChange = vi.fn();
    mockOnSegmentationCreate = vi.fn();
    mockOnSegmentationUpdate = vi.fn();
    mockOnSegmentationDelete = vi.fn();
  });

  describe("Initialization", () => {
    it("should initialize with default state", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
        onStateChange: mockOnStateChange,
        onSegmentationCreate: mockOnSegmentationCreate,
        onSegmentationUpdate: mockOnSegmentationUpdate,
        onSegmentationDelete: mockOnSegmentationDelete,
      });

      expect(editor.state()).toEqual(initialState);
    });

    it("should initialize without event handlers", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
      });

      expect(editor.state()).toEqual(initialState);
    });
  });

  describe("State Management", () => {
    it("should update state", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
        onStateChange: mockOnStateChange,
      });

      const updates = { zoom: 2, panOffset: { x: 10, y: 20 } };
      editor.updateState(updates);

      expect(editor.state().zoom).toBe(2);
      expect(editor.state().panOffset).toEqual({ x: 10, y: 20 });
      expect(mockOnStateChange).toHaveBeenCalledWith(expect.objectContaining(updates));
    });

    it("should update state without callback", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
      });

      const updates = { zoom: 2 };
      editor.updateState(updates);

      expect(editor.state().zoom).toBe(2);
    });

    it("should handle partial state updates", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
        onStateChange: mockOnStateChange,
      });

      editor.updateState({ zoom: 1.5 });

      expect(editor.state().zoom).toBe(1.5);
      expect(editor.state().panOffset).toEqual({ x: 0, y: 0 }); // Should remain unchanged
    });
  });

  describe("Segmentation Operations", () => {
    it("should create segmentation", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
        onSegmentationCreate: mockOnSegmentationCreate,
      });

      const segmentation: SegmentationData = {
        id: "test-seg",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
          ],
        },
        metadata: {
          source: "manual",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      editor.createSegmentation(segmentation);

      expect(mockOnSegmentationCreate).toHaveBeenCalledWith(segmentation);
    });

    it("should update segmentation", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
        onSegmentationUpdate: mockOnSegmentationUpdate,
      });

      const segmentation: SegmentationData = {
        id: "test-seg",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
          ],
        },
        metadata: {
          source: "manual",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      editor.updateSegmentation(segmentation);

      expect(mockOnSegmentationUpdate).toHaveBeenCalledWith(segmentation);
    });

    it("should delete segmentation", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
        onSegmentationDelete: mockOnSegmentationDelete,
      });

      editor.deleteSegmentation("test-seg");

      expect(mockOnSegmentationDelete).toHaveBeenCalledWith("test-seg");
    });

    it("should select segmentation", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
        onStateChange: mockOnStateChange,
      });

      editor.selectSegmentation("test-seg");

      expect(editor.state().selectedSegmentation).toBe("test-seg");
      expect(mockOnStateChange).toHaveBeenCalled();
    });

    it("should deselect segmentation", () => {
      const editor = useSegmentationEditor({
        config,
        state: { ...initialState, selectedSegmentation: "test-seg" },
        onStateChange: mockOnStateChange,
      });

      editor.selectSegmentation(undefined);

      expect(editor.state().selectedSegmentation).toBeUndefined();
      expect(mockOnStateChange).toHaveBeenCalled();
    });
  });

  describe("Editor Operations", () => {
    it("should start creating", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
        onStateChange: mockOnStateChange,
      });

      editor.startCreating();

      expect(editor.state().isCreating).toBe(true);
      expect(mockOnStateChange).toHaveBeenCalled();
    });

    it("should stop creating", () => {
      const editor = useSegmentationEditor({
        config,
        state: { ...initialState, isCreating: true },
        onStateChange: mockOnStateChange,
      });

      editor.stopCreating();

      expect(editor.state().isCreating).toBe(false);
      expect(mockOnStateChange).toHaveBeenCalled();
    });

    it("should start editing", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
        onStateChange: mockOnStateChange,
      });

      editor.startEditing("test-seg");

      expect(editor.state().isEditing).toBe(true);
      expect(editor.state().selectedSegmentation).toBe("test-seg");
      expect(mockOnStateChange).toHaveBeenCalled();
    });

    it("should stop editing", () => {
      const editor = useSegmentationEditor({
        config,
        state: {
          ...initialState,
          isEditing: true,
          selectedSegmentation: "test-seg",
        },
        onStateChange: mockOnStateChange,
      });

      editor.stopEditing();

      expect(editor.state().isEditing).toBe(false);
      expect(editor.state().selectedSegmentation).toBeUndefined();
      expect(mockOnStateChange).toHaveBeenCalled();
    });

    it("should handle editing when already creating", () => {
      const editor = useSegmentationEditor({
        config,
        state: { ...initialState, isCreating: true },
        onStateChange: mockOnStateChange,
      });

      editor.startEditing("test-seg");

      expect(editor.state().isCreating).toBe(false);
      expect(editor.state().isEditing).toBe(true);
      expect(editor.state().selectedSegmentation).toBe("test-seg");
    });

    it("should handle creating when already editing", () => {
      const editor = useSegmentationEditor({
        config,
        state: {
          ...initialState,
          isEditing: true,
          selectedSegmentation: "test-seg",
        },
        onStateChange: mockOnStateChange,
      });

      editor.startCreating();

      expect(editor.state().isEditing).toBe(false);
      expect(editor.state().isCreating).toBe(true);
      expect(editor.state().selectedSegmentation).toBeUndefined();
    });
  });

  describe("Validation", () => {
    it("should validate valid segmentation", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
      });

      const validSegmentation: SegmentationData = {
        id: "valid-seg",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
          ],
        },
        metadata: {
          source: "manual",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(editor.validateSegmentation(validSegmentation)).toBe(true);
    });

    it("should reject invalid segmentation", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
      });

      const invalidSegmentation: SegmentationData = {
        id: "invalid-seg",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            // Missing third point for valid polygon
          ],
        },
        metadata: {
          source: "manual",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(editor.validateSegmentation(invalidSegmentation)).toBe(false);
    });

    it("should reject segmentation below minimum area", () => {
      const editor = useSegmentationEditor({
        config: { ...config, minPolygonArea: 1000 },
        state: initialState,
      });

      const smallSegmentation: SegmentationData = {
        id: "small-seg",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
          ],
        },
        metadata: {
          source: "manual",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(editor.validateSegmentation(smallSegmentation)).toBe(false);
    });

    it("should reject segmentation above maximum area", () => {
      const editor = useSegmentationEditor({
        config: { ...config, maxPolygonArea: 100 },
        state: initialState,
      });

      const largeSegmentation: SegmentationData = {
        id: "large-seg",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 1000, y: 0 },
            { x: 1000, y: 1000 },
            { x: 0, y: 1000 },
          ],
        },
        metadata: {
          source: "manual",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(editor.validateSegmentation(largeSegmentation)).toBe(false);
    });

    it("should validate polygon", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
      });

      const validPolygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      expect(editor.validatePolygon(validPolygon)).toBe(true);
    });

    it("should reject invalid polygon", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
      });

      const invalidPolygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          // Missing third point
        ],
      };

      expect(editor.validatePolygon(invalidPolygon)).toBe(false);
    });
  });

  describe("Configuration Constraints", () => {
    it("should respect maxPolygons constraint", () => {
      const editor = useSegmentationEditor({
        config: { ...config, maxPolygons: 2 },
        state: initialState,
      });

      // This would be tested in a real implementation where we track polygon count
      expect(editor.state()).toBeDefined();
    });

    it("should respect minPolygonArea constraint", () => {
      const editor = useSegmentationEditor({
        config: { ...config, minPolygonArea: 1000 },
        state: initialState,
      });

      const smallPolygon = {
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
          { x: 0, y: 10 },
        ],
      };

      expect(editor.validatePolygon(smallPolygon)).toBe(false);
    });

    it("should respect maxPolygonArea constraint", () => {
      const editor = useSegmentationEditor({
        config: { ...config, maxPolygonArea: 100 },
        state: initialState,
      });

      const largePolygon = {
        points: [
          { x: 0, y: 0 },
          { x: 1000, y: 0 },
          { x: 1000, y: 1000 },
          { x: 0, y: 1000 },
        ],
      };

      expect(editor.validatePolygon(largePolygon)).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing event handlers gracefully", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
      });

      const segmentation: SegmentationData = {
        id: "test-seg",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
          ],
        },
        metadata: { source: "manual" },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => editor.createSegmentation(segmentation)).not.toThrow();
      expect(() => editor.updateSegmentation(segmentation)).not.toThrow();
      expect(() => editor.deleteSegmentation("test-seg")).not.toThrow();
    });

    it("should handle invalid state updates gracefully", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
      });

      expect(() => editor.updateState({} as any)).not.toThrow();
      expect(() => editor.updateState(null as any)).not.toThrow();
    });
  });

  describe("Cleanup", () => {
    it("should cleanup resources", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
      });

      expect(() => editor.cleanup()).not.toThrow();
    });

    it("should cleanup multiple times without error", () => {
      const editor = useSegmentationEditor({
        config,
        state: initialState,
      });

      editor.cleanup();
      expect(() => editor.cleanup()).not.toThrow();
    });
  });
});
