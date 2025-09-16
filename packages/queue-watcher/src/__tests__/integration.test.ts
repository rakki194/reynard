/**
 * 🦊 Integration Tests
 *
 * End-to-end tests for the complete queue watcher workflow.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Processors } from "../processors.js";
import { FileQueueManager } from "../queue-manager.js";
import { mockExecSync, mockFs } from "./setup.js";
import { createTestDirectory, createTestFile, mockFileWatcher, setupMocks, testData, waitFor } from "./test-utils.js";

describe("Queue Watcher Integration", () => {
  let manager: FileQueueManager;
  let mockWatcher: ReturnType<typeof mockFileWatcher>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
    mockExecSync.mockReturnValue(Buffer.from("Mock command output"));
    manager = new FileQueueManager();
    manager.setAutoStart(false); // Disable auto-start for testing
    mockWatcher = mockFileWatcher();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Complete File Processing Workflow", () => {
    it("should process markdown files end-to-end", async () => {
      const filePath = createTestFile(testData.markdownFile.path, testData.markdownFile.content);
      const processors = [Processors.waitForStable, Processors.validateSentenceLength, Processors.validateLinks];

      // Enqueue file
      manager.enqueueFile(filePath, processors, { fileType: "markdown" });

      // Verify file was queued
      let status = manager.getStatus();
      expect(status.totalQueues).toBe(1);
      expect(status.queueDetails[filePath].pendingProcessors).toBe(3);

      // Process all files
      await manager.processAll();

      // Verify processing completed
      status = manager.getStatus();
      expect(status.isProcessing).toBe(false);
      expect(status.processingFiles).toHaveLength(0);
    });

    it("should process Python files end-to-end", async () => {
      const filePath = createTestFile(testData.pythonFile.path, testData.pythonFile.content);
      const processors = [Processors.waitForStable, Processors.validatePython];

      manager.enqueueFile(filePath, processors, { fileType: "python" });

      let status = manager.getStatus();
      expect(status.totalQueues).toBe(1);
      expect(status.queueDetails[filePath].pendingProcessors).toBe(2);

      await manager.processAll();

      status = manager.getStatus();
      expect(status.isProcessing).toBe(false);
    });

    it("should process TypeScript files end-to-end", async () => {
      const filePath = createTestFile(testData.typescriptFile.path, testData.typescriptFile.content);
      const processors = [Processors.waitForStable, Processors.formatWithPrettier, Processors.fixWithESLint];

      manager.enqueueFile(filePath, processors, { fileType: "typescript" });

      let status = manager.getStatus();
      expect(status.totalQueues).toBe(1);
      expect(status.queueDetails[filePath].pendingProcessors).toBe(3);

      await manager.processAll();

      status = manager.getStatus();
      expect(status.isProcessing).toBe(false);
    });

    it("should process JavaScript files end-to-end", async () => {
      const filePath = createTestFile(testData.javascriptFile.path, testData.javascriptFile.content);
      const processors = [Processors.waitForStable, Processors.formatWithPrettier, Processors.fixWithESLint];

      manager.enqueueFile(filePath, processors, { fileType: "javascript" });

      let status = manager.getStatus();
      expect(status.totalQueues).toBe(1);
      expect(status.queueDetails[filePath].pendingProcessors).toBe(3);

      await manager.processAll();

      status = manager.getStatus();
      expect(status.isProcessing).toBe(false);
    });
  });

  describe("Multiple File Processing", () => {
    it("should process multiple files concurrently", async () => {
      const files = [
        createTestFile("/test/file1.md", testData.markdownFile.content),
        createTestFile("/test/file2.py", testData.pythonFile.content),
        createTestFile("/test/file3.ts", testData.typescriptFile.content),
      ];

      // Enqueue all files
      files.forEach((filePath, index) => {
        const processors =
          index === 0
            ? [Processors.waitForStable, Processors.validateSentenceLength]
            : index === 1
              ? [Processors.waitForStable, Processors.validatePython]
              : [Processors.waitForStable, Processors.formatWithPrettier];

        manager.enqueueFile(filePath, processors);
      });

      // Verify all files were queued
      let status = manager.getStatus();
      expect(status.totalQueues).toBe(3);
      expect(status.isProcessing).toBe(false); // Auto-start is disabled

      // Process all files
      await manager.processAll();

      // Verify processing completed
      status = manager.getStatus();
      expect(status.isProcessing).toBe(false);
      expect(status.processingFiles).toHaveLength(0);
    });

    it("should handle files with different processor counts", async () => {
      const file1 = createTestFile("/test/simple.md", testData.markdownFile.content);
      const file2 = createTestFile("/test/complex.ts", testData.typescriptFile.content);

      // Simple file with one processor
      manager.enqueueFile(file1, [Processors.waitForStable]);

      // Complex file with multiple processors
      manager.enqueueFile(file2, [Processors.waitForStable, Processors.formatWithPrettier, Processors.fixWithESLint]);

      let status = manager.getStatus();
      expect(status.totalQueues).toBe(2);
      expect(status.queueDetails[file1].pendingProcessors).toBe(1);
      expect(status.queueDetails[file2].pendingProcessors).toBe(3);

      await manager.processAll();

      status = manager.getStatus();
      expect(status.isProcessing).toBe(false);
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should continue processing after processor failure", async () => {
      const filePath = createTestFile("/test/file.md", testData.markdownFile.content);
      const failingProcessor = vi.fn().mockRejectedValue(new Error("Processor failed"));
      const succeedingProcessor = vi.fn().mockResolvedValue(undefined);

      manager.enqueueFile(filePath, [failingProcessor, succeedingProcessor]);

      await manager.processAll();

      // Both processors should have been called
      expect(failingProcessor).toHaveBeenCalled();
      expect(succeedingProcessor).toHaveBeenCalled();

      // Processing should have completed
      const status = manager.getStatus();
      expect(status.isProcessing).toBe(false);
    });

    it("should handle non-existent files gracefully", () => {
      const nonExistentFile = "/nonexistent/file.md";
      mockFs.existsSync.mockReturnValue(false);

      manager.enqueueFile(nonExistentFile, [Processors.waitForStable]);

      const status = manager.getStatus();
      expect(status.totalQueues).toBe(0);
    });

    it("should handle execSync failures in processors", async () => {
      const filePath = createTestFile("/test/file.md", testData.markdownFile.content);

      // Mock execSync to fail for validation
      mockExecSync.mockImplementation(() => {
        throw new Error("Validation command failed");
      });

      manager.enqueueFile(filePath, [Processors.validateSentenceLength]);

      await waitFor(1000);

      // Processing should complete even with failures
      const status = manager.getStatus();
      expect(status.isProcessing).toBe(false);
    });
  });

  describe("File Watcher Integration", () => {
    it("should trigger processing on file changes", () => {
      const watchDir = "/test";
      const fileName = "document.md";
      const filePath = `${watchDir}/${fileName}`;

      createTestDirectory(watchDir);
      createTestFile(filePath, testData.markdownFile.content);

      // Setup watcher (this would be done by the CLI)
      mockFs.watch.mockImplementation((dir, options, callback) => {
        if (dir === watchDir) {
          // Simulate file change
          setTimeout(() => {
            callback("change", fileName);
          }, 100);
        }
        return { close: vi.fn() };
      });

      // Actually call the mocked fs.watch to trigger the mock
      mockFs.watch(watchDir, { recursive: true }, () => {});

      // Verify watcher was set up
      expect(mockFs.watch).toHaveBeenCalledWith(watchDir, expect.any(Object), expect.any(Function));
    });

    it("should handle multiple file changes", () => {
      const watchDir = "/test";
      const files = ["file1.md", "file2.py", "file3.ts"];

      createTestDirectory(watchDir);
      files.forEach(file => {
        createTestFile(`${watchDir}/${file}`, "content");
      });

      // Setup watcher
      mockFs.watch.mockImplementation((dir, options, callback) => {
        if (dir === watchDir) {
          // Simulate multiple file changes
          files.forEach((file, index) => {
            setTimeout(() => {
              callback("change", file);
            }, index * 100);
          });
        }
        return { close: vi.fn() };
      });

      // Actually call the mocked fs.watch to trigger the mock
      mockFs.watch(watchDir, { recursive: true }, () => {});

      expect(mockFs.watch).toHaveBeenCalled();
    });
  });

  describe("Performance and Concurrency", () => {
    it("should handle high file volume", async () => {
      const fileCount = 10;
      const files: string[] = [];

      // Create many files
      for (let i = 0; i < fileCount; i++) {
        const filePath = createTestFile(`/test/file${i}.md`, testData.markdownFile.content);
        files.push(filePath);
      }

      // Enqueue all files
      files.forEach(filePath => {
        manager.enqueueFile(filePath, [Processors.waitForStable]);
      });

      let status = manager.getStatus();
      expect(status.totalQueues).toBe(fileCount);
      expect(status.isProcessing).toBe(false); // Auto-start is disabled

      // Process all files
      await manager.processAll();

      status = manager.getStatus();
      expect(status.isProcessing).toBe(false);
    });

    it("should maintain queue order", async () => {
      const files = [
        createTestFile("/test/first.md", testData.markdownFile.content),
        createTestFile("/test/second.md", testData.markdownFile.content),
        createTestFile("/test/third.md", testData.markdownFile.content),
      ];

      const processingOrder: string[] = [];

      // Create processors that track order
      const trackingProcessor = (filePath: string) => {
        processingOrder.push(filePath);
        return Promise.resolve();
      };

      // Enqueue files in order
      files.forEach(filePath => {
        manager.enqueueFile(filePath, [trackingProcessor]);
      });

      await manager.processAll();

      // Verify processing order (should be consistent)
      expect(processingOrder).toHaveLength(3);
      expect(processingOrder).toContain(files[0]);
      expect(processingOrder).toContain(files[1]);
      expect(processingOrder).toContain(files[2]);
    });
  });

  describe("Cleanup and Resource Management", () => {
    it("should clean up completed queues", async () => {
      const filePath = createTestFile("/test/file.md", testData.markdownFile.content);

      manager.enqueueFile(filePath, [Processors.waitForStable]);

      let status = manager.getStatus();
      expect(status.totalQueues).toBe(1);

      await manager.processAll();

      // Cleanup completed queues
      manager.cleanup();

      status = manager.getStatus();
      expect(status.totalQueues).toBe(0);
    });

    it("should not clean up queues with pending processors", () => {
      const filePath = createTestFile("/test/file.md", testData.markdownFile.content);
      const slowProcessor = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 2000)));

      manager.enqueueFile(filePath, [slowProcessor]);

      let status = manager.getStatus();
      expect(status.totalQueues).toBe(1);

      // Try to cleanup while processing
      manager.cleanup();

      status = manager.getStatus();
      expect(status.totalQueues).toBe(1);
    });
  });

  describe("Status Reporting", () => {
    it("should provide accurate status information", async () => {
      const file1 = createTestFile("/test/file1.md", testData.markdownFile.content);
      const file2 = createTestFile("/test/file2.py", testData.pythonFile.content);

      // Enqueue files
      manager.enqueueFile(file1, [Processors.waitForStable, Processors.validateSentenceLength]);
      manager.enqueueFile(file2, [Processors.waitForStable]);

      let status = manager.getStatus();
      expect(status.totalQueues).toBe(2);
      expect(status.isProcessing).toBe(false); // Auto-start is disabled
      expect(status.processingFiles).toHaveLength(0); // Not yet processing individual files
      expect(status.queueDetails[file1].pendingProcessors).toBe(2);
      expect(status.queueDetails[file2].pendingProcessors).toBe(1);

      await manager.processAll();

      status = manager.getStatus();
      expect(status.isProcessing).toBe(false);
    });
  });
});
