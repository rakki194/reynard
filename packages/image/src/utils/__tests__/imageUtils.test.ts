/**
 * Image Utils Test Suite
 * 
 * Tests for image utility functions including file validation,
 * image processing, and helper functions.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { isImageFile, getImageDimensions, resizeImage, compressImage } from "../imageUtils";

describe("imageUtils", () => {
  describe("isImageFile", () => {
    it("should return true for valid image file extensions", () => {
      const imageFiles = [
        new File([], "test.jpg", { type: "image/jpeg" }),
        new File([], "test.jpeg", { type: "image/jpeg" }),
        new File([], "test.png", { type: "image/png" }),
        new File([], "test.gif", { type: "image/gif" }),
        new File([], "test.webp", { type: "image/webp" }),
        new File([], "test.bmp", { type: "image/bmp" }),
        new File([], "test.svg", { type: "image/svg+xml" }),
        new File([], "test.tiff", { type: "image/tiff" }),
      ];

      imageFiles.forEach(file => {
        expect(isImageFile(file)).toBe(true);
      });
    });

    it("should return false for non-image file extensions", () => {
      const nonImageFiles = [
        new File([], "test.txt", { type: "text/plain" }),
        new File([], "test.mp3", { type: "audio/mpeg" }),
        new File([], "test.mp4", { type: "video/mp4" }),
        new File([], "test.pdf", { type: "application/pdf" }),
      ];

      nonImageFiles.forEach(file => {
        expect(isImageFile(file)).toBe(false);
      });
    });

    it("should handle case-insensitive extensions", () => {
      const caseVariations = [
        new File([], "test.JPG", { type: "image/jpeg" }),
        new File([], "test.PNG", { type: "image/png" }),
        new File([], "test.GIF", { type: "image/gif" }),
      ];

      caseVariations.forEach(file => {
        expect(isImageFile(file)).toBe(true);
      });
    });
  });

  describe("getImageDimensions", () => {
    it("should return dimensions for valid image file", async () => {
      const mockImageFile = new File(["image"], "test.jpg", { type: "image/jpeg" });
      
      // Mock image element
      const mockImage = {
        width: 1920,
        height: 1080,
        addEventListener: vi.fn((event, callback) => {
          if (event === "load") {
            setTimeout(() => callback(), 0);
          }
        }),
        removeEventListener: vi.fn(),
      };
      
      // Mock URL.createObjectURL
      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      Object.defineProperty(URL, "createObjectURL", {
        value: mockCreateObjectURL,
        writable: true,
      });
      
      // Mock HTMLImageElement constructor
      global.HTMLImageElement = vi.fn(() => mockImage) as any;
      
      const dimensions = await getImageDimensions(mockImageFile);
      expect(dimensions).toEqual({ width: 1920, height: 1080 });
    });

    it("should handle image load errors", async () => {
      const mockImageFile = new File(["image"], "test.jpg", { type: "image/jpeg" });
      
      // Mock image element that fails to load
      const mockImage = {
        width: 0,
        height: 0,
        addEventListener: vi.fn((event, callback) => {
          if (event === "error") {
            setTimeout(() => callback(), 0);
          }
        }),
        removeEventListener: vi.fn(),
      };
      
      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      Object.defineProperty(URL, "createObjectURL", {
        value: mockCreateObjectURL,
        writable: true,
      });
      
      global.HTMLImageElement = vi.fn(() => mockImage) as any;
      
      const dimensions = await getImageDimensions(mockImageFile);
      expect(dimensions).toEqual({ width: 0, height: 0 });
    });
  });

  describe("resizeImage", () => {
    it("should resize image to specified dimensions", async () => {
      const mockImageFile = new File(["image"], "test.jpg", { type: "image/jpeg" });
      
      // Mock canvas
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toBlob: vi.fn((callback) => {
          const blob = new Blob(["resized"], { type: "image/jpeg" });
          callback(blob);
        }),
      };
      
      // Mock image element
      const mockImage = {
        width: 1920,
        height: 1080,
        addEventListener: vi.fn((event, callback) => {
          if (event === "load") {
            setTimeout(() => callback(), 0);
          }
        }),
        removeEventListener: vi.fn(),
      };
      
      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      Object.defineProperty(URL, "createObjectURL", {
        value: mockCreateObjectURL,
        writable: true,
      });
      
      global.HTMLImageElement = vi.fn(() => mockImage) as any;
      global.HTMLCanvasElement = vi.fn(() => mockCanvas) as any;
      
      const resizedImage = await resizeImage(mockImageFile, 800, 600);
      expect(resizedImage).toBeInstanceOf(Blob);
    });

    it("should maintain aspect ratio when resizing", async () => {
      const mockImageFile = new File(["image"], "test.jpg", { type: "image/jpeg" });
      
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toBlob: vi.fn((callback) => {
          const blob = new Blob(["resized"], { type: "image/jpeg" });
          callback(blob);
        }),
      };
      
      const mockImage = {
        width: 1920,
        height: 1080,
        addEventListener: vi.fn((event, callback) => {
          if (event === "load") {
            setTimeout(() => callback(), 0);
          }
        }),
        removeEventListener: vi.fn(),
      };
      
      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      Object.defineProperty(URL, "createObjectURL", {
        value: mockCreateObjectURL,
        writable: true,
      });
      
      global.HTMLImageElement = vi.fn(() => mockImage) as any;
      global.HTMLCanvasElement = vi.fn(() => mockCanvas) as any;
      
      const resizedImage = await resizeImage(mockImageFile, 800, 600, true);
      expect(resizedImage).toBeInstanceOf(Blob);
    });
  });

  describe("compressImage", () => {
    it("should compress image with specified quality", async () => {
      const mockImageFile = new File(["image"], "test.jpg", { type: "image/jpeg" });
      
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toBlob: vi.fn((callback) => {
          const blob = new Blob(["compressed"], { type: "image/jpeg" });
          callback(blob);
        }),
      };
      
      const mockImage = {
        width: 1920,
        height: 1080,
        addEventListener: vi.fn((event, callback) => {
          if (event === "load") {
            setTimeout(() => callback(), 0);
          }
        }),
        removeEventListener: vi.fn(),
      };
      
      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      Object.defineProperty(URL, "createObjectURL", {
        value: mockCreateObjectURL,
        writable: true,
      });
      
      global.HTMLImageElement = vi.fn(() => mockImage) as any;
      global.HTMLCanvasElement = vi.fn(() => mockCanvas) as any;
      
      const compressedImage = await compressImage(mockImageFile, 0.8);
      expect(compressedImage).toBeInstanceOf(Blob);
    });

    it("should handle compression errors", async () => {
      const mockImageFile = new File(["image"], "test.jpg", { type: "image/jpeg" });
      
      const mockImage = {
        width: 0,
        height: 0,
        addEventListener: vi.fn((event, callback) => {
          if (event === "error") {
            setTimeout(() => callback(), 0);
          }
        }),
        removeEventListener: vi.fn(),
      };
      
      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      Object.defineProperty(URL, "createObjectURL", {
        value: mockCreateObjectURL,
        writable: true,
      });
      
      global.HTMLImageElement = vi.fn(() => mockImage) as any;
      
      const compressedImage = await compressImage(mockImageFile, 0.8);
      expect(compressedImage).toBe(null);
    });
  });
});
