/**
 * File Validation Security Tests
 * Tests for basic file security validation features
 */

import { beforeEach, describe, expect, it } from "vitest";
import { TEST_FILES, createMockFile, createTestPipeline } from "./test-utils";

describe("File Validation Security", () => {
  let pipeline: ReturnType<typeof createTestPipeline>;

  beforeEach(() => {
    pipeline = createTestPipeline();
  });

  describe("File Security Validation", () => {
    it("should validate safe file names", async () => {
      const result = await pipeline.processFile(TEST_FILES.SAFE.PDF);
      expect(result.success).toBe(true);
    });

    it("should reject directory traversal attempts", async () => {
      const result = await pipeline.processFile(TEST_FILES.DANGEROUS.TRAVERSAL);
      expect(result.success).toBe(false);
      expect(result.error).toBe("File security validation failed");
    });

    it("should reject files with path separators", async () => {
      const result = await pipeline.processFile(TEST_FILES.DANGEROUS.PATH_SEPARATOR);
      expect(result.success).toBe(false);
      expect(result.error).toBe("File security validation failed");
    });

    it("should reject dangerous file names", async () => {
      const dangerousFiles = [TEST_FILES.DANGEROUS.HTACCESS, TEST_FILES.DANGEROUS.WEB_CONFIG];

      for (const file of dangerousFiles) {
        const result = await pipeline.processFile(file);
        expect(result.success).toBe(false);
        expect(result.error).toBe("File security validation failed");
      }
    });

    it("should reject empty file names", async () => {
      const result = await pipeline.processFile(TEST_FILES.DANGEROUS.EMPTY_NAME);
      expect(result.success).toBe(false);
      expect(result.error).toBe("File security validation failed");
    });

    it("should reject zero-size files", async () => {
      const result = await pipeline.processFile(TEST_FILES.DANGEROUS.ZERO_SIZE);
      expect(result.success).toBe(false);
      expect(result.error).toBe("File security validation failed");
    });
  });

  describe("File Size Validation", () => {
    it("should accept files within size limit", async () => {
      const normalFile = createMockFile("test.txt", 5 * 1024 * 1024, "text/plain"); // 5MB
      const result = await pipeline.processFile(normalFile);
      expect(result.success).toBe(true);
    });

    it("should reject files exceeding size limit", async () => {
      const largeFile = createMockFile("large.txt", 15 * 1024 * 1024, "text/plain"); // 15MB
      const result = await pipeline.processFile(largeFile);
      expect(result.success).toBe(false);
      expect(result.error).toBe("File size exceeds maximum allowed size");
    });

    it("should respect custom size limits", async () => {
      const customFile = createMockFile("test.txt", 2 * 1024 * 1024, "text/plain"); // 2MB
      const result = await pipeline.processFile(customFile, {
        maxFileSize: 1024 * 1024,
      }); // 1MB limit
      expect(result.success).toBe(false);
      expect(result.error).toBe("File size exceeds maximum allowed size");
    });
  });

  describe("File Path Security", () => {
    it("should handle string file paths safely", async () => {
      const safePath = "images/photo.jpg";
      const result = await pipeline.processFile(safePath);
      expect(result.success).toBe(true);
    });

    it("should reject dangerous string paths", async () => {
      const dangerousPaths = ["../etc/passwd", "~/secret.txt", "/etc/passwd", "..\\..\\windows\\system32"];

      for (const path of dangerousPaths) {
        const result = await pipeline.processFile(path);
        expect(result.success).toBe(false);
        expect(result.error).toBe("File security validation failed");
      }
    });
  });

  describe("Configuration Security", () => {
    it("should respect security configuration", () => {
      const securePipeline = createTestPipeline({
        maxFileSize: 1024 * 1024, // 1MB
        defaultThumbnailSize: [100, 100],
      });

      expect(securePipeline.getConfig().maxFileSize).toBe(1024 * 1024);
    });

    it("should update configuration securely", () => {
      pipeline.updateConfig({
        maxFileSize: 5 * 1024 * 1024, // 5MB
      });

      expect(pipeline.getConfig().maxFileSize).toBe(5 * 1024 * 1024);
    });
  });
});
