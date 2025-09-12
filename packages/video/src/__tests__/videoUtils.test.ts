/**
 * Video Utils Test Suite
 *
 * Tests for video utility functions including file validation,
 * formatting, and helper functions.
 */

import { describe, it, expect } from "vitest";
import {
  isVideoFile,
  getVideoDuration,
  formatVideoDuration,
  getVideoThumbnail,
} from "../../videoUtils";

describe("videoUtils", () => {
  describe("isVideoFile", () => {
    it("should return true for valid video file extensions", () => {
      const videoFiles = [
        new File([], "test.mp4", { type: "video/mp4" }),
        new File([], "test.avi", { type: "video/x-msvideo" }),
        new File([], "test.mov", { type: "video/quicktime" }),
        new File([], "test.webm", { type: "video/webm" }),
        new File([], "test.mkv", { type: "video/x-matroska" }),
        new File([], "test.flv", { type: "video/x-flv" }),
        new File([], "test.wmv", { type: "video/x-ms-wmv" }),
      ];

      videoFiles.forEach((file) => {
        expect(isVideoFile(file)).toBe(true);
      });
    });

    it("should return false for non-video file extensions", () => {
      const nonVideoFiles = [
        new File([], "test.txt", { type: "text/plain" }),
        new File([], "test.jpg", { type: "image/jpeg" }),
        new File([], "test.mp3", { type: "audio/mpeg" }),
        new File([], "test.pdf", { type: "application/pdf" }),
      ];

      nonVideoFiles.forEach((file) => {
        expect(isVideoFile(file)).toBe(false);
      });
    });

    it("should handle case-insensitive extensions", () => {
      const caseVariations = [
        new File([], "test.MP4", { type: "video/mp4" }),
        new File([], "test.AVI", { type: "video/x-msvideo" }),
        new File([], "test.MOV", { type: "video/quicktime" }),
      ];

      caseVariations.forEach((file) => {
        expect(isVideoFile(file)).toBe(true);
      });
    });
  });

  describe("getVideoDuration", () => {
    it("should return duration for valid video file", async () => {
      const mockVideoFile = new File(["video"], "test.mp4", {
        type: "video/mp4",
      });

      // Mock video element
      const mockVideo = {
        duration: 120,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      // Mock URL.createObjectURL
      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      Object.defineProperty(URL, "createObjectURL", {
        value: mockCreateObjectURL,
        writable: true,
      });

      // Mock HTMLVideoElement constructor
      global.HTMLVideoElement = vi.fn(() => mockVideo) as any;

      const duration = await getVideoDuration(mockVideoFile);
      expect(duration).toBe(120);
    });

    it("should handle video load errors", async () => {
      const mockVideoFile = new File(["video"], "test.mp4", {
        type: "video/mp4",
      });

      // Mock video element that fails to load
      const mockVideo = {
        duration: NaN,
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

      global.HTMLVideoElement = vi.fn(() => mockVideo) as any;

      const duration = await getVideoDuration(mockVideoFile);
      expect(duration).toBe(0);
    });
  });

  describe("formatVideoDuration", () => {
    it("should format seconds correctly", () => {
      expect(formatVideoDuration(0)).toBe("0:00");
      expect(formatVideoDuration(30)).toBe("0:30");
      expect(formatVideoDuration(60)).toBe("1:00");
      expect(formatVideoDuration(90)).toBe("1:30");
      expect(formatVideoDuration(125)).toBe("2:05");
    });

    it("should format hours correctly", () => {
      expect(formatVideoDuration(3600)).toBe("1:00:00");
      expect(formatVideoDuration(3661)).toBe("1:01:01");
      expect(formatVideoDuration(7325)).toBe("2:02:05");
    });

    it("should handle undefined input", () => {
      expect(formatVideoDuration(undefined)).toBe("0:00");
    });

    it("should handle null input", () => {
      expect(formatVideoDuration(null as any)).toBe("0:00");
    });

    it("should handle decimal seconds", () => {
      expect(formatVideoDuration(30.5)).toBe("0:30");
      expect(formatVideoDuration(90.7)).toBe("1:30");
    });
  });

  describe("getVideoThumbnail", () => {
    it("should generate thumbnail for video file", async () => {
      const mockVideoFile = new File(["video"], "test.mp4", {
        type: "video/mp4",
      });

      // Mock video element
      const mockVideo = {
        duration: 120,
        videoWidth: 1920,
        videoHeight: 1080,
        addEventListener: vi.fn((event, callback) => {
          if (event === "loadeddata") {
            setTimeout(() => callback(), 0);
          }
        }),
        removeEventListener: vi.fn(),
      };

      // Mock canvas
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toDataURL: vi
          .fn()
          .mockReturnValue("data:image/jpeg;base64,mock-thumbnail"),
      };

      // Mock URL.createObjectURL
      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      Object.defineProperty(URL, "createObjectURL", {
        value: mockCreateObjectURL,
        writable: true,
      });

      global.HTMLVideoElement = vi.fn(() => mockVideo) as any;
      global.HTMLCanvasElement = vi.fn(() => mockCanvas) as any;

      const thumbnail = await getVideoThumbnail(mockVideoFile, 0.5);
      expect(thumbnail).toBe("data:image/jpeg;base64,mock-thumbnail");
    });

    it("should handle video load errors", async () => {
      const mockVideoFile = new File(["video"], "test.mp4", {
        type: "video/mp4",
      });

      // Mock video element that fails to load
      const mockVideo = {
        duration: NaN,
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

      global.HTMLVideoElement = vi.fn(() => mockVideo) as any;

      const thumbnail = await getVideoThumbnail(mockVideoFile, 0.5);
      expect(thumbnail).toBe(null);
    });

    it("should use custom time for thumbnail", async () => {
      const mockVideoFile = new File(["video"], "test.mp4", {
        type: "video/mp4",
      });

      const mockVideo = {
        duration: 120,
        videoWidth: 1920,
        videoHeight: 1080,
        currentTime: 0,
        addEventListener: vi.fn((event, callback) => {
          if (event === "loadeddata") {
            setTimeout(() => callback(), 0);
          }
        }),
        removeEventListener: vi.fn(),
      };

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toDataURL: vi
          .fn()
          .mockReturnValue("data:image/jpeg;base64,mock-thumbnail"),
      };

      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      Object.defineProperty(URL, "createObjectURL", {
        value: mockCreateObjectURL,
        writable: true,
      });

      global.HTMLVideoElement = vi.fn(() => mockVideo) as any;
      global.HTMLCanvasElement = vi.fn(() => mockCanvas) as any;

      const thumbnail = await getVideoThumbnail(mockVideoFile, 0.25);
      expect(thumbnail).toBe("data:image/jpeg;base64,mock-thumbnail");
    });
  });
});
