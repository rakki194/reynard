/**
 * useTextFileUpload Tests
 *
 * Test suite for the text file upload composable.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTextFileUpload } from "../../useTextFileUpload";
import type { TextFile } from "../../../types/TextTypes";

// Mock the text file utils
vi.mock("../../utils/textFileUtils", () => ({
  processTextFile: vi.fn(),
}));

describe("useTextFileUpload", () => {
  let mockProcessTextFile: any;
  let mockOnError: any;

  beforeEach(async () => {
    // Import mocked functions
    const utils = await import("../../utils/textFileUtils");
    mockProcessTextFile = utils.processTextFile;
    mockOnError = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default state", () => {
      const { isLoading, error } = useTextFileUpload();

      expect(isLoading()).toBe(false);
      expect(error()).toBe(null);
    });

    it("should initialize with custom options", () => {
      const options = {
        maxFiles: 5,
        onError: mockOnError,
      };

      const { isLoading, error } = useTextFileUpload(options);

      expect(isLoading()).toBe(false);
      expect(error()).toBe(null);
    });
  });

  describe("File Upload", () => {
    it("should upload files successfully", async () => {
      const mockFile1 = new File(["test1"], "test1.txt", {
        type: "text/plain",
      });
      const mockFile2 = new File(["test2"], "test2.txt", {
        type: "text/plain",
      });

      const mockTextFile1: TextFile = {
        id: "1",
        name: "test1.txt",
        content: "test1",
        size: 5,
        type: "text/plain",
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      const mockTextFile2: TextFile = {
        id: "2",
        name: "test2.txt",
        content: "test2",
        size: 5,
        type: "text/plain",
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      mockProcessTextFile
        .mockResolvedValueOnce(mockTextFile1)
        .mockResolvedValueOnce(mockTextFile2);

      const mockEvent = {
        target: {
          files: [mockFile1, mockFile2],
        },
      } as any;

      const { handleFileUpload, isLoading, error } = useTextFileUpload();
      const result = await handleFileUpload(mockEvent);

      expect(result).toEqual([mockTextFile1, mockTextFile2]);
      expect(mockProcessTextFile).toHaveBeenCalledTimes(2);
      expect(mockProcessTextFile).toHaveBeenCalledWith(mockFile1);
      expect(mockProcessTextFile).toHaveBeenCalledWith(mockFile2);
      expect(isLoading()).toBe(false);
      expect(error()).toBe(null);
    });

    it("should handle empty file list", async () => {
      const mockEvent = {
        target: {
          files: [],
        },
      } as any;

      const { handleFileUpload } = useTextFileUpload();
      const result = await handleFileUpload(mockEvent);

      expect(result).toEqual([]);
      expect(mockProcessTextFile).not.toHaveBeenCalled();
    });

    it("should handle null files", async () => {
      const mockEvent = {
        target: {
          files: null,
        },
      } as any;

      const { handleFileUpload } = useTextFileUpload();
      const result = await handleFileUpload(mockEvent);

      expect(result).toEqual([]);
      expect(mockProcessTextFile).not.toHaveBeenCalled();
    });

    it("should respect maxFiles limit", async () => {
      const files = Array.from(
        { length: 10 },
        (_, i) =>
          new File([`test${i}`], `test${i}.txt`, { type: "text/plain" }),
      );

      const mockTextFiles = files.map((_, i) => ({
        id: `${i}`,
        name: `test${i}.txt`,
        content: `test${i}`,
        size: 5,
        type: "text/plain",
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      }));

      mockProcessTextFile.mockImplementation((file) =>
        Promise.resolve(mockTextFiles[files.indexOf(file)]),
      );

      const mockEvent = {
        target: { files },
      } as any;

      const { handleFileUpload } = useTextFileUpload({ maxFiles: 3 });
      const result = await handleFileUpload(mockEvent);

      expect(result).toHaveLength(3);
      expect(mockProcessTextFile).toHaveBeenCalledTimes(3);
    });

    it("should handle processing errors gracefully", async () => {
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockProcessTextFile.mockRejectedValue(new Error("Processing failed"));

      const mockEvent = {
        target: { files: [mockFile] },
      } as any;

      const { handleFileUpload } = useTextFileUpload();
      const result = await handleFileUpload(mockEvent);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to process text files:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should call onError callback when processing fails", async () => {
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
      const errorMessage = "Processing failed";

      mockProcessTextFile.mockRejectedValue(new Error(errorMessage));

      const mockEvent = {
        target: { files: [mockFile] },
      } as any;

      const { handleFileUpload } = useTextFileUpload({ onError: mockOnError });
      await handleFileUpload(mockEvent);

      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
    });

    it("should handle non-Error exceptions", async () => {
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });

      mockProcessTextFile.mockRejectedValue("String error");

      const mockEvent = {
        target: { files: [mockFile] },
      } as any;

      const { handleFileUpload, error } = useTextFileUpload({
        onError: mockOnError,
      });
      await handleFileUpload(mockEvent);

      expect(mockOnError).toHaveBeenCalledWith("Failed to process text file");
    });

    it("should set loading state during processing", async () => {
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
      const mockTextFile: TextFile = {
        id: "1",
        name: "test.txt",
        content: "test",
        size: 4,
        type: "text/plain",
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      // Create a promise that we can control
      let resolvePromise: (value: TextFile) => void;
      const processingPromise = new Promise<TextFile>((resolve) => {
        resolvePromise = resolve;
      });

      mockProcessTextFile.mockReturnValue(processingPromise);

      const { handleFileUpload, isLoading, error } = useTextFileUpload();

      // Start processing
      const processingResult = handleFileUpload({
        target: { files: [mockFile] },
      } as any);

      // Check loading state
      expect(isLoading()).toBe(true);
      expect(error()).toBe(null);

      // Resolve the promise
      resolvePromise!(mockTextFile);
      await processingResult;

      // Check final state
      expect(isLoading()).toBe(false);
      expect(error()).toBe(null);
    });

    it("should clear previous errors when starting new processing", async () => {
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
      const mockTextFile: TextFile = {
        id: "1",
        name: "test.txt",
        content: "test",
        size: 4,
        type: "text/plain",
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      // First, cause an error
      mockProcessTextFile.mockRejectedValueOnce(new Error("First error"));
      const { handleFileUpload, error } = useTextFileUpload({
        onError: mockOnError,
      });

      try {
        await handleFileUpload({
          target: { files: [mockFile] },
        } as any);
      } catch {
        // Expected error
      }

      expect(error()).toBe("First error");

      // Then succeed
      mockProcessTextFile.mockResolvedValueOnce(mockTextFile);
      await handleFileUpload({
        target: { files: [mockFile] },
      } as any);

      expect(error()).toBe(null);
    });
  });

  describe("Error Management", () => {
    it("should allow manual error setting", () => {
      const { setError, error } = useTextFileUpload();

      setError("Manual error");
      expect(error()).toBe("Manual error");
    });
  });

  describe("Return Values", () => {
    it("should return all required functions and values", () => {
      const result = useTextFileUpload();

      expect(typeof result.isLoading).toBe("function");
      expect(typeof result.error).toBe("function");
      expect(typeof result.handleFileUpload).toBe("function");
      expect(typeof result.setError).toBe("function");
    });
  });
});
