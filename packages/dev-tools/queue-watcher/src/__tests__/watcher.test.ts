/**
 * 🦊 Reynard Queue Watcher Core Tests
 *
 * Tests for the core watcher functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import { setupFileWatchers, setupStatusReporting } from "../watcher.js";

// Mock fs module
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
  },
}));

// Mock chokidar module
vi.mock("chokidar", () => ({
  default: {
    watch: vi.fn(),
  },
}));

// Mock queue manager
vi.mock("../queue-manager.js", () => ({
  queueManager: {
    enqueueFile: vi.fn(),
    getStatus: vi.fn(() => ({
      totalQueues: 5,
      processingFiles: ["test.ts"],
      isProcessing: true,
    })),
  },
}));

// Mock processors
vi.mock("../processors.js", () => ({
  Processors: {
    waitForStable: vi.fn(),
  },
}));

describe("Watcher Core", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.log to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("setupFileWatchers", () => {
    it("should set up file watchers for existing directories", () => {
      const mockWatch = vi.fn().mockReturnValue({
        on: vi.fn(),
      });
      (chokidar.watch as any).mockImplementation(mockWatch);
      (fs.existsSync as any).mockReturnValue(true);

      setupFileWatchers();

      // Should call chokidar.watch for each watchable directory
      expect(mockWatch).toHaveBeenCalled();

      // Check that it was called with chokidar options
      const calls = mockWatch.mock.calls;
      expect(calls.length).toBeGreaterThan(0);

      for (const call of calls) {
        expect(call[1]).toEqual({
          ignored: /(^|[/\\])\../,
          persistent: true,
          ignoreInitial: true,
          followSymlinks: false,
          cwd: ".",
        });
      }
    });

    it("should handle non-existent directories gracefully", () => {
      const mockWatch = vi.fn();
      (chokidar.watch as any).mockImplementation(mockWatch);
      (fs.existsSync as any).mockReturnValue(false);

      setupFileWatchers();

      // Should not call chokidar.watch for non-existent directories
      expect(mockWatch).not.toHaveBeenCalled();
    });

    it("should handle chokidar.watch errors gracefully", () => {
      const mockWatch = vi.fn().mockImplementation(() => {
        throw new Error("Watch error");
      });
      (chokidar.watch as any).mockImplementation(mockWatch);
      (fs.existsSync as any).mockReturnValue(true);

      setupFileWatchers();

      // Should not throw, but should log error
      expect(console.error).toHaveBeenCalled();
    });

    it("should process file changes correctly", () => {
      const mockOn = vi.fn().mockReturnThis(); // Make it chainable
      const mockWatch = vi.fn().mockReturnValue({
        on: mockOn,
      });
      (chokidar.watch as any).mockImplementation(mockWatch);
      (fs.existsSync as any).mockReturnValue(true);

      setupFileWatchers();

      // Verify that event handlers were set up for each directory
      expect(mockOn).toHaveBeenCalledWith("change", expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith("add", expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith("unlink", expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith("error", expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith("ready", expect.any(Function));

      // Verify that we have the correct number of calls (5 event types per directory)
      // The exact number depends on how many directories are being watched
      const totalCalls = mockOn.mock.calls.length;
      expect(totalCalls).toBeGreaterThan(0);
      expect(totalCalls % 5).toBe(0); // Should be divisible by 5 (5 event types per directory)
    });

    it("should ignore non-change events", () => {
      const mockOn = vi.fn().mockReturnThis(); // Make it chainable
      const mockWatch = vi.fn().mockReturnValue({
        on: mockOn,
      });
      (chokidar.watch as any).mockImplementation(mockWatch);
      (fs.existsSync as any).mockReturnValue(true);

      setupFileWatchers();

      // Verify that only specific events are handled
      expect(mockOn).toHaveBeenCalledWith("change", expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith("add", expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith("unlink", expect.any(Function));
      // Should not handle rename events
      expect(mockOn).not.toHaveBeenCalledWith("rename", expect.any(Function));

      // Verify that we have the correct number of calls (5 event types per directory)
      const totalCalls = mockOn.mock.calls.length;
      expect(totalCalls).toBeGreaterThan(0);
      expect(totalCalls % 5).toBe(0); // Should be divisible by 5 (5 event types per directory)
    });
  });

  describe("setupStatusReporting", () => {
    it("should set up status reporting interval", () => {
      const mockSetInterval = vi.spyOn(global, "setInterval");

      setupStatusReporting();

      expect(mockSetInterval).toHaveBeenCalledWith(
        expect.any(Function),
        10000 // 10 seconds
      );

      mockSetInterval.mockRestore();
    });

    it("should report queue status", () => {
      const mockSetInterval = vi.spyOn(global, "setInterval");

      setupStatusReporting();

      // Get the callback function
      const intervalCallback = mockSetInterval.mock.calls[0][0];

      // Call the callback
      intervalCallback();

      // Should log status
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("📊 Queue Status:"));

      mockSetInterval.mockRestore();
    });
  });
});
