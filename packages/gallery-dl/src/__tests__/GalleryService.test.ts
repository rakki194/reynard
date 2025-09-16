import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GalleryService } from "../services/GalleryService";
import type { DownloadOptions, DownloadResult, ExtractorInfo, ValidationResult } from "../types";

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("GalleryService", () => {
  let service: GalleryService;

  beforeEach(() => {
    service = new GalleryService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("downloadGallery", () => {
    it("should download gallery successfully", async () => {
      const mockResult: DownloadResult = {
        success: true,
        download_id: "test-download-123",
        url: "https://example.com/gallery",
        extractor: "test-extractor",
        files: [
          {
            id: "file-1",
            url: "https://example.com/image1.jpg",
            filename: "image1.jpg",
            size: 1024000,
            status: "downloaded",
            path: "/downloads/image1.jpg",
          },
          {
            id: "file-2",
            url: "https://example.com/image2.jpg",
            filename: "image2.jpg",
            size: 2048000,
            status: "downloaded",
            path: "/downloads/image2.jpg",
          },
        ],
        total_files: 2,
        downloaded_files: 2,
        total_bytes: 3072000,
        downloaded_bytes: 3072000,
        status: "completed",
        created_at: "2025-01-15T10:00:00Z",
        completed_at: "2025-01-15T10:05:00Z",
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      const options: DownloadOptions = {
        output_directory: "./downloads",
        max_concurrent: 3,
      };

      const result = await service.downloadGallery("https://example.com/gallery", options);

      expect(result).toEqual(mockResult);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/gallery/download",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: "https://example.com/gallery",
            options,
          }),
        })
      );
    });

    it("should handle download errors gracefully", async () => {
      const mockError = {
        success: false,
        error: "Invalid URL provided",
        download_id: null,
        url: "invalid-url",
        extractor: null,
        files: [],
        total_files: 0,
        downloaded_files: 0,
        total_bytes: 0,
        downloaded_bytes: 0,
        status: "failed",
        created_at: "2025-01-15T10:00:00Z",
        completed_at: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      await expect(service.downloadGallery("invalid-url", {})).rejects.toThrow("Invalid URL provided");
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(service.downloadGallery("https://example.com/gallery", {})).rejects.toThrow("Network error");
    });

    it("should handle timeout errors", async () => {
      mockFetch.mockImplementationOnce(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 100))
      );

      await expect(service.downloadGallery("https://example.com/gallery", {})).rejects.toThrow("Timeout");
    });
  });

  describe("validateUrl", () => {
    it("should validate URL successfully", async () => {
      const mockValidation: ValidationResult = {
        valid: true,
        url: "https://example.com/gallery",
        extractor: "test-extractor",
        extractor_info: {
          name: "test-extractor",
          category: "test",
          subcategory: "gallery",
          pattern: "example\\.com/gallery",
          description: "Test extractor for example.com",
        },
        estimated_files: 5,
        estimated_size: 10240000,
        requires_auth: false,
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidation,
      });

      const result = await service.validateUrl("https://example.com/gallery");

      expect(result).toEqual(mockValidation);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/gallery/validate",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: "https://example.com/gallery" }),
        })
      );
    });

    it("should handle invalid URLs", async () => {
      const mockValidation: ValidationResult = {
        valid: false,
        url: "invalid-url",
        extractor: null,
        extractor_info: null,
        estimated_files: 0,
        estimated_size: 0,
        requires_auth: false,
        error: "No extractor found for URL",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidation,
      });

      const result = await service.validateUrl("invalid-url");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("No extractor found for URL");
    });
  });

  describe("getExtractors", () => {
    it("should get available extractors", async () => {
      const mockExtractors: ExtractorInfo[] = [
        {
          name: "test-extractor",
          category: "test",
          subcategory: "gallery",
          pattern: "example\\.com/gallery",
          description: "Test extractor for example.com",
          config: {
            enabled: true,
            options: {},
          },
        },
        {
          name: "another-extractor",
          category: "test",
          subcategory: "image",
          pattern: "example\\.com/image",
          description: "Another test extractor",
          config: {
            enabled: true,
            options: {},
          },
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockExtractors,
      });

      const result = await service.getExtractors();

      expect(result).toEqual(mockExtractors);
      expect(mockFetch).toHaveBeenCalledWith("/api/gallery/extractors");
    });

    it("should handle extractor fetch errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal server error" }),
      });

      await expect(service.getExtractors()).rejects.toThrow("Internal server error");
    });
  });

  describe("getDownloadHistory", () => {
    it("should get download history", async () => {
      const mockHistory = [
        {
          download_id: "download-1",
          url: "https://example.com/gallery1",
          status: "completed",
          created_at: "2025-01-15T10:00:00Z",
          completed_at: "2025-01-15T10:05:00Z",
          total_files: 5,
          downloaded_files: 5,
        },
        {
          download_id: "download-2",
          url: "https://example.com/gallery2",
          status: "failed",
          created_at: "2025-01-15T11:00:00Z",
          completed_at: null,
          total_files: 3,
          downloaded_files: 1,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHistory,
      });

      const result = await service.getDownloadHistory();

      expect(result).toEqual(mockHistory);
      expect(mockFetch).toHaveBeenCalledWith("/api/gallery/history");
    });
  });

  describe("cancelDownload", () => {
    it("should cancel download successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "Download cancelled" }),
      });

      const result = await service.cancelDownload("test-download-123");

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/gallery/download/test-download-123/cancel",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("should handle cancel errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Download not found" }),
      });

      await expect(service.cancelDownload("non-existent-download")).rejects.toThrow("Download not found");
    });
  });

  describe("getDownloadProgress", () => {
    it("should get download progress", async () => {
      const mockProgress = {
        download_id: "test-download-123",
        url: "https://example.com/gallery",
        status: "downloading",
        percentage: 45,
        current_file: "image3.jpg",
        total_files: 10,
        downloaded_files: 4,
        total_bytes: 10240000,
        downloaded_bytes: 4608000,
        speed: 1024000,
        estimated_time: 5,
        message: "Downloading image3.jpg...",
        error: null,
        timestamp: "2025-01-15T10:02:30Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProgress,
      });

      const result = await service.getDownloadProgress("test-download-123");

      expect(result).toEqual(mockProgress);
      expect(mockFetch).toHaveBeenCalledWith("/api/gallery/download/test-download-123/progress");
    });
  });

  describe("batch download methods", () => {
    it("should create batch download", async () => {
      const mockBatch = {
        batch_id: "batch-123",
        name: "Test Batch",
        total_items: 3,
        completed_items: 0,
        failed_items: 0,
        status: "pending",
        created_at: "2025-01-15T10:00:00Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBatch,
      });

      const request = {
        urls: ["https://example.com/gallery1", "https://example.com/gallery2", "https://example.com/gallery3"],
        name: "Test Batch",
        priority: "normal",
        options: { max_concurrent: 2 },
        settings: {},
      };

      const result = await service.createBatchDownload(request);

      expect(result).toEqual(mockBatch);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/gallery/batch",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(request),
        })
      );
    });

    it("should get batch downloads", async () => {
      const mockBatches = [
        {
          batch_id: "batch-1",
          name: "Batch 1",
          total_items: 5,
          completed_items: 3,
          failed_items: 1,
          status: "downloading",
          created_at: "2025-01-15T10:00:00Z",
        },
        {
          batch_id: "batch-2",
          name: "Batch 2",
          total_items: 3,
          completed_items: 3,
          failed_items: 0,
          status: "completed",
          created_at: "2025-01-15T09:00:00Z",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBatches,
      });

      const result = await service.getBatchDownloads();

      expect(result).toEqual(mockBatches);
      expect(mockFetch).toHaveBeenCalledWith("/api/gallery/batch");
    });

    it("should cancel batch download", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "Batch cancelled" }),
      });

      const result = await service.cancelBatchDownload("batch-123");

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/gallery/batch/batch-123/cancel",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("should retry batch download", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "Batch retry initiated" }),
      });

      const result = await service.retryBatchDownload("batch-123");

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/gallery/batch/batch-123/retry",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("AI metadata methods", () => {
    it("should start metadata extraction", async () => {
      const mockJob = {
        id: "job-123",
        download_id: "download-123",
        status: "pending",
        progress: 0,
        created_at: "2025-01-15T10:00:00Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockJob,
      });

      const request = {
        download_id: "download-123",
        content_type: "image" as const,
        extract_tags: true,
        extract_captions: true,
        extract_objects: true,
        extract_text: false,
        extract_colors: true,
        extract_emotions: false,
        custom_prompts: ["Analyze the artistic style"],
      };

      const result = await service.startMetadataExtraction(request);

      expect(result).toEqual(mockJob);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/gallery/metadata/extract",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(request),
        })
      );
    });

    it("should get metadata extraction jobs", async () => {
      const mockJobs = [
        {
          id: "job-1",
          download_id: "download-1",
          status: "completed",
          progress: 100,
          created_at: "2025-01-15T10:00:00Z",
          completed_at: "2025-01-15T10:05:00Z",
        },
        {
          id: "job-2",
          download_id: "download-2",
          status: "processing",
          progress: 45,
          created_at: "2025-01-15T11:00:00Z",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockJobs,
      });

      const result = await service.getMetadataExtractionJobs();

      expect(result).toEqual(mockJobs);
      expect(mockFetch).toHaveBeenCalledWith("/api/gallery/metadata/jobs");
    });

    it("should get metadata results", async () => {
      const mockResults = [
        {
          download_id: "download-1",
          tags: ["nature", "landscape", "mountain"],
          captions: ["A beautiful mountain landscape"],
          objects: [
            { label: "mountain", confidence: 0.95 },
            { label: "sky", confidence: 0.88 },
          ],
          text_content: "",
          dominant_colors: ["#4A90E2", "#87CEEB", "#98FB98"],
          emotions: [],
          processing_time: 2.5,
          created_at: "2025-01-15T10:05:00Z",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      const result = await service.getMetadataResults();

      expect(result).toEqual(mockResults);
      expect(mockFetch).toHaveBeenCalledWith("/api/gallery/metadata/results");
    });

    it("should export metadata results", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, export_path: "/exports/metadata-123.json" }),
      });

      const result = await service.exportMetadataResults("download-123");

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/gallery/metadata/export/download-123",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });
});
