/**
 * 🦊 Reynard Queue Watcher Core Tests
 *
 * Tests for the core watcher functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { setupFileWatchers, setupStatusReporting } from "../watcher.js";

// Mock fs module
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    watch: vi.fn()
  }
}));

// Mock queue manager
vi.mock("../queue-manager.js", () => ({
  queueManager: {
    enqueueFile: vi.fn(),
    getStatus: vi.fn(() => ({
      totalQueues: 5,
      processingFiles: ["test.ts"],
      isProcessing: true
    }))
  }
}));

// Mock processors
vi.mock("../processors.js", () => ({
  Processors: {
    waitForStable: vi.fn()
  }
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
      const mockWatch = vi.fn();
      (fs.watch as any).mockImplementation(mockWatch);
      (fs.existsSync as any).mockReturnValue(true);

      setupFileWatchers();

      // Should call fs.watch for each watchable directory
      expect(mockWatch).toHaveBeenCalled();
      
      // Check that it was called with recursive: true
      const calls = mockWatch.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      for (const call of calls) {
        expect(call[1]).toEqual({ recursive: true });
      }
    });

    it("should handle non-existent directories gracefully", () => {
      const mockWatch = vi.fn();
      (fs.watch as any).mockImplementation(mockWatch);
      (fs.existsSync as any).mockReturnValue(false);

      setupFileWatchers();

      // Should not call fs.watch for non-existent directories
      expect(mockWatch).not.toHaveBeenCalled();
    });

    it("should handle fs.watch errors gracefully", () => {
      const mockWatch = vi.fn().mockImplementation(() => {
        throw new Error("Watch error");
      });
      (fs.watch as any).mockImplementation(mockWatch);
      (fs.existsSync as any).mockReturnValue(true);

      setupFileWatchers();

      // Should not throw, but should log error
      expect(console.error).toHaveBeenCalled();
    });

    it("should process file changes correctly", () => {
      const mockWatch = vi.fn();
      (fs.watch as any).mockImplementation(mockWatch);
      (fs.existsSync as any).mockReturnValue(true);

      setupFileWatchers();

      // Get the callback function
      const watchCallback = mockWatch.mock.calls[0][2];
      
      // Simulate a file change
      watchCallback("change", "test.ts");
      
      // Should not process if file doesn't exist
      (fs.existsSync as any).mockReturnValue(false);
      watchCallback("change", "nonexistent.ts");
      
      // Should process if file exists
      (fs.existsSync as any).mockReturnValue(true);
      watchCallback("change", "existing.ts");
    });

    it("should ignore non-change events", () => {
      const mockWatch = vi.fn();
      (fs.watch as any).mockImplementation(mockWatch);
      (fs.existsSync as any).mockReturnValue(true);

      setupFileWatchers();

      const watchCallback = mockWatch.mock.calls[0][2];
      
      // Should ignore rename events
      watchCallback("rename", "test.ts");
      
      // Should ignore other events
      watchCallback("delete", "test.ts");
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
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("📊 Queue Status:")
      );
      
      mockSetInterval.mockRestore();
    });
  });
});
