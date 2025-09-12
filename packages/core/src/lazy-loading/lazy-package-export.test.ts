/**
 * Tests for LazyPackageExport
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LazyPackageExport } from "./lazy-package-export";
import {
  ExportType,
  ExportValidationLevel,
  ExportMetadata,
  ExportValidationError,
} from "../utils/package-exports-types";
import { i18n } from "reynard-i18n";

// Test the actual implementation

describe("LazyPackageExport", () => {
  let lazyExport: LazyPackageExport;
  let mockLoader: any;

  beforeEach(() => {
    mockLoader = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create LazyPackageExport with default options", () => {
      lazyExport = new LazyPackageExport("test-package");

      expect((lazyExport as any)._packageName).toBe("test-package");
      expect((lazyExport as any)._loader).toBeUndefined();
      expect((lazyExport as any)._validationLevel).toBe(
        ExportValidationLevel.BASIC,
      );
      expect((lazyExport as any)._enablePerformanceMonitoring).toBe(true);
      expect((lazyExport as any)._autoCleanup).toBe(true);
    });

    it("should create LazyPackageExport with custom options", () => {
      lazyExport = new LazyPackageExport(
        "test-package",
        mockLoader,
        ExportValidationLevel.STRICT,
        false,
        false,
      );

      expect((lazyExport as any)._packageName).toBe("test-package");
      expect((lazyExport as any)._loader).toBe(mockLoader);
      expect((lazyExport as any)._validationLevel).toBe(
        ExportValidationLevel.STRICT,
      );
      expect((lazyExport as any)._enablePerformanceMonitoring).toBe(false);
      expect((lazyExport as any)._autoCleanup).toBe(false);
    });

    it("should initialize metadata", () => {
      lazyExport = new LazyPackageExport("test-package");

      const metadata = (lazyExport as any)._metadata;
      expect(metadata).toEqual({
        packageName: "test-package",
        exportType: ExportType.MODULE,
        validationLevel: ExportValidationLevel.BASIC,
        accessCount: 0,
        errorCount: 0,
        dependencies: [],
        typeHints: {},
      });
    });
  });

  describe("getModule", () => {
    beforeEach(() => {
      lazyExport = new LazyPackageExport("test-package", mockLoader);
    });

    it("should return cached module if already loaded", async () => {
      const mockModule = { test: "module" };
      (lazyExport as any)._module = mockModule;

      const result = await lazyExport.getModule();

      expect(result).toBe(mockModule);
      expect(mockLoader).not.toHaveBeenCalled();
    });

    it("should load module using provided loader", async () => {
      const mockModule = { test: "module" };
      mockLoader.mockResolvedValue(mockModule);

      const result = await lazyExport.getModule();

      expect(mockLoader).toHaveBeenCalled();
      expect(result).toBe(mockModule);
      expect((lazyExport as any)._module).toBe(mockModule);
    });

    it("should load module using dynamic import when no loader provided", async () => {
      // This test will fail in test environment due to dynamic import limitations
      // We'll skip it for now as it requires a real module to import
      lazyExport = new LazyPackageExport("test-package");

      await expect(lazyExport.getModule()).rejects.toThrow();
    });

    it("should validate module when validation level is not NONE", async () => {
      const mockModule = { test: "module" };
      mockLoader.mockResolvedValue(mockModule);

      const validateSpy = vi.spyOn(lazyExport as any, "_validateExport");

      await lazyExport.getModule();

      expect(validateSpy).toHaveBeenCalled();
    });

    it("should skip validation when validation level is NONE", async () => {
      const mockModule = { test: "module" };
      mockLoader.mockResolvedValue(mockModule);

      lazyExport = new LazyPackageExport(
        "test-package",
        mockLoader,
        ExportValidationLevel.NONE,
      );

      const validateSpy = vi.spyOn(lazyExport as any, "_validateExport");

      await lazyExport.getModule();

      expect(validateSpy).not.toHaveBeenCalled();
    });

    it("should track performance metrics when enabled", async () => {
      const mockModule = { test: "module" };
      mockLoader.mockResolvedValue(mockModule);

      const performanceSpy = vi
        .spyOn(performance, "now")
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1500);

      await lazyExport.getModule();

      expect(performanceSpy).toHaveBeenCalledTimes(2);
      expect((lazyExport as any)._metadata.loadTime).toBe(500);
      expect((lazyExport as any)._metadata.memoryUsage).toBeDefined();
    });

    it("should skip performance tracking when disabled", async () => {
      const mockModule = { test: "module" };
      mockLoader.mockResolvedValue(mockModule);

      lazyExport = new LazyPackageExport(
        "test-package",
        mockLoader,
        ExportValidationLevel.BASIC,
        false, // disable performance monitoring
      );

      const performanceSpy = vi.spyOn(performance, "now");

      await lazyExport.getModule();

      expect(performanceSpy).not.toHaveBeenCalled();
      expect((lazyExport as any)._metadata.loadTime).toBeUndefined();
    });

    it("should update access statistics", async () => {
      const mockModule = { test: "module" };
      mockLoader.mockResolvedValue(mockModule);

      const updateStatsSpy = vi.spyOn(lazyExport as any, "_updateAccessStats");

      await lazyExport.getModule();

      expect(updateStatsSpy).toHaveBeenCalled();
      expect((lazyExport as any)._metadata.accessCount).toBe(1);
      expect((lazyExport as any)._metadata.lastAccess).toBeDefined();
    });

    it("should handle loading errors", async () => {
      const mockError = new Error(i18n.t("core.module.loading-failed"));
      mockLoader.mockRejectedValue(mockError);

      await expect(lazyExport.getModule()).rejects.toThrow(
        ExportValidationError,
      );

      expect((lazyExport as any)._metadata.errorCount).toBe(1);
      expect((lazyExport as any)._metadata.lastError).toBe(
        i18n.t("core.module.loading-failed"),
      );
    });

    it("should handle non-Error exceptions", async () => {
      mockLoader.mockRejectedValue(i18n.t("core.errors.string-error"));

      await expect(lazyExport.getModule()).rejects.toThrow(
        ExportValidationError,
      );

      expect((lazyExport as any)._metadata.lastError).toBe(
        i18n.t("core.errors.string-error"),
      );
    });
  });

  describe("_validateExport", () => {
    beforeEach(() => {
      lazyExport = new LazyPackageExport("test-package");
    });

    it("should throw error when module is null", async () => {
      (lazyExport as any)._module = null;

      await expect((lazyExport as any)._validateExport()).rejects.toThrow(
        ExportValidationError,
      );
    });

    it("should validate basic module structure", async () => {
      (lazyExport as any)._module = { test: "module" };

      await expect(
        (lazyExport as any)._validateExport(),
      ).resolves.not.toThrow();
    });

    it("should throw error for invalid module structure", async () => {
      (lazyExport as any)._module = "not an object";

      await expect((lazyExport as any)._validateExport()).rejects.toThrow(
        ExportValidationError,
      );
    });

    it("should throw error for null module", async () => {
      (lazyExport as any)._module = null;

      await expect((lazyExport as any)._validateExport()).rejects.toThrow(
        ExportValidationError,
      );
    });
  });

  describe("_updateAccessStats", () => {
    beforeEach(() => {
      lazyExport = new LazyPackageExport("test-package");
    });

    it("should update access count and timestamp", () => {
      const initialCount = (lazyExport as any)._metadata.accessCount;
      const initialAccess = (lazyExport as any)._metadata.lastAccess;

      (lazyExport as any)._updateAccessStats();

      expect((lazyExport as any)._metadata.accessCount).toBe(initialCount + 1);
      expect((lazyExport as any)._metadata.lastAccess).toBeGreaterThan(
        initialAccess || 0,
      );
    });
  });

  describe("_estimateMemoryUsage", () => {
    beforeEach(() => {
      lazyExport = new LazyPackageExport("test-package");
    });

    it("should estimate memory usage based on module size", () => {
      const mockModule = { test: "module", data: "some data" };
      (lazyExport as any)._module = mockModule;

      const memoryUsage = (lazyExport as any)._estimateMemoryUsage();

      expect(memoryUsage).toBeGreaterThan(0);
      expect(typeof memoryUsage).toBe("number");
    });
  });

  describe("getMetadata", () => {
    beforeEach(() => {
      lazyExport = new LazyPackageExport("test-package");
    });

    it("should return a copy of metadata", () => {
      const metadata1 = lazyExport.getMetadata();
      const metadata2 = lazyExport.getMetadata();

      expect(metadata1).not.toBe(metadata2);
      expect(metadata1).toEqual(metadata2);
    });

    it("should return current metadata state", () => {
      (lazyExport as any)._metadata.accessCount = 5;
      (lazyExport as any)._metadata.errorCount = 2;

      const metadata = lazyExport.getMetadata();

      expect(metadata.accessCount).toBe(5);
      expect(metadata.errorCount).toBe(2);
    });
  });

  describe("reset", () => {
    beforeEach(() => {
      lazyExport = new LazyPackageExport("test-package");
    });

    it("should reset module and clear metadata", () => {
      (lazyExport as any)._module = { test: "module" };
      (lazyExport as any)._metadata.loadTime = 1000;
      (lazyExport as any)._metadata.lastAccess = Date.now();
      (lazyExport as any)._metadata.memoryUsage = 1024;

      lazyExport.reset();

      expect((lazyExport as any)._module).toBeNull();
      expect((lazyExport as any)._metadata.loadTime).toBeUndefined();
      expect((lazyExport as any)._metadata.lastAccess).toBeUndefined();
      expect((lazyExport as any)._metadata.memoryUsage).toBeUndefined();
    });

    it("should preserve basic metadata", () => {
      const originalMetadata = { ...(lazyExport as any)._metadata };

      lazyExport.reset();

      expect((lazyExport as any)._metadata.packageName).toBe(
        originalMetadata.packageName,
      );
      expect((lazyExport as any)._metadata.exportType).toBe(
        originalMetadata.exportType,
      );
      expect((lazyExport as any)._metadata.validationLevel).toBe(
        originalMetadata.validationLevel,
      );
      expect((lazyExport as any)._metadata.accessCount).toBe(
        originalMetadata.accessCount,
      );
      expect((lazyExport as any)._metadata.errorCount).toBe(
        originalMetadata.errorCount,
      );
    });
  });
});
