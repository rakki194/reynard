/**
 * 🦊 Types Tests
 *
 * Tests for TypeScript type definitions and validation.
 */

import { describe, expect, it } from "vitest";
import type {
  FileProcessor,
  FileType,
  FileTypeConfig,
  FileWatcherOptions,
  Priority,
  ProcessingOptions,
  ProcessingResult,
  ProcessorChain,
  ProcessorEntry,
  QueueManagerOptions,
  QueueStatus,
  WatcherConfig,
  WatcherEvent,
  WatcherStats,
} from "../types.js";

describe("Type Definitions", () => {
  describe("FileProcessor", () => {
    it("should accept correct function signature", () => {
      const processor: FileProcessor = async (filePath: string, options?: ProcessingOptions) => {
        expect(typeof filePath).toBe("string");
        expect(options).toBeUndefined();
      };

      expect(typeof processor).toBe("function");
    });

    it("should accept options parameter", () => {
      const processor: FileProcessor = async (filePath: string, options?: ProcessingOptions) => {
        expect(typeof filePath).toBe("string");
        expect(options).toBeDefined();
        expect(options?.fileType).toBe("markdown");
      };

      expect(typeof processor).toBe("function");
    });
  });

  describe("ProcessingOptions", () => {
    it("should accept valid file types", () => {
      const options: ProcessingOptions = {
        fileType: "markdown",
        priority: "normal",
        delay: 1000,
      };

      expect(options.fileType).toBe("markdown");
      expect(options.priority).toBe("normal");
      expect(options.delay).toBe(1000);
    });

    it("should accept all valid file types", () => {
      const fileTypes: FileType[] = ["markdown", "python", "typescript", "javascript"];

      fileTypes.forEach(fileType => {
        const options: ProcessingOptions = { fileType };
        expect(options.fileType).toBe(fileType);
      });
    });

    it("should accept all valid priorities", () => {
      const priorities: Priority[] = ["low", "normal", "high"];

      priorities.forEach(priority => {
        const options: ProcessingOptions = { priority };
        expect(options.priority).toBe(priority);
      });
    });

    it("should accept custom properties", () => {
      const options: ProcessingOptions = {
        fileType: "markdown",
        customProperty: "custom value",
        anotherProperty: 123,
      };

      expect(options.customProperty).toBe("custom value");
      expect(options.anotherProperty).toBe(123);
    });
  });

  describe("QueueStatus", () => {
    it("should have correct structure", () => {
      const status: QueueStatus = {
        totalQueues: 5,
        processingFiles: ["/file1.md", "/file2.py"],
        isProcessing: true,
        queueDetails: {
          "/file1.md": {
            pendingProcessors: 2,
            isProcessing: false,
          },
          "/file2.py": {
            pendingProcessors: 1,
            isProcessing: true,
          },
        },
      };

      expect(typeof status.totalQueues).toBe("number");
      expect(Array.isArray(status.processingFiles)).toBe(true);
      expect(typeof status.isProcessing).toBe("boolean");
      expect(typeof status.queueDetails).toBe("object");
    });

    it("should handle empty state", () => {
      const status: QueueStatus = {
        totalQueues: 0,
        processingFiles: [],
        isProcessing: false,
        queueDetails: {},
      };

      expect(status.totalQueues).toBe(0);
      expect(status.processingFiles).toHaveLength(0);
      expect(status.isProcessing).toBe(false);
      expect(Object.keys(status.queueDetails)).toHaveLength(0);
    });
  });

  describe("ProcessorEntry", () => {
    it("should have correct structure", () => {
      const processor: FileProcessor = async () => {};
      const entry: ProcessorEntry = {
        processor,
        options: { fileType: "markdown" },
        addedAt: Date.now(),
      };

      expect(typeof entry.processor).toBe("function");
      expect(typeof entry.options).toBe("object");
      expect(typeof entry.addedAt).toBe("number");
    });
  });

  describe("WatcherConfig", () => {
    it("should have correct structure", () => {
      const config: WatcherConfig = {
        watchDirectories: ["docs", "src"],
        excludePatterns: [/\/dist\//, /\/node_modules\//],
        processingCooldown: 2000,
        statusReportInterval: 10000,
      };

      expect(Array.isArray(config.watchDirectories)).toBe(true);
      expect(Array.isArray(config.excludePatterns)).toBe(true);
      expect(typeof config.processingCooldown).toBe("number");
      expect(typeof config.statusReportInterval).toBe("number");
    });
  });

  describe("FileWatcherOptions", () => {
    it("should have correct structure", () => {
      const options: FileWatcherOptions = {
        recursive: true,
        ignoreInitial: false,
        followSymlinks: true,
        depth: 5,
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 100,
        },
      };

      expect(typeof options.recursive).toBe("boolean");
      expect(typeof options.ignoreInitial).toBe("boolean");
      expect(typeof options.followSymlinks).toBe("boolean");
      expect(typeof options.depth).toBe("number");
      expect(typeof options.awaitWriteFinish).toBe("object");
    });

    it("should handle optional properties", () => {
      const options: FileWatcherOptions = {};

      expect(options.recursive).toBeUndefined();
      expect(options.ignoreInitial).toBeUndefined();
      expect(options.followSymlinks).toBeUndefined();
      expect(options.depth).toBeUndefined();
      expect(options.awaitWriteFinish).toBeUndefined();
    });
  });

  describe("QueueManagerOptions", () => {
    it("should have correct structure", () => {
      const options: QueueManagerOptions = {
        maxConcurrentFiles: 5,
        cleanupInterval: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      expect(typeof options.maxConcurrentFiles).toBe("number");
      expect(typeof options.cleanupInterval).toBe("number");
      expect(typeof options.retryAttempts).toBe("number");
      expect(typeof options.retryDelay).toBe("number");
    });
  });

  describe("ProcessingResult", () => {
    it("should handle success case", () => {
      const result: ProcessingResult = {
        success: true,
        filePath: "/test/file.md",
        processors: ["waitForStable", "validateSentenceLength"],
        duration: 1500,
      };

      expect(result.success).toBe(true);
      expect(typeof result.filePath).toBe("string");
      expect(Array.isArray(result.processors)).toBe(true);
      expect(typeof result.duration).toBe("number");
      expect(result.errors).toBeUndefined();
    });

    it("should handle error case", () => {
      const result: ProcessingResult = {
        success: false,
        filePath: "/test/file.md",
        processors: ["waitForStable", "validateSentenceLength"],
        duration: 500,
        errors: ["Validation failed", "Formatting failed"],
      };

      expect(result.success).toBe(false);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe("WatcherEvent", () => {
    it("should handle file events", () => {
      const event: WatcherEvent = {
        type: "change",
        path: "/test/file.md",
        stats: {
          size: 1024,
          mtime: new Date(),
          isFile: true,
          isDirectory: false,
        },
      };

      expect(["add", "change", "unlink", "addDir", "unlinkDir"]).toContain(event.type);
      expect(typeof event.path).toBe("string");
      expect(typeof event.stats).toBe("object");
    });

    it("should handle directory events", () => {
      const event: WatcherEvent = {
        type: "addDir",
        path: "/test/directory",
        stats: {
          size: 0,
          mtime: new Date(),
          isFile: false,
          isDirectory: true,
        },
      };

      expect(event.type).toBe("addDir");
      expect(event.stats?.isDirectory).toBe(true);
    });
  });

  describe("ProcessorChain", () => {
    it("should have correct structure", () => {
      const processor: FileProcessor = async () => {};
      const chain: ProcessorChain = {
        name: "markdown-processing",
        processors: [processor],
        options: { fileType: "markdown" },
      };

      expect(typeof chain.name).toBe("string");
      expect(Array.isArray(chain.processors)).toBe(true);
      expect(typeof chain.options).toBe("object");
    });
  });

  describe("FileTypeConfig", () => {
    it("should have correct structure", () => {
      const processor: FileProcessor = async () => {};
      const config: FileTypeConfig = {
        extensions: [".md", ".markdown"],
        processors: [processor],
        options: { fileType: "markdown" },
      };

      expect(Array.isArray(config.extensions)).toBe(true);
      expect(Array.isArray(config.processors)).toBe(true);
      expect(typeof config.options).toBe("object");
    });
  });

  describe("WatcherStats", () => {
    it("should have correct structure", () => {
      const stats: WatcherStats = {
        filesProcessed: 100,
        filesSkipped: 25,
        errors: 5,
        startTime: new Date(),
        lastActivity: new Date(),
        averageProcessingTime: 1500,
      };

      expect(typeof stats.filesProcessed).toBe("number");
      expect(typeof stats.filesSkipped).toBe("number");
      expect(typeof stats.errors).toBe("number");
      expect(stats.startTime).toBeInstanceOf(Date);
      expect(stats.lastActivity).toBeInstanceOf(Date);
      expect(typeof stats.averageProcessingTime).toBe("number");
    });
  });
});

describe("Type Compatibility", () => {
  describe("FileProcessor compatibility", () => {
    it("should be compatible with actual processor functions", async () => {
      const processor: FileProcessor = async (filePath: string, options?: ProcessingOptions) => {
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 10));
      };

      await processor("/test/file.md", { fileType: "markdown" });
      expect(true).toBe(true); // If we get here, the type is compatible
    });
  });

  describe("ProcessingOptions compatibility", () => {
    it("should work with real processor options", () => {
      const options: ProcessingOptions = {
        fileType: "typescript",
        priority: "high",
        delay: 500,
        customOption: "test",
      };

      // These should all be valid
      expect(options.fileType).toBe("typescript");
      expect(options.priority).toBe("high");
      expect(options.delay).toBe(500);
      expect(options.customOption).toBe("test");
    });
  });

  describe("QueueStatus compatibility", () => {
    it("should work with real queue status", () => {
      const status: QueueStatus = {
        totalQueues: 3,
        processingFiles: ["/file1.md", "/file2.py"],
        isProcessing: true,
        queueDetails: {
          "/file1.md": { pendingProcessors: 2, isProcessing: false },
          "/file2.py": { pendingProcessors: 1, isProcessing: true },
        },
      };

      // All properties should be accessible
      expect(status.totalQueues).toBe(3);
      expect(status.processingFiles).toHaveLength(2);
      expect(status.isProcessing).toBe(true);
      expect(Object.keys(status.queueDetails)).toHaveLength(2);
    });
  });
});
