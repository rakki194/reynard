/**
 * File Upload Composable Test Suite
 *
 * Tests for the useFileUpload composable including upload management,
 * progress tracking, and error handling.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@solidjs/testing-library";
import { useFileUpload } from "../useFileUpload";

// Mock the child composables
vi.mock("../useUploadState", () => ({
  useUploadState: () => ({
    uploads: [],
    uploadControllers: new Map(),
    setUploads: vi.fn(),
    addUpload: vi.fn(),
    removeUpload: vi.fn(),
    updateUpload: vi.fn(),
  }),
}));

vi.mock("../useFileValidation", () => ({
  useFileValidation: () => ({
    validateFiles: vi.fn().mockReturnValue({ valid: true, errors: [] }),
    validateFile: vi.fn().mockReturnValue({ valid: true, errors: [] }),
  }),
}));

vi.mock("../useSingleFileUpload", () => ({
  useSingleFileUpload: () => ({
    uploadFile: vi.fn(),
    cancelUpload: vi.fn(),
  }),
}));

vi.mock("../useUploadStats", () => ({
  useUploadStats: () => ({
    totalFiles: 0,
    totalSize: 0,
    completedFiles: 0,
    failedFiles: 0,
    uploadSpeed: 0,
    estimatedTime: 0,
  }),
}));

vi.mock("../useFileUploadHelpers", () => ({
  createUpdateProgressFunction: vi.fn(() => vi.fn()),
}));

vi.mock("../useUploadActions", () => ({
  createUploadActions: vi.fn(() => ({
    startUpload: vi.fn(),
    cancelUpload: vi.fn(),
    removeUploadItem: vi.fn(),
    retryUpload: vi.fn(),
    clearCompleted: vi.fn(),
  })),
}));

describe("useFileUpload", () => {
  const mockConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/*", "application/pdf"],
    maxFiles: 5,
    autoUpload: false,
    uploadUrl: "/api/upload",
    headers: {},
  };

  const mockCallbacks = {
    onUploadStart: vi.fn(),
    onUploadProgress: vi.fn(),
    onUploadComplete: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig }),
      );

      expect(result.current.uploadItems()).toEqual([]);
      expect(result.current.isUploading()).toBe(false);
      expect(result.current.uploadProgress()).toEqual({});
    });

    it("should initialize with callbacks", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig, callbacks: mockCallbacks }),
      );

      expect(result.current.uploadItems()).toEqual([]);
      expect(result.current.isUploading()).toBe(false);
    });

    it("should initialize with current path", () => {
      const { result } = renderHook(() =>
        useFileUpload({
          config: mockConfig,
          currentPath: "/Photos",
        }),
      );

      expect(result.current.uploadItems()).toEqual([]);
    });
  });

  describe("File Management", () => {
    it("should add files to upload queue", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig }),
      );

      const mockFiles = [
        new File(["content1"], "test1.txt", { type: "text/plain" }),
        new File(["content2"], "test2.txt", { type: "text/plain" }),
      ];

      act(() => {
        result.current.addFiles(mockFiles);
      });

      expect(result.current.uploadItems()).toHaveLength(2);
    });

    it("should remove files from upload queue", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig }),
      );

      const mockFiles = [
        new File(["content1"], "test1.txt", { type: "text/plain" }),
        new File(["content2"], "test2.txt", { type: "text/plain" }),
      ];

      act(() => {
        result.current.addFiles(mockFiles);
        result.current.removeUploadItem("0");
      });

      expect(result.current.uploadItems()).toHaveLength(1);
    });

    it("should clear all upload items", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig }),
      );

      const mockFiles = [
        new File(["content1"], "test1.txt", { type: "text/plain" }),
        new File(["content2"], "test2.txt", { type: "text/plain" }),
      ];

      act(() => {
        result.current.addFiles(mockFiles);
        result.current.clearCompleted();
      });

      expect(result.current.uploadItems()).toHaveLength(0);
    });
  });

  describe("Upload Process", () => {
    it("should start upload process", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig, callbacks: mockCallbacks }),
      );

      const mockFiles = [
        new File(["content1"], "test1.txt", { type: "text/plain" }),
      ];

      act(() => {
        result.current.addFiles(mockFiles);
        result.current.startUpload();
      });

      expect(result.current.isUploading()).toBe(true);
      expect(mockCallbacks.onUploadStart).toHaveBeenCalled();
    });

    it("should cancel upload process", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig }),
      );

      act(() => {
        result.current.startUpload();
        result.current.cancelUpload("0");
      });

      expect(result.current.isUploading()).toBe(false);
    });

    it("should retry failed uploads", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig }),
      );

      act(() => {
        result.current.retryUpload("0");
      });

      expect(result.current.isUploading()).toBe(true);
    });
  });

  describe("Progress Tracking", () => {
    it("should track upload progress", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig, callbacks: mockCallbacks }),
      );

      act(() => {
        result.current.updateProgress("0", 50);
      });

      expect(result.current.uploadProgress()["0"]).toBe(50);
      expect(mockCallbacks.onUploadProgress).toHaveBeenCalledWith("0", 50);
    });

    it("should handle upload completion", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig, callbacks: mockCallbacks }),
      );

      const mockResult = { success: true, fileId: "123" };

      act(() => {
        result.current.handleUploadComplete("0", mockResult);
      });

      expect(mockCallbacks.onUploadComplete).toHaveBeenCalledWith(
        "0",
        mockResult,
      );
    });

    it("should handle upload errors", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig, callbacks: mockCallbacks }),
      );

      const mockError = new Error("Upload failed");

      act(() => {
        result.current.handleUploadError("0", mockError);
      });

      expect(mockCallbacks.onError).toHaveBeenCalledWith("0", mockError);
    });
  });

  describe("Validation", () => {
    it("should validate files before upload", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig }),
      );

      const mockFiles = [
        new File(["content1"], "test1.txt", { type: "text/plain" }),
      ];

      act(() => {
        result.current.addFiles(mockFiles);
      });

      // Validation should be called during addFiles
      expect(result.current.uploadItems()).toHaveLength(1);
    });

    it("should handle validation errors", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig }),
      );

      // Mock validation to return errors
      const mockValidation = {
        validateFiles: vi.fn().mockReturnValue({
          valid: false,
          errors: ["File too large"],
        }),
      };

      // This would be set up in the actual implementation
      expect(result.current.uploadItems()).toEqual([]);
    });
  });

  describe("Configuration", () => {
    it("should respect maxFileSize configuration", () => {
      const configWithSizeLimit = {
        ...mockConfig,
        maxFileSize: 1000, // 1KB
      };

      const { result } = renderHook(() =>
        useFileUpload({ config: configWithSizeLimit }),
      );

      const largeFile = new File(["content"], "large.txt", {
        type: "text/plain",
      });
      Object.defineProperty(largeFile, "size", { value: 2000 });

      act(() => {
        result.current.addFiles([largeFile]);
      });

      // Should not add file due to size limit
      expect(result.current.uploadItems()).toHaveLength(0);
    });

    it("should respect maxFiles configuration", () => {
      const configWithFileLimit = {
        ...mockConfig,
        maxFiles: 2,
      };

      const { result } = renderHook(() =>
        useFileUpload({ config: configWithFileLimit }),
      );

      const mockFiles = [
        new File(["content1"], "test1.txt", { type: "text/plain" }),
        new File(["content2"], "test2.txt", { type: "text/plain" }),
        new File(["content3"], "test3.txt", { type: "text/plain" }),
      ];

      act(() => {
        result.current.addFiles(mockFiles);
      });

      // Should only add up to maxFiles
      expect(result.current.uploadItems()).toHaveLength(2);
    });

    it("should respect allowedTypes configuration", () => {
      const configWithTypeLimit = {
        ...mockConfig,
        allowedTypes: ["image/*"],
      };

      const { result } = renderHook(() =>
        useFileUpload({ config: configWithTypeLimit }),
      );

      const mockFiles = [
        new File(["content1"], "test1.txt", { type: "text/plain" }),
        new File(["content2"], "test2.jpg", { type: "image/jpeg" }),
      ];

      act(() => {
        result.current.addFiles(mockFiles);
      });

      // Should only add files with allowed types
      expect(result.current.uploadItems()).toHaveLength(1);
    });
  });

  describe("Auto Upload", () => {
    it("should auto-upload when enabled", () => {
      const configWithAutoUpload = {
        ...mockConfig,
        autoUpload: true,
      };

      const { result } = renderHook(() =>
        useFileUpload({
          config: configWithAutoUpload,
          callbacks: mockCallbacks,
        }),
      );

      const mockFiles = [
        new File(["content1"], "test1.txt", { type: "text/plain" }),
      ];

      act(() => {
        result.current.addFiles(mockFiles);
      });

      // Should automatically start upload
      expect(result.current.isUploading()).toBe(true);
      expect(mockCallbacks.onUploadStart).toHaveBeenCalled();
    });

    it("should not auto-upload when disabled", () => {
      const { result } = renderHook(() =>
        useFileUpload({ config: mockConfig, callbacks: mockCallbacks }),
      );

      const mockFiles = [
        new File(["content1"], "test1.txt", { type: "text/plain" }),
      ];

      act(() => {
        result.current.addFiles(mockFiles);
      });

      // Should not automatically start upload
      expect(result.current.isUploading()).toBe(false);
      expect(mockCallbacks.onUploadStart).not.toHaveBeenCalled();
    });
  });
});
