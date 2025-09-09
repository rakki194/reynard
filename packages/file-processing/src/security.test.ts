/**
 * File Processing Security Tests
 * Tests for file upload and processing security features
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { FileProcessingPipeline } from "./processing-pipeline";

// Mock File object for testing
const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File(["test content"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

describe("File Processing Security", () => {
  let pipeline: FileProcessingPipeline;

  beforeEach(() => {
    pipeline = new FileProcessingPipeline({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      defaultThumbnailSize: [200, 200],
    });
  });

  describe("File Security Validation", () => {
    it("should validate safe file names", async () => {
      const safeFile = createMockFile("document.pdf", 1024, "application/pdf");
      const result = await pipeline.processFile(safeFile);
      expect(result.success).toBe(true);
    });

    it("should reject directory traversal attempts", async () => {
      const traversalFile = createMockFile(
        "../../../etc/passwd",
        1024,
        "text/plain",
      );
      const result = await pipeline.processFile(traversalFile);
      expect(result.success).toBe(false);
      expect(result.error).toBe("File security validation failed");
    });

    it("should reject files with path separators", async () => {
      const pathSeparatorFiles = [
        createMockFile("file/name.txt", 1024, "text/plain"),
        createMockFile("file\\name.txt", 1024, "text/plain"),
      ];

      for (const file of pathSeparatorFiles) {
        const result = await pipeline.processFile(file);
        expect(result.success).toBe(false);
        expect(result.error).toBe("File security validation failed");
      }
    });

    it("should reject dangerous file names", async () => {
      const dangerousFiles = [
        createMockFile(".htaccess", 1024, "text/plain"),
        createMockFile("web.config", 1024, "text/plain"),
        createMockFile("crossdomain.xml", 1024, "text/plain"),
      ];

      for (const file of dangerousFiles) {
        const result = await pipeline.processFile(file);
        expect(result.success).toBe(false);
        expect(result.error).toBe("File security validation failed");
      }
    });

    it("should reject empty file names", async () => {
      const emptyNameFile = createMockFile("", 1024, "text/plain");
      const result = await pipeline.processFile(emptyNameFile);
      expect(result.success).toBe(false);
      expect(result.error).toBe("File security validation failed");
    });

    it("should reject zero-size files", async () => {
      const zeroSizeFile = createMockFile("test.txt", 0, "text/plain");
      const result = await pipeline.processFile(zeroSizeFile);
      expect(result.success).toBe(false);
      expect(result.error).toBe("File security validation failed");
    });
  });

  describe("File Size Validation", () => {
    it("should accept files within size limit", async () => {
      const normalFile = createMockFile(
        "test.txt",
        5 * 1024 * 1024,
        "text/plain",
      ); // 5MB
      const result = await pipeline.processFile(normalFile);
      expect(result.success).toBe(true);
    });

    it("should reject files exceeding size limit", async () => {
      const largeFile = createMockFile(
        "large.txt",
        15 * 1024 * 1024,
        "text/plain",
      ); // 15MB
      const result = await pipeline.processFile(largeFile);
      expect(result.success).toBe(false);
      expect(result.error).toBe("File size exceeds maximum allowed size");
    });

    it("should respect custom size limits", async () => {
      const customFile = createMockFile(
        "test.txt",
        2 * 1024 * 1024,
        "text/plain",
      ); // 2MB
      const result = await pipeline.processFile(customFile, {
        maxFileSize: 1024 * 1024,
      }); // 1MB limit
      expect(result.success).toBe(false);
      expect(result.error).toBe("File size exceeds maximum allowed size");
    });
  });

  describe("File Type Validation", () => {
    it("should accept supported file types", async () => {
      const supportedFiles = [
        createMockFile("image.jpg", 1024, "image/jpeg"),
        createMockFile("image.png", 1024, "image/png"),
        createMockFile("document.pdf", 1024, "application/pdf"),
        createMockFile("text.txt", 1024, "text/plain"),
      ];

      for (const file of supportedFiles) {
        const result = await pipeline.processFile(file);
        expect(result.success).toBe(true);
      }
    });

    it("should reject unsupported file types", async () => {
      const unsupportedFiles = [
        createMockFile("script.js", 1024, "application/javascript"),
        createMockFile("style.css", 1024, "text/css"),
        createMockFile("page.html", 1024, "text/html"),
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
        createMockFile("malware.exe", 1024, "application/x-msdownload"),
        createMockFile("script.bat", 1024, "application/x-msdownload"),
        createMockFile("command.cmd", 1024, "application/x-msdownload"),
        createMockFile("program.com", 1024, "application/x-msdownload"),
        createMockFile("screensaver.scr", 1024, "application/x-msdownload"),
        createMockFile("installer.msi", 1024, "application/x-msdownload"),
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
        createMockFile("archive.zip", 1024, "application/zip"),
        createMockFile("archive.rar", 1024, "application/x-rar-compressed"),
        createMockFile("archive.7z", 1024, "application/x-7z-compressed"),
        createMockFile("archive.tar", 1024, "application/x-tar"),
        createMockFile("archive.gz", 1024, "application/gzip"),
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

  describe("File Path Security", () => {
    it("should handle string file paths safely", async () => {
      const safePath = "images/photo.jpg";
      const result = await pipeline.processFile(safePath);
      expect(result.success).toBe(true);
    });

    it("should reject dangerous string paths", async () => {
      const dangerousPaths = [
        "../etc/passwd",
        "~/secret.txt",
        "/etc/passwd",
        "..\\..\\windows\\system32",
      ];

      for (const path of dangerousPaths) {
        const result = await pipeline.processFile(path);
        expect(result.success).toBe(false);
        expect(result.error).toBe("File security validation failed");
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle processing errors gracefully", async () => {
      // Mock a file that causes processing to throw
      const problematicFile = createMockFile("test.txt", 1024, "text/plain");

      // Mock the thumbnail generator to throw an error
      vi.spyOn(pipeline as any, "generateThumbnail").mockRejectedValue(
        new Error("Processing failed"),
      );

      const result = await pipeline.processFile(problematicFile);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Processing failed");
    });

    it("should handle null and undefined inputs", async () => {
      const result1 = await pipeline.processFile(null as any);
      expect(result1.success).toBe(false);

      const result2 = await pipeline.processFile(undefined as any);
      expect(result2.success).toBe(false);
    });
  });

  describe("Multiple File Processing", () => {
    it("should process multiple files safely", async () => {
      const files = [
        createMockFile("image1.jpg", 1024, "image/jpeg"),
        createMockFile("image2.png", 1024, "image/png"),
        createMockFile("document.pdf", 1024, "application/pdf"),
      ];

      const results = await pipeline.processFiles(files);
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it("should handle mixed valid and invalid files", async () => {
      const files = [
        createMockFile("image.jpg", 1024, "image/jpeg"), // Valid
        createMockFile("malware.exe", 1024, "application/x-msdownload"), // Invalid
        createMockFile("document.pdf", 1024, "application/pdf"), // Valid
      ];

      const results = await pipeline.processFiles(files);
      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });
  });

  describe("Configuration Security", () => {
    it("should respect security configuration", () => {
      const securePipeline = new FileProcessingPipeline({
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

  describe("Edge Cases", () => {
    it("should handle extremely long file names", async () => {
      const longName = "a".repeat(1000) + ".txt";
      const longNameFile = createMockFile(longName, 1024, "text/plain");
      const result = await pipeline.processFile(longNameFile);
      expect(result.success).toBe(false);
      expect(result.error).toBe("File security validation failed");
    });

    it("should handle files with unicode names", async () => {
      const unicodeFile = createMockFile("测试文件.txt", 1024, "text/plain");
      const result = await pipeline.processFile(unicodeFile);
      expect(result.success).toBe(true);
    });

    it("should handle files with special characters in names", async () => {
      const specialCharFile = createMockFile(
        "file@name#test$.txt",
        1024,
        "text/plain",
      );
      const result = await pipeline.processFile(specialCharFile);
      expect(result.success).toBe(true);
    });

    it("should handle files with no extension", async () => {
      const noExtFile = createMockFile("README", 1024, "text/plain");
      const result = await pipeline.processFile(noExtFile);
      expect(result.success).toBe(true);
    });

    it("should handle files with multiple extensions", async () => {
      const multiExtFile = createMockFile(
        "file.txt.backup",
        1024,
        "text/plain",
      );
      const result = await pipeline.processFile(multiExtFile);
      expect(result.success).toBe(true);
    });
  });

  describe("Performance and Resource Limits", () => {
    it("should handle concurrent file processing", async () => {
      const files = Array.from({ length: 10 }, (_, i) =>
        createMockFile(`file${i}.txt`, 1024, "text/plain"),
      );

      const startTime = Date.now();
      const results = await pipeline.processFiles(files);
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should handle memory constraints", async () => {
      // Test with files that might cause memory issues
      const largeFiles = Array.from(
        { length: 5 },
        (_, i) =>
          createMockFile(`large${i}.txt`, 2 * 1024 * 1024, "text/plain"), // 2MB each
      );

      const results = await pipeline.processFiles(largeFiles);
      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });
  });
});
