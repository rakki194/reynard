/**
 * File Type Validation Security Tests
 * Tests for file type and MIME type validation
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createTestPipeline, TEST_FILES, createMockFile } from "./test-utils";

describe("File Type Validation Security", () => {
  let pipeline: ReturnType<typeof createTestPipeline>;

  beforeEach(() => {
    pipeline = createTestPipeline();
  });

  describe("File Type Validation", () => {
    it("should accept supported file types", async () => {
      const supportedFiles = [
        TEST_FILES.SAFE.IMAGE_JPG,
        TEST_FILES.SAFE.IMAGE_PNG,
        TEST_FILES.SAFE.PDF,
        TEST_FILES.SAFE.TEXT,
      ];

      for (const file of supportedFiles) {
        const result = await pipeline.processFile(file);
        expect(result.success).toBe(true);
      }
    });

    it("should reject unsupported file types", async () => {
      const unsupportedFiles = [
        TEST_FILES.UNSUPPORTED.JS,
        TEST_FILES.UNSUPPORTED.CSS,
        TEST_FILES.UNSUPPORTED.HTML,
      ];

      for (const file of unsupportedFiles) {
        const result = await pipeline.processFile(file);
        expect(result.success).toBe(false);
        expect(result.error).toBe("File type not supported");
      }
    });
  });

  describe("MIME Type Validation", () => {
    it("should validate MIME type matches extension", async () => {
      const mismatchedFile = createMockFile("image.jpg", 1024, "text/plain");
      const result = await pipeline.processFile(mismatchedFile);
      expect(result.success).toBe(false);
      expect(result.error).toBe("File content validation failed");
    });

    it("should accept correct MIME type and extension", async () => {
      const correctFile = createMockFile("image.jpg", 1024, "image/jpeg");
      const result = await pipeline.processFile(correctFile);
      expect(result.success).toBe(true);
    });
  });

  describe("Executable File Detection", () => {
    it("should reject executable files", async () => {
      const executableFiles = [
        TEST_FILES.EXECUTABLE.EXE,
        TEST_FILES.EXECUTABLE.BAT,
        TEST_FILES.EXECUTABLE.CMD,
        TEST_FILES.EXECUTABLE.COM,
        TEST_FILES.EXECUTABLE.SCR,
        TEST_FILES.EXECUTABLE.MSI,
      ];

      for (const file of executableFiles) {
        const result = await pipeline.processFile(file);
        expect(result.success).toBe(false);
        expect(result.error).toBe("File content validation failed");
      }
    });
  });

  describe("Compressed File Validation", () => {
    it("should validate compressed files", async () => {
      const compressedFiles = [
        TEST_FILES.COMPRESSED.ZIP,
        TEST_FILES.COMPRESSED.RAR,
        TEST_FILES.COMPRESSED.SEVEN_Z,
        TEST_FILES.COMPRESSED.TAR,
        TEST_FILES.COMPRESSED.GZ,
      ];

      for (const file of compressedFiles) {
        const result = await pipeline.processFile(file);
        expect(result.success).toBe(true);
      }
    });

    it("should reject oversized compressed files", async () => {
      const largeCompressedFile = createMockFile(
        "large.zip",
        60 * 1024 * 1024,
        "application/zip",
      ); // 60MB
      const result = await pipeline.processFile(largeCompressedFile);
      expect(result.success).toBe(false);
      expect(result.error).toBe("File content validation failed");
    });
  });
});
