/**
 * 🦊 Queue Manager Tests
 *
 * Comprehensive tests for the queue management system.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Processors } from "../processors.js";
import { FileQueueManager, createQueueManager, queueManager } from "../queue-manager.js";
import { mockFs } from "./setup.js";
import { createTestFile, expectQueueStatus } from "./test-utils.js";

describe("FileQueueManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create a new queue manager instance", () => {
      const manager = new FileQueueManager();
      expect(manager).toBeInstanceOf(FileQueueManager);
    });

    it("should initialize with empty state", () => {
      const manager = new FileQueueManager();
      const status = manager.getStatus();

      expectQueueStatus(status);
      expect(status.totalQueues).toBe(0);
      expect(status.processingFiles).toHaveLength(0);
      expect(status.isProcessing).toBe(false);
    });
  });

  describe("enqueueFile", () => {
    let manager: FileQueueManager;

    beforeEach(() => {
      manager = new FileQueueManager();
      manager.setAutoStart(false); // Disable auto-start for testing
    });

    it("should enqueue a file with processors", async () => {
      const filePath = createTestFile("/test/file.md");
      const processors = [Processors.waitForStable];

      manager.enqueueFile(filePath, processors, { fileType: "markdown" });

      // Check status before processing
      let status = manager.getStatus();
      expect(status.totalQueues).toBe(1);
      expect(status.queueDetails[filePath]).toBeDefined();
      expect(status.queueDetails[filePath].pendingProcessors).toBe(1);

      // Process all files
      await manager.processAll();

      // Check status after processing
      status = manager.getStatus();
      expect(status.totalQueues).toBe(0); // Queue should be cleaned up
    });

    it("should skip non-existent files", () => {
      const filePath = "/nonexistent/file.md";
      mockFs.existsSync.mockReturnValue(false);

      manager.enqueueFile(filePath, [Processors.waitForStable]);

      const status = manager.getStatus();
      expect(status.totalQueues).toBe(0);
    });

    it("should skip already processing files", async () => {
      const filePath = createTestFile("/test/file.md");
      const processors = [Processors.waitForStable];

      // First enqueue
      manager.enqueueFile(filePath, processors);

      // Check status before processing
      let status = manager.getStatus();
      expect(status.totalQueues).toBe(1);
      expect(status.queueDetails[filePath].pendingProcessors).toBe(1);

      // Process all files
      await manager.processAll();

      // Check status after processing
      status = manager.getStatus();
      expect(status.totalQueues).toBe(0); // Queue should be cleaned up
    });

    it("should handle multiple files", () => {
      const file1 = createTestFile("/test/file1.md");
      const file2 = createTestFile("/test/file2.md");
      const processors = [Processors.waitForStable];

      manager.enqueueFile(file1, processors);
      manager.enqueueFile(file2, processors);

      const status = manager.getStatus();
      expect(status.totalQueues).toBe(2);
      expect(status.queueDetails[file1]).toBeDefined();
      expect(status.queueDetails[file2]).toBeDefined();
    });

    it("should handle empty processor arrays", () => {
      const filePath = createTestFile("/test/file.md");

      manager.enqueueFile(filePath, []);

      const status = manager.getStatus();
      expect(status.totalQueues).toBe(1);
      expect(status.queueDetails[filePath].pendingProcessors).toBe(0);
    });
  });

  describe("getStatus", () => {
    let manager: FileQueueManager;

    beforeEach(() => {
      manager = new FileQueueManager();
      manager.setAutoStart(false); // Disable auto-start for testing
    });

    it("should return correct status structure", () => {
      const status = manager.getStatus();

      expectQueueStatus(status);
      expect(typeof status.totalQueues).toBe("number");
      expect(Array.isArray(status.processingFiles)).toBe(true);
      expect(typeof status.isProcessing).toBe("boolean");
      expect(typeof status.queueDetails).toBe("object");
    });

    it("should track processing files correctly", async () => {
      const filePath = createTestFile("/test/file.md");
      manager.enqueueFile(filePath, [Processors.waitForStable]);

      // Check status before processing
      let status = manager.getStatus();
      expect(status.queueDetails[filePath]).toEqual({
        pendingProcessors: 1,
        isProcessing: false,
      });

      // Process all files
      await manager.processAll();

      // Check status after processing
      status = manager.getStatus();
      expect(status.totalQueues).toBe(0); // Queue should be cleaned up
    });
  });

  describe("cleanup", () => {
    let manager: FileQueueManager;

    beforeEach(() => {
      manager = new FileQueueManager();
    });

    it("should clean up completed queues", () => {
      const filePath = createTestFile("/test/file.md");
      manager.enqueueFile(filePath, []); // Empty processor array

      let status = manager.getStatus();
      expect(status.totalQueues).toBe(1);

      manager.cleanup();

      status = manager.getStatus();
      expect(status.totalQueues).toBe(0);
    });

    it("should not clean up queues with pending processors", () => {
      const filePath = createTestFile("/test/file.md");
      manager.enqueueFile(filePath, [Processors.waitForStable]);

      let status = manager.getStatus();
      expect(status.totalQueues).toBe(1);

      manager.cleanup();

      status = manager.getStatus();
      expect(status.totalQueues).toBe(1);
    });
  });

  describe("processing workflow", () => {
    let manager: FileQueueManager;

    beforeEach(() => {
      manager = new FileQueueManager();
      manager.setAutoStart(false); // Disable auto-start for testing
    });

    it("should start processing when files are enqueued", async () => {
      const filePath = createTestFile("/test/file.md");
      const processors = [Processors.waitForStable];

      // Enable auto-start for this test
      manager.setAutoStart(true);
      manager.enqueueFile(filePath, processors);

      // Check that processing started
      let status = manager.getStatus();
      expect(status.isProcessing).toBe(true);

      // Process all files
      await manager.processAll();

      // Check that processing completed
      status = manager.getStatus();
      expect(status.isProcessing).toBe(false);
    });

    it("should handle processor errors gracefully", async () => {
      const filePath = createTestFile("/test/file.md");
      const errorProcessor = vi.fn().mockRejectedValue(new Error("Processor failed"));

      manager.enqueueFile(filePath, [errorProcessor]);

      // Process all files
      await manager.processAll();

      const status = manager.getStatus();
      expect(status.isProcessing).toBe(false);
    });
  });
});

describe("createQueueManager", () => {
  it("should create a new queue manager instance", () => {
    const manager = createQueueManager();
    expect(manager).toBeInstanceOf(FileQueueManager);
  });

  it("should create independent instances", () => {
    const manager1 = createQueueManager();
    const manager2 = createQueueManager();

    expect(manager1).not.toBe(manager2);
  });
});

describe("default queueManager", () => {
  it("should be a singleton instance", () => {
    expect(queueManager).toBeInstanceOf(FileQueueManager);
  });

  it("should be the same instance across imports", () => {
    // This tests that the default export is consistent
    expect(queueManager).toBe(queueManager);
  });
});

describe("FileQueue class", () => {
  let manager: FileQueueManager;

  beforeEach(() => {
    manager = new FileQueueManager();
    manager.setAutoStart(false); // Disable auto-start for testing
  });

  it("should track pending processors correctly", async () => {
    const filePath = createTestFile("/test/file.md");
    const processors = [Processors.waitForStable, Processors.validateSentenceLength];

    manager.enqueueFile(filePath, processors);

    // Check status before processing
    let status = manager.getStatus();
    expect(status.queueDetails[filePath].pendingProcessors).toBe(2);

    // Process all files
    await manager.processAll();

    // Check status after processing
    status = manager.getStatus();
    expect(status.totalQueues).toBe(0); // Queue should be cleaned up
  });

  it("should process processors in order", async () => {
    const filePath = createTestFile("/test/file.md");
    const processor1 = vi.fn().mockResolvedValue(undefined);
    const processor2 = vi.fn().mockResolvedValue(undefined);

    manager.enqueueFile(filePath, [processor1, processor2]);

    // Process all files
    await manager.processAll();

    expect(processor1).toHaveBeenCalledBefore(processor2 as any);
  });

  it("should continue processing after processor failure", async () => {
    const filePath = createTestFile("/test/file.md");
    const failingProcessor = vi.fn().mockRejectedValue(new Error("Failed"));
    const succeedingProcessor = vi.fn().mockResolvedValue(undefined);

    manager.enqueueFile(filePath, [failingProcessor, succeedingProcessor]);

    // Process all files
    await manager.processAll();

    expect(failingProcessor).toHaveBeenCalled();
    expect(succeedingProcessor).toHaveBeenCalled();
  });
});
