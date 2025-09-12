/**
 * Modality Utils Test Suite
 *
 * Tests for the modality utility functions including file validation,
 * modality management, and type detection.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  BaseModality,
  ModalityManager,
  detectFileModality,
} from "../modalityUtils";

// Mock modality classes for testing
class MockImageModality extends BaseModality {
  readonly id = "image";
  readonly name = "Image";
  readonly icon = "🖼️";
  readonly description = "Image files";
  readonly enabled = true;
  readonly fileExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  readonly supportedFunctionalities = ["view", "edit", "annotate"];
  readonly component = "ImageComponent";
}

class MockVideoModality extends BaseModality {
  readonly id = "video";
  readonly name = "Video";
  readonly icon = "🎥";
  readonly description = "Video files";
  readonly enabled = true;
  readonly fileExtensions = [".mp4", ".avi", ".mov", ".webm"];
  readonly supportedFunctionalities = ["view", "play", "edit"];
  readonly component = "VideoComponent";
}

class MockAudioModality extends BaseModality {
  readonly id = "audio";
  readonly name = "Audio";
  readonly icon = "🎵";
  readonly description = "Audio files";
  readonly enabled = true;
  readonly fileExtensions = [".mp3", ".wav", ".flac", ".aac"];
  readonly supportedFunctionalities = ["play", "edit", "analyze"];
  readonly component = "AudioComponent";
}

describe("BaseModality", () => {
  let imageModality: MockImageModality;

  beforeEach(() => {
    imageModality = new MockImageModality();
  });

  describe("File Validation", () => {
    it("should validate supported file extensions", () => {
      const supportedFiles = [
        new File(["content"], "test.jpg", { type: "image/jpeg" }),
        new File(["content"], "test.png", { type: "image/png" }),
        new File(["content"], "test.gif", { type: "image/gif" }),
        new File(["content"], "test.webp", { type: "image/webp" }),
      ];

      supportedFiles.forEach((file) => {
        expect(imageModality.validateFile(file)).toBe(true);
      });
    });

    it("should reject unsupported file extensions", () => {
      const unsupportedFiles = [
        new File(["content"], "test.txt", { type: "text/plain" }),
        new File(["content"], "test.pdf", { type: "application/pdf" }),
        new File(["content"], "test.mp4", { type: "video/mp4" }),
      ];

      unsupportedFiles.forEach((file) => {
        expect(imageModality.validateFile(file)).toBe(false);
      });
    });

    it("should handle case-insensitive extensions", () => {
      const caseVariations = [
        new File(["content"], "test.JPG", { type: "image/jpeg" }),
        new File(["content"], "test.PNG", { type: "image/png" }),
        new File(["content"], "test.GIF", { type: "image/gif" }),
      ];

      caseVariations.forEach((file) => {
        expect(imageModality.validateFile(file)).toBe(true);
      });
    });

    it("should handle files without extensions", () => {
      const fileWithoutExtension = new File(["content"], "test", {
        type: "image/jpeg",
      });
      expect(imageModality.validateFile(fileWithoutExtension)).toBe(false);
    });
  });

  describe("File Type Support", () => {
    it("should return supported file types", () => {
      const supportedTypes = imageModality.getSupportedFileTypes();
      expect(supportedTypes).toEqual([
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
      ]);
    });

    it("should return supported MIME types", () => {
      const supportedMimeTypes = imageModality.getSupportedMimeTypes();
      expect(supportedMimeTypes).toContain("image/jpeg");
      expect(supportedMimeTypes).toContain("image/png");
      expect(supportedMimeTypes).toContain("image/gif");
    });
  });

  describe("Functionality Support", () => {
    it("should check if functionality is supported", () => {
      expect(imageModality.supportsFunctionality("view")).toBe(true);
      expect(imageModality.supportsFunctionality("edit")).toBe(true);
      expect(imageModality.supportsFunctionality("annotate")).toBe(true);
      expect(imageModality.supportsFunctionality("play")).toBe(false);
    });

    it("should return supported functionalities", () => {
      const functionalities = imageModality.getSupportedFunctionalities();
      expect(functionalities).toEqual(["view", "edit", "annotate"]);
    });
  });

  describe("Modality Properties", () => {
    it("should have correct basic properties", () => {
      expect(imageModality.id).toBe("image");
      expect(imageModality.name).toBe("Image");
      expect(imageModality.icon).toBe("🖼️");
      expect(imageModality.description).toBe("Image files");
      expect(imageModality.enabled).toBe(true);
    });

    it("should have correct component reference", () => {
      expect(imageModality.component).toBe("ImageComponent");
    });
  });
});

describe("ModalityManager", () => {
  let manager: ModalityManager;
  let imageModality: MockImageModality;
  let videoModality: MockVideoModality;
  let audioModality: MockAudioModality;

  beforeEach(() => {
    manager = new ModalityManager();
    imageModality = new MockImageModality();
    videoModality = new MockVideoModality();
    audioModality = new MockAudioModality();
  });

  describe("Modality Registration", () => {
    it("should register modalities", () => {
      manager.registerModality(imageModality);
      manager.registerModality(videoModality);
      manager.registerModality(audioModality);

      expect(manager.getModality("image")).toBe(imageModality);
      expect(manager.getModality("video")).toBe(videoModality);
      expect(manager.getModality("audio")).toBe(audioModality);
    });

    it("should not register duplicate modalities", () => {
      manager.registerModality(imageModality);
      manager.registerModality(imageModality);

      expect(manager.getModalityCount()).toBe(1);
    });

    it("should unregister modalities", () => {
      manager.registerModality(imageModality);
      manager.registerModality(videoModality);

      expect(manager.getModalityCount()).toBe(2);

      manager.unregisterModality("image");

      expect(manager.getModalityCount()).toBe(1);
      expect(manager.getModality("image")).toBe(null);
      expect(manager.getModality("video")).toBe(videoModality);
    });
  });

  describe("Modality Retrieval", () => {
    beforeEach(() => {
      manager.registerModality(imageModality);
      manager.registerModality(videoModality);
      manager.registerModality(audioModality);
    });

    it("should get modality by id", () => {
      expect(manager.getModality("image")).toBe(imageModality);
      expect(manager.getModality("video")).toBe(videoModality);
      expect(manager.getModality("audio")).toBe(audioModality);
    });

    it("should return null for non-existent modality", () => {
      expect(manager.getModality("non-existent")).toBe(null);
    });

    it("should get all modalities", () => {
      const modalities = manager.getAllModalities();
      expect(modalities).toHaveLength(3);
      expect(modalities).toContain(imageModality);
      expect(modalities).toContain(videoModality);
      expect(modalities).toContain(audioModality);
    });

    it("should get enabled modalities only", () => {
      const enabledModalities = manager.getEnabledModalities();
      expect(enabledModalities).toHaveLength(3);
      expect(enabledModalities).toContain(imageModality);
      expect(enabledModalities).toContain(videoModality);
      expect(enabledModalities).toContain(audioModality);
    });

    it("should get modality count", () => {
      expect(manager.getModalityCount()).toBe(3);
    });
  });

  describe("File Detection", () => {
    beforeEach(() => {
      manager.registerModality(imageModality);
      manager.registerModality(videoModality);
      manager.registerModality(audioModality);
    });

    it("should detect image files", () => {
      const imageFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });
      const detectedModality = manager.detectFileModality(imageFile);
      expect(detectedModality).toBe(imageModality);
    });

    it("should detect video files", () => {
      const videoFile = new File(["content"], "test.mp4", {
        type: "video/mp4",
      });
      const detectedModality = manager.detectFileModality(videoFile);
      expect(detectedModality).toBe(videoModality);
    });

    it("should detect audio files", () => {
      const audioFile = new File(["content"], "test.mp3", {
        type: "audio/mpeg",
      });
      const detectedModality = manager.detectFileModality(audioFile);
      expect(detectedModality).toBe(audioModality);
    });

    it("should return null for unsupported files", () => {
      const unsupportedFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });
      const detectedModality = manager.detectFileModality(unsupportedFile);
      expect(detectedModality).toBe(null);
    });
  });

  describe("File Type Support", () => {
    beforeEach(() => {
      manager.registerModality(imageModality);
      manager.registerModality(videoModality);
      manager.registerModality(audioModality);
    });

    it("should get all supported file extensions", () => {
      const extensions = manager.getAllSupportedExtensions();
      expect(extensions).toContain(".jpg");
      expect(extensions).toContain(".mp4");
      expect(extensions).toContain(".mp3");
    });

    it("should get supported extensions for specific modality", () => {
      const imageExtensions = manager.getSupportedExtensions("image");
      expect(imageExtensions).toEqual([
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
      ]);
    });

    it("should return empty array for non-existent modality", () => {
      const extensions = manager.getSupportedExtensions("non-existent");
      expect(extensions).toEqual([]);
    });
  });
});

describe("detectFileModality", () => {
  let manager: ModalityManager;

  beforeEach(() => {
    manager = new ModalityManager();
    manager.registerModality(new MockImageModality());
    manager.registerModality(new MockVideoModality());
    manager.registerModality(new MockAudioModality());
  });

  it("should detect modality for supported files", () => {
    const imageFile = new File(["content"], "test.jpg", { type: "image/jpeg" });
    const detectedModality = detectFileModality(imageFile, manager);
    expect(detectedModality?.id).toBe("image");
  });

  it("should return null for unsupported files", () => {
    const unsupportedFile = new File(["content"], "test.txt", {
      type: "text/plain",
    });
    const detectedModality = detectFileModality(unsupportedFile, manager);
    expect(detectedModality).toBe(null);
  });

  it("should handle files without extensions", () => {
    const fileWithoutExtension = new File(["content"], "test", {
      type: "image/jpeg",
    });
    const detectedModality = detectFileModality(fileWithoutExtension, manager);
    expect(detectedModality).toBe(null);
  });

  it("should handle case-insensitive extensions", () => {
    const imageFile = new File(["content"], "test.JPG", { type: "image/jpeg" });
    const detectedModality = detectFileModality(imageFile, manager);
    expect(detectedModality?.id).toBe("image");
  });
});
