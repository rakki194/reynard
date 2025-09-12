/**
 * Basic tests for reynard-boundingbox package
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useBoundingBoxes } from "../composables/useBoundingBoxes";
import { validateBoundingBox } from "../utils/validation";
import {
  imageToDisplayCoords,
  displayToImageCoords,
} from "../utils/coordinateTransform";
import type { BoundingBox, ImageInfo } from "../types";

describe("reynard-boundingbox", () => {
  const mockImageInfo: ImageInfo = {
    width: 1920,
    height: 1080,
    src: "/test-image.jpg",
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

  describe("useBoundingBoxes", () => {
    it("should initialize with empty boxes", () => {
      const { boxes, boxCount } = useBoundingBoxes({
        imageInfo: mockImageInfo,
      });

      expect(boxes()).toEqual([]);
      expect(boxCount()).toBe(0);
    });

    it("should add a bounding box", () => {
      const { addBox, boxes, boxCount, selectedBoxId } = useBoundingBoxes({
        imageInfo: mockImageInfo,
      });

      const success = addBox(mockBoundingBox);

      expect(success).toBe(true);
      expect(boxes()).toHaveLength(1);
      expect(boxCount()).toBe(1);
      expect(boxes()[0]).toEqual(mockBoundingBox);
      expect(selectedBoxId()).toBe(mockBoundingBox.id);
    });

    it("should update a bounding box", () => {
      const { addBox, updateBox, boxes } = useBoundingBoxes({
        imageInfo: mockImageInfo,
      });

      addBox(mockBoundingBox);
      const success = updateBox(mockBoundingBox.id, {
        width: 300,
        height: 200,
      });

      expect(success).toBe(true);
      expect(boxes()[0].width).toBe(300);
      expect(boxes()[0].height).toBe(200);
    });

    it("should delete a bounding box", () => {
      const { addBox, removeBox, boxes, boxCount } = useBoundingBoxes({
        imageInfo: mockImageInfo,
      });

      addBox(mockBoundingBox);
      expect(boxCount()).toBe(1);

      const success = removeBox(mockBoundingBox.id);

      expect(success).toBe(true);
      expect(boxes()).toHaveLength(0);
      expect(boxCount()).toBe(0);
    });

    it("should validate bounding boxes", () => {
      const { addBox, validationErrors } = useBoundingBoxes({
        imageInfo: mockImageInfo,
        enableValidation: true,
      });

      // Valid box
      addBox(mockBoundingBox);
      expect(validationErrors()).toEqual({});

      // Invalid box (extends beyond image bounds)
      const invalidBox: BoundingBox = {
        ...mockBoundingBox,
        id: "invalid-box",
        x: 2000, // Beyond image width
        y: 1000, // Beyond image height
      };

      addBox(invalidBox);
      expect(validationErrors()[invalidBox.id]).toBeDefined();
      expect(validationErrors()[invalidBox.id].length).toBeGreaterThan(0);
    });
  });

  describe("validation utilities", () => {
    it("should validate a valid bounding box", () => {
      const validation = validateBoundingBox(mockBoundingBox, mockImageInfo);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should reject invalid bounding boxes", () => {
      const invalidBox: BoundingBox = {
        ...mockBoundingBox,
        x: -10, // Negative x
        width: 0, // Zero width
        height: -5, // Negative height
      };

      const validation = validateBoundingBox(invalidBox, mockImageInfo);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe("coordinate transformation", () => {
    it("should convert image coordinates to display coordinates", () => {
      const imageCoords = { x: 100, y: 100, width: 200, height: 150 };
      const displayCoords = imageToDisplayCoords(
        imageCoords,
        mockImageInfo,
        800, // container width
        600, // container height
      );

      expect(displayCoords.x).toBeGreaterThan(0);
      expect(displayCoords.y).toBeGreaterThan(0);
      expect(displayCoords.width).toBeGreaterThan(0);
      expect(displayCoords.height).toBeGreaterThan(0);
    });

    it("should convert display coordinates back to image coordinates", () => {
      const imageCoords = { x: 100, y: 100, width: 200, height: 150 };
      const displayCoords = imageToDisplayCoords(
        imageCoords,
        mockImageInfo,
        800,
        600,
      );

      const backToImageCoords = displayToImageCoords(
        displayCoords,
        mockImageInfo,
        800,
        600,
      );

      // Should be close to original (allowing for rounding)
      expect(Math.abs(backToImageCoords.x - imageCoords.x)).toBeLessThanOrEqual(
        1,
      );
      expect(Math.abs(backToImageCoords.y - imageCoords.y)).toBeLessThanOrEqual(
        1,
      );
      expect(
        Math.abs(backToImageCoords.width! - imageCoords.width),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(backToImageCoords.height! - imageCoords.height),
      ).toBeLessThanOrEqual(1);
    });
  });
});
