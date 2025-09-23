import { performance } from "perf_hooks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GalleryService } from "../services/GalleryService";

// Mock fetch for performance testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Gallery-dl Performance Tests", () => {
  let service: GalleryService;

  beforeEach(() => {
    service = new GalleryService({
      name: "test-gallery-service",
      baseUrl: "http://localhost:8000",
      timeout: 30000,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Concurrent Downloads", () => {
    it("should handle concurrent downloads efficiently", async () => {
      const mockResult = {
        success: true,
        download_id: "test-download",
        url: "https://example.com/gallery",
        extractor: "test-extractor",
        files: [],
        total_files: 5,
        downloaded_files: 5,
        total_bytes: 10240000,
        downloaded_bytes: 10240000,
        status: "completed",
        created_at: "2025-01-15T10:00:00Z",
        completed_at: "2025-01-15T10:05:00Z",
        error: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      });

      const startTime = performance.now();

      // Create 10 concurrent downloads
      const promises = Array.from({ length: 10 }, (_, i) =>
        service.downloadGallery(`https://example.com/gallery/${i}`, {
          output_directory: "./downloads",
          max_concurrent: 3,
        })
      );

      const results = await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // All downloads should complete successfully
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.status).toBe("completed");
      });

      // Should complete within reasonable time (60 seconds)
      expect(totalTime).toBeLessThan(60000);

      // Should make 10 API calls
      expect(mockFetch).toHaveBeenCalledTimes(10);
    }, 60000);

    it("should handle large batch downloads efficiently", async () => {
      const mockResult = {
        success: true,
        download_id: "test-download",
        url: "https://example.com/gallery",
        extractor: "test-extractor",
        files: [],
        total_files: 100,
        downloaded_files: 100,
        total_bytes: 104857600, // 100 MB
        downloaded_bytes: 104857600,
        status: "completed",
        created_at: "2025-01-15T10:00:00Z",
        completed_at: "2025-01-15T10:10:00Z",
        error: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      });

      const startTime = performance.now();

      // Create 50 concurrent downloads (large batch)
      const promises = Array.from({ length: 50 }, (_, i) =>
        service.downloadGallery(`https://example.com/gallery/${i}`, {
          output_directory: "./downloads",
          max_concurrent: 5,
        })
      );

      const results = await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // All downloads should complete successfully
      expect(results).toHaveLength(50);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.status).toBe("completed");
      });

      // Should complete within reasonable time (120 seconds)
      expect(totalTime).toBeLessThan(120000);

      // Should make 50 API calls
      expect(mockFetch).toHaveBeenCalledTimes(50);
    }, 120000);
  });

  describe("Memory Usage", () => {
    it("should not leak memory during multiple downloads", async () => {
      const mockResult = {
        success: true,
        download_id: "test-download",
        url: "https://example.com/gallery",
        extractor: "test-extractor",
        files: [],
        total_files: 5,
        downloaded_files: 5,
        total_bytes: 10240000,
        downloaded_bytes: 10240000,
        status: "completed",
        created_at: "2025-01-15T10:00:00Z",
        completed_at: "2025-01-15T10:05:00Z",
        error: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      });

      // Get initial memory usage
      const initialMemory = process.memoryUsage();

      // Perform 100 downloads
      for (let i = 0; i < 100; i++) {
        await service.downloadGallery(`https://example.com/gallery/${i}`, {
          output_directory: "./downloads",
        });
      }

      // Get final memory usage
      const finalMemory = process.memoryUsage();

      // Memory usage should not increase significantly
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      // Should not increase by more than 50MB
      expect(memoryIncreaseMB).toBeLessThan(50);
    });

    it("should handle large file metadata efficiently", async () => {
      const mockResult = {
        success: true,
        download_id: "test-download",
        url: "https://example.com/gallery",
        extractor: "test-extractor",
        files: Array.from({ length: 1000 }, (_, i) => ({
          id: `file-${i}`,
          url: `https://example.com/image${i}.jpg`,
          filename: `image${i}.jpg`,
          size: 1024000,
          status: "downloaded",
          path: `/downloads/image${i}.jpg`,
        })),
        total_files: 1000,
        downloaded_files: 1000,
        total_bytes: 1024000000, // 1 GB
        downloaded_bytes: 1024000000,
        status: "completed",
        created_at: "2025-01-15T10:00:00Z",
        completed_at: "2025-01-15T10:30:00Z",
        error: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      });

      const startTime = performance.now();

      const result = await service.downloadGallery("https://example.com/large-gallery", {
        output_directory: "./downloads",
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(5000);

      // Should handle large file list efficiently
      expect(result.files).toHaveLength(1000);
      expect(result.total_files).toBe(1000);
      expect(result.total_bytes).toBe(1024000000);
    });
  });

  describe("Response Time", () => {
    it("should respond to API calls within acceptable time", async () => {
      const mockResult = {
        success: true,
        download_id: "test-download",
        url: "https://example.com/gallery",
        extractor: "test-extractor",
        files: [],
        total_files: 5,
        downloaded_files: 5,
        total_bytes: 10240000,
        downloaded_bytes: 10240000,
        status: "completed",
        created_at: "2025-01-15T10:00:00Z",
        completed_at: "2025-01-15T10:05:00Z",
        error: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      });

      const startTime = performance.now();

      await service.downloadGallery("https://example.com/gallery", {
        output_directory: "./downloads",
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Should respond within 1 second
      expect(responseTime).toBeLessThan(1000);
    });

    it("should handle URL validation quickly", async () => {
      const mockValidation = {
        valid: true,
        url: "https://example.com/gallery",
        extractor: "test-extractor",
        extractor_info: {
          name: "test-extractor",
          category: "test",
          subcategory: "gallery",
          pattern: "example\\.com/gallery",
          description: "Test extractor",
        },
        estimated_files: 5,
        estimated_size: 10240000,
        requires_auth: false,
        error: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockValidation,
      });

      const startTime = performance.now();

      await service.validateUrl("https://example.com/gallery");

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Should validate within 500ms
      expect(responseTime).toBeLessThan(500);
    });

    it("should handle extractor listing efficiently", async () => {
      const mockExtractors = Array.from({ length: 100 }, (_, i) => ({
        name: `extractor-${i}`,
        category: "test",
        subcategory: "gallery",
        pattern: `example${i}\\.com/gallery`,
        description: `Test extractor ${i}`,
        config: {
          enabled: true,
          options: {},
        },
      }));

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockExtractors,
      });

      const startTime = performance.now();

      const extractors = await service.getExtractors();

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Should handle large extractor list within 1 second
      expect(responseTime).toBeLessThan(1000);
      expect(extractors).toHaveLength(100);
    });
  });

  describe("Error Handling Performance", () => {
    it("should handle errors quickly", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const startTime = performance.now();

      try {
        await service.downloadGallery("https://example.com/gallery", {
          output_directory: "./downloads",
        });
      } catch (error) {
        // Expected error
      }

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Should handle errors within 500ms
      expect(responseTime).toBeLessThan(500);
    });

    it("should handle timeout errors efficiently", async () => {
      mockFetch.mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 100))
      );

      const startTime = performance.now();

      try {
        await service.downloadGallery("https://example.com/gallery", {
          output_directory: "./downloads",
        });
      } catch (error) {
        // Expected timeout error
      }

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Should handle timeout within 200ms (100ms timeout + processing time)
      expect(responseTime).toBeLessThan(200);
    });
  });

  describe("Batch Processing Performance", () => {
    it("should handle batch operations efficiently", async () => {
      const mockBatch = {
        batch_id: "batch-123",
        name: "Test Batch",
        total_items: 50,
        completed_items: 0,
        failed_items: 0,
        status: "pending",
        created_at: "2025-01-15T10:00:00Z",
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBatch,
      });

      const startTime = performance.now();

      // Create batch with 50 URLs
      const urls = Array.from({ length: 50 }, (_, i) => `https://example.com/gallery/${i}`);
      const request = {
        urls,
        name: "Test Batch",
        priority: "normal",
        options: { max_concurrent: 5 },
        settings: {},
      };

      const batch = await service.createBatchDownload(request);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Should create batch within 1 second
      expect(responseTime).toBeLessThan(1000);
      expect(batch.batch_id).toBe("batch-123");
      expect(batch.total_items).toBe(50);
    });

    it("should handle batch status updates efficiently", async () => {
      const mockBatches = Array.from({ length: 100 }, (_, i) => ({
        batch_id: `batch-${i}`,
        name: `Batch ${i}`,
        total_items: 10,
        completed_items: Math.floor(Math.random() * 10),
        failed_items: Math.floor(Math.random() * 3),
        status: "downloading",
        created_at: "2025-01-15T10:00:00Z",
      }));

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBatches,
      });

      const startTime = performance.now();

      const batches = await service.getBatchDownloads();

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Should handle large batch list within 1 second
      expect(responseTime).toBeLessThan(1000);
      expect(batches).toHaveLength(100);
    });
  });

  describe("WebSocket Performance", () => {
    it("should handle WebSocket connections efficiently", async () => {
      // Mock WebSocket
      const mockWebSocket = {
        readyState: 1, // OPEN
        send: vi.fn(),
        close: vi.fn(),
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null,
      };

      global.WebSocket = vi.fn(() => mockWebSocket) as any;

      const startTime = performance.now();

      // Simulate WebSocket operations
      const ws = new WebSocket("ws://localhost:8000/api/gallerydl/ws");
      ws.send(JSON.stringify({ type: "ping" }));
      ws.close();

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Should handle WebSocket operations within 100ms
      expect(responseTime).toBeLessThan(100);
    });

    it("should handle multiple WebSocket subscriptions efficiently", async () => {
      const mockWebSocket = {
        readyState: 1, // OPEN
        send: vi.fn(),
        close: vi.fn(),
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null,
      };

      global.WebSocket = vi.fn(() => mockWebSocket) as any;

      const startTime = performance.now();

      // Simulate multiple subscriptions
      const ws = new WebSocket("ws://localhost:8000/api/gallerydl/ws");
      for (let i = 0; i < 100; i++) {
        ws.send(JSON.stringify({ type: "subscribe", download_id: `download-${i}` }));
      }
      ws.close();

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Should handle multiple subscriptions within 200ms
      expect(responseTime).toBeLessThan(200);
      expect(mockWebSocket.send).toHaveBeenCalledTimes(100);
    });
  });

  describe("Memory Cleanup", () => {
    it("should clean up resources after downloads", async () => {
      const mockResult = {
        success: true,
        download_id: "test-download",
        url: "https://example.com/gallery",
        extractor: "test-extractor",
        files: [],
        total_files: 5,
        downloaded_files: 5,
        total_bytes: 10240000,
        downloaded_bytes: 10240000,
        status: "completed",
        created_at: "2025-01-15T10:00:00Z",
        completed_at: "2025-01-15T10:05:00Z",
        error: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      });

      // Get initial memory usage
      const initialMemory = process.memoryUsage();

      // Perform downloads
      for (let i = 0; i < 50; i++) {
        await service.downloadGallery(`https://example.com/gallery/${i}`, {
          output_directory: "./downloads",
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Get final memory usage
      const finalMemory = process.memoryUsage();

      // Memory usage should not increase significantly
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      // Should not increase by more than 20MB
      expect(memoryIncreaseMB).toBeLessThan(20);
    });
  });
});
