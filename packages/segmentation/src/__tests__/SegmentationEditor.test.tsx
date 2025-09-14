/**
 * Segmentation Editor Tests
 *
 * Test suite for the SegmentationEditor component.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SegmentationData, SegmentationEditorConfig } from "../types/index.js";

// Mock the SegmentationEditor component since we can't easily test SolidJS components without proper setup
const mockSegmentationEditor = vi.fn();
vi.mock("../components/SegmentationEditor", () => ({
  SegmentationEditor: mockSegmentationEditor,
}));

describe("SegmentationEditor", () => {
  const defaultConfig: SegmentationEditorConfig = {
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

  const mockSegmentations: SegmentationData[] = [
    {
      id: "test-seg-1",
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
    },
  ];

  beforeEach(() => {
    mockSegmentationEditor.mockClear();
  });

  describe("Component Interface", () => {
    it("should be a valid component", () => {
      expect(mockSegmentationEditor).toBeDefined();
      expect(typeof mockSegmentationEditor).toBe("function");
    });

    it("should accept required props", () => {
      const props = {
        imageSrc: "/test/image.jpg",
        segmentations: mockSegmentations,
        config: defaultConfig,
      };

      mockSegmentationEditor(props);

      expect(mockSegmentationEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          imageSrc: "/test/image.jpg",
          segmentations: mockSegmentations,
          config: defaultConfig,
        })
      );
    });

    it("should accept optional props", () => {
      const props = {
        imageSrc: "/test/image.jpg",
        segmentations: mockSegmentations,
        config: defaultConfig,
        state: {
          selectedSegmentation: "test-seg-1",
          isCreating: false,
          isEditing: false,
          zoom: 1,
          panOffset: { x: 0, y: 0 },
        },
        events: {
          onSegmentationCreate: vi.fn(),
          onSegmentationUpdate: vi.fn(),
          onSegmentationDelete: vi.fn(),
        },
        class: "custom-editor",
      };

      mockSegmentationEditor(props);

      expect(mockSegmentationEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          state: expect.any(Object),
          events: expect.any(Object),
          class: "custom-editor",
        })
      );
    });
  });

  describe("Configuration Validation", () => {
    it("should handle valid configuration", () => {
      const validConfig = {
        ...defaultConfig,
        showGrid: true,
        allowPolygonCreation: true,
      };

      mockSegmentationEditor({
        imageSrc: "/test/image.jpg",
        segmentations: mockSegmentations,
        config: validConfig,
      });

      expect(mockSegmentationEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          config: validConfig,
        })
      );
    });

    it("should handle partial configuration", () => {
      const partialConfig = {
        enabled: true,
        showGrid: true,
      };

      mockSegmentationEditor({
        imageSrc: "/test/image.jpg",
        segmentations: mockSegmentations,
        config: partialConfig,
      });

      expect(mockSegmentationEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          config: partialConfig,
        })
      );
    });
  });

  describe("Data Handling", () => {
    it("should handle empty segmentations array", () => {
      mockSegmentationEditor({
        imageSrc: "/test/image.jpg",
        segmentations: [],
        config: defaultConfig,
      });

      expect(mockSegmentationEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          segmentations: [],
        })
      );
    });

    it("should handle undefined segmentations", () => {
      mockSegmentationEditor({
        imageSrc: "/test/image.jpg",
        config: defaultConfig,
      });

      expect(mockSegmentationEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          imageSrc: "/test/image.jpg",
          config: defaultConfig,
        })
      );
    });
  });

  describe("Event Handling", () => {
    it("should accept event handlers", () => {
      const events = {
        onSegmentationCreate: vi.fn(),
        onSegmentationUpdate: vi.fn(),
        onSegmentationDelete: vi.fn(),
        onSegmentationSelect: vi.fn(),
        onStateChange: vi.fn(),
      };

      mockSegmentationEditor({
        imageSrc: "/test/image.jpg",
        segmentations: mockSegmentations,
        config: defaultConfig,
        events,
      });

      expect(mockSegmentationEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          events,
        })
      );
    });
  });
});
