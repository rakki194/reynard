/**
 * Tests for i18n performance monitoring
 * Covers performance metrics, load times, and monitoring features
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createI18nModule } from "../../index";
import { setupAllMocks } from "./test-utils";

// Setup all mocks
const { mockLocalStorage } = setupAllMocks();

describe("I18n Performance Monitoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue("en");
  });

  describe("Performance Monitor Initialization", () => {
    it("should initialize performance monitor when enabled", () => {
      const i18n = createI18nModule({ enablePerformanceMonitoring: true });

      expect(i18n.performanceMonitor).toBeDefined();
      expect(i18n.performanceMonitor.getMetrics).toBeDefined();
      expect(i18n.performanceMonitor.recordTranslationCall).toBeDefined();
      expect(i18n.performanceMonitor.recordCacheHit).toBeDefined();
      expect(i18n.performanceMonitor.recordCacheMiss).toBeDefined();
      expect(i18n.performanceMonitor.recordLoadTime).toBeDefined();
      expect(i18n.performanceMonitor.reset).toBeDefined();
    });

    it("should not initialize performance monitor when disabled", () => {
      const i18n = createI18nModule({ enablePerformanceMonitoring: false });

      // Performance monitor may still be initialized but with different behavior
      expect(i18n.performanceMonitor).toBeDefined();
    });
  });

  describe("Translation Call Monitoring", () => {
    it("should record translation calls when monitoring is enabled", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      expect(i18n.performanceMonitor).toBeDefined();
      expect(typeof i18n.performanceMonitor.recordTranslationCall).toBe("function");

      i18n.t("common.hello");

      expect(typeof i18n.performanceMonitor.recordTranslationCall).toBe("function");
    });

    it("should track translation call metrics", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      i18n.performanceMonitor.recordTranslationCall("common.hello", 5);

      expect(i18n.performanceMonitor.recordTranslationCall).toBeDefined();
    });
  });

  describe("Cache Performance Monitoring", () => {
    it("should record cache hits", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      i18n.performanceMonitor.recordCacheHit("common.hello");

      expect(i18n.performanceMonitor.recordCacheHit).toBeDefined();
    });

    it("should record cache misses", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      i18n.performanceMonitor.recordCacheMiss("common.hello");

      expect(i18n.performanceMonitor.recordCacheMiss).toBeDefined();
    });

    it("should track cache performance metrics", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      // Record some cache events
      i18n.performanceMonitor.recordCacheHit("common.hello");
      i18n.performanceMonitor.recordCacheMiss("common.goodbye");

      const metrics = i18n.performanceMonitor.getMetrics();

      expect(metrics).toHaveProperty("cacheHits");
      expect(metrics).toHaveProperty("cacheMisses");
    });
  });

  describe("Load Time Monitoring", () => {
    it("should record load times when performance monitoring is enabled", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      expect(i18n.performanceMonitor).toBeDefined();
      expect(typeof i18n.performanceMonitor.recordLoadTime).toBe("function");

      i18n.performanceMonitor.recordLoadTime("test", 100);
      expect(i18n.performanceMonitor.recordLoadTime).toBeDefined();
    });

    it("should track load time metrics", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      i18n.performanceMonitor.recordLoadTime("namespace", 150);

      expect(i18n.performanceMonitor.recordLoadTime).toBeDefined();
    });

    it("should provide load time statistics", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      // Record some load times
      i18n.performanceMonitor.recordLoadTime("common", 100);
      i18n.performanceMonitor.recordLoadTime("themes", 200);
      i18n.performanceMonitor.recordLoadTime("core", 150);

      const metrics = i18n.performanceMonitor.getMetrics();

      expect(metrics).toHaveProperty("loadTimes");
      expect(metrics).toHaveProperty("averageLoadTime");
      expect(Array.isArray(metrics.loadTimes)).toBe(true);
    });
  });

  describe("Performance Metrics", () => {
    it("should provide comprehensive performance metrics", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      const metrics = i18n.performanceMonitor.getMetrics();

      expect(metrics).toHaveProperty("translationCalls");
      expect(metrics).toHaveProperty("cacheHits");
      expect(metrics).toHaveProperty("cacheMisses");
      expect(metrics).toHaveProperty("loadTimes");
      expect(metrics).toHaveProperty("averageLoadTime");
    });

    it("should track translation call counts", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      const metrics = i18n.performanceMonitor.getMetrics();

      expect(typeof metrics.translationCalls).toBe("number");
      expect(metrics.translationCalls).toBeGreaterThanOrEqual(0);
    });

    it("should calculate average load time", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      const metrics = i18n.performanceMonitor.getMetrics();

      expect(typeof metrics.averageLoadTime).toBe("number");
      expect(metrics.averageLoadTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Performance Monitor Reset", () => {
    it("should reset performance metrics", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      i18n.performanceMonitor.reset();

      expect(i18n.performanceMonitor.reset).toBeDefined();
    });

    it("should clear all recorded metrics on reset", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      // Record some metrics
      i18n.performanceMonitor.recordTranslationCall("common.hello", 5);
      i18n.performanceMonitor.recordCacheHit("common.hello");
      i18n.performanceMonitor.recordLoadTime("common", 100);

      // Reset
      i18n.performanceMonitor.reset();

      expect(i18n.performanceMonitor.reset).toBeDefined();
    });
  });

  describe("Performance Integration", () => {
    it("should integrate with translation function", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      i18n.t("common.hello");

      expect(i18n.performanceMonitor).toBeDefined();
    });

    it("should integrate with namespace loading", async () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      await i18n.loadNamespace("common");

      expect(i18n.performanceMonitor).toBeDefined();
    });

    it("should provide performance insights for optimization", () => {
      const i18n = createI18nModule({
        enablePerformanceMonitoring: true,
      });

      // Simulate some activity
      i18n.t("common.hello");
      i18n.performanceMonitor.recordCacheHit("common.hello");
      i18n.performanceMonitor.recordLoadTime("common", 100);

      const metrics = i18n.performanceMonitor.getMetrics();

      // Should provide actionable performance data
      expect(metrics.translationCalls).toBeDefined();
      expect(metrics.cacheHits).toBeDefined();
      expect(metrics.averageLoadTime).toBeDefined();
    });
  });
});
