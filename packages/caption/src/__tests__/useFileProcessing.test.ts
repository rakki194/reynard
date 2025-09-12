/**
 * useFileProcessing Tests
 *
 * Test suite for the file processing composable.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useFileProcessing } from "../../useFileProcessing";
import type { MultiModalFile } from "../../../types/MultiModalTypes";

// Mock the file processing utilities
vi.mock("../../utils/FileProcessingUtils", () => ({
  processFile: vi.fn(),
  createFileProcessingPipeline: vi.fn(),
}));

describe("useFileProcessing", () => {
  let mockProcessFile: any;
  let mockCreatePipeline: any;
  let mockPipeline: any;

  beforeEach(async () => {
    // Import mocked functions
    const utils = await import("../../utils/FileProcessingUtils");
    mockProcessFile = utils.processFile;
    mockCreatePipeline = utils.createFileProcessingPipeline;

    // Create mock pipeline
    mockPipeline = { processFile: vi.fn() };
    mockCreatePipeline.mockReturnValue(mockPipeline);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default state", () => {
      const { isLoading, error } = useFileProcessing();

      expect(isLoading()).toBe(false);
      expect(error()).toBe(null);
    });

    it("should create processing pipeline", () => {
      useFileProcessing();

      expect(mockCreatePipeline).toHaveBeenCalled();
    });
  });

  describe("File Processing", () => {
    it("should process file successfully", async () => {
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const mockResult: MultiModalFile = {
        id: "test-id",
        name: "test.jpg",
        size: 100,
        type: "image/jpeg",
        fileType: "image",
        url: "blob:test-url",
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      mockProcessFile.mockResolvedValue(mockResult);

      const { processFileWrapper, isLoading, error } = useFileProcessing();

      const result = await processFileWrapper(mockFile);

      expect(result).toBe(mockResult);
      expect(isLoading()).toBe(false);
      expect(error()).toBe(null);
      expect(mockProcessFile).toHaveBeenCalledWith(mockFile, mockPipeline);
    });

    it("should handle processing errors", async () => {
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const errorMessage = "Processing failed";

      mockProcessFile.mockRejectedValue(new Error(errorMessage));

      const { processFileWrapper, isLoading, error } = useFileProcessing();

      await expect(processFileWrapper(mockFile)).rejects.toThrow(errorMessage);
      expect(isLoading()).toBe(false);
      expect(error()).toBe(errorMessage);
    });

    it("should handle non-Error exceptions", async () => {
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

      mockProcessFile.mockRejectedValue("String error");

      const { processFileWrapper, isLoading, error } = useFileProcessing();

      await expect(processFileWrapper(mockFile)).rejects.toThrow(
        "Failed to process file",
      );
      expect(isLoading()).toBe(false);
      expect(error()).toBe("Failed to process file");
    });

    it("should set loading state during processing", async () => {
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const mockResult: MultiModalFile = {
        id: "test-id",
        name: "test.jpg",
        size: 100,
        type: "image/jpeg",
        fileType: "image",
        url: "blob:test-url",
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      // Create a promise that we can control
      let resolvePromise: (value: MultiModalFile) => void;
      const processingPromise = new Promise<MultiModalFile>((resolve) => {
        resolvePromise = resolve;
      });

      mockProcessFile.mockReturnValue(processingPromise);

      const { processFileWrapper, isLoading, error } = useFileProcessing();

      // Start processing
      const processingResult = processFileWrapper(mockFile);

      // Check loading state
      expect(isLoading()).toBe(true);
      expect(error()).toBe(null);

      // Resolve the promise
      resolvePromise!(mockResult);
      await processingResult;

      // Check final state
      expect(isLoading()).toBe(false);
      expect(error()).toBe(null);
    });

    it("should clear previous errors when starting new processing", async () => {
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const mockResult: MultiModalFile = {
        id: "test-id",
        name: "test.jpg",
        size: 100,
        type: "image/jpeg",
        fileType: "image",
        url: "blob:test-url",
        uploadedAt: new Date(),
        modifiedAt: new Date(),
      };

      // First, cause an error
      mockProcessFile.mockRejectedValueOnce(new Error("First error"));
      const { processFileWrapper, error } = useFileProcessing();

      try {
        await processFileWrapper(mockFile);
      } catch {
        // Expected error
      }

      expect(error()).toBe("First error");

      // Then succeed
      mockProcessFile.mockResolvedValueOnce(mockResult);
      await processFileWrapper(mockFile);

      expect(error()).toBe(null);
    });
  });

  describe("Return Values", () => {
    it("should return all required functions and values", () => {
      const result = useFileProcessing();

      expect(typeof result.isLoading).toBe("function");
      expect(typeof result.error).toBe("function");
      expect(typeof result.processFileWrapper).toBe("function");
      expect(result.processingPipeline).toBeDefined();
    });

    it("should return the created processing pipeline", () => {
      const { processingPipeline } = useFileProcessing();

      expect(processingPipeline).toBe(mockPipeline);
    });
  });
});
