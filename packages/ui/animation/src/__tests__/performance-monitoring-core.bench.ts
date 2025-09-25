/**
 * 🦊 Performance Monitoring Core System
 *
 * Core performance monitoring functionality including:
 * - Performance metrics collection
 * - Basic threshold checking
 * - Memory and timing analysis
 *
 * @author Vulpine (Strategic Fox Specialist)
 * @since 1.0.0
 */

import { bench, describe, beforeEach } from "vitest";

// Mock performance monitoring system
const mockPerformanceMonitor = {
  collectMetrics: () => ({
    timestamp: performance.now(),
    memory: {
      used: (performance as any).memory?.usedJSHeapSize || 0,
      total: (performance as any).memory?.totalJSHeapSize || 0,
      limit: (performance as any).memory?.jsHeapSizeLimit || 0,
    },
    timing: {
      domContentLoaded: performance.timing?.domContentLoadedEventEnd - performance.timing?.navigationStart || 0,
      loadComplete: performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0,
      firstPaint: performance.getEntriesByType("paint").find(entry => entry.name === "first-paint")?.startTime || 0,
      firstContentfulPaint:
        performance.getEntriesByType("paint").find(entry => entry.name === "first-contentful-paint")?.startTime || 0,
    },
    animation: {
      frameRate: 60,
      droppedFrames: 0,
      animationDuration: 300,
      animationCount: 0,
    },
  }),

  checkThresholds: (metrics: any) => {
    const alerts: Array<{ type: string; category: string; message: string }> = [];

    // Check memory thresholds
    if (metrics.memory.used > 100 * 1024 * 1024) {
      alerts.push({ type: "critical", category: "memory", message: "Memory usage critical" });
    } else if (metrics.memory.used > 50 * 1024 * 1024) {
      alerts.push({ type: "warning", category: "memory", message: "Memory usage high" });
    }

    // Check timing thresholds
    if (metrics.timing.domContentLoaded > 5000) {
      alerts.push({ type: "critical", category: "timing", message: "DOM content loaded too slow" });
    } else if (metrics.timing.domContentLoaded > 2000) {
      alerts.push({ type: "warning", category: "timing", message: "DOM content loaded slow" });
    }

    // Check animation thresholds
    if (metrics.animation.frameRate < 30) {
      alerts.push({ type: "critical", category: "animation", message: "Frame rate too low" });
    } else if (metrics.animation.frameRate < 45) {
      alerts.push({ type: "warning", category: "animation", message: "Frame rate low" });
    }

    return {
      alerts,
      status:
        alerts.length === 0 ? "healthy" : alerts.some(alert => alert.type === "critical") ? "critical" : "warning",
    };
  },
};

describe("Performance Monitoring Core System", () => {
  let metricsHistory: any[] = [];

  beforeEach(() => {
    // Initialize metrics history with sample data
    metricsHistory = Array.from({ length: 10 }, (_, i) => ({
      timestamp: performance.now() - (10 - i) * 1000,
      memory: {
        used: 30 * 1024 * 1024 + Math.random() * 20 * 1024 * 1024, // 30-50MB
        total: 100 * 1024 * 1024,
        limit: 200 * 1024 * 1024,
      },
      timing: {
        domContentLoaded: 1000 + Math.random() * 1000, // 1-2s
        loadComplete: 2000 + Math.random() * 1000, // 2-3s
        firstPaint: 800 + Math.random() * 400, // 0.8-1.2s
        firstContentfulPaint: 900 + Math.random() * 400, // 0.9-1.3s
      },
      animation: {
        frameRate: 55 + Math.random() * 10, // 55-65fps
        droppedFrames: Math.floor(Math.random() * 5), // 0-4 frames
        animationDuration: 300,
        animationCount: Math.floor(Math.random() * 10), // 0-9 animations
      },
    }));
  });

  describe("Performance Metrics Collection", () => {
    bench("Collect Performance Metrics", () => {
      mockPerformanceMonitor.collectMetrics();
    });

    bench("Collect Metrics with Memory Info", () => {
      const metrics = mockPerformanceMonitor.collectMetrics();

      // Simulate memory pressure
      if (metrics.memory.used > 80 * 1024 * 1024) {
        (metrics.memory as any).pressure = "high";
      } else if (metrics.memory.used > 50 * 1024 * 1024) {
        (metrics.memory as any).pressure = "medium";
      } else {
        (metrics.memory as any).pressure = "low";
      }
    });

    bench("Collect Animation-Specific Metrics", () => {
      const metrics = mockPerformanceMonitor.collectMetrics();

      // Add animation-specific metrics
      (metrics.animation as any).activeAnimations = document.querySelectorAll(
        '[style*="animation"], [style*="transition"]'
      ).length;
      (metrics.animation as any).gpuAccelerated = document.querySelectorAll(".gpu-accelerated").length;
      (metrics.animation as any).willChangeElements = document.querySelectorAll('[style*="will-change"]').length;
      (metrics.animation as any).transformElements = document.querySelectorAll('[style*="transform"]').length;
    });

    bench("Collect Performance Entries", () => {
      const entries = performance.getEntries();
      const animationEntries = entries.filter(
        entry => entry.name.includes("animation") || entry.name.includes("transition") || entry.entryType === "measure"
      );
    });
  });

  describe("Performance Threshold Monitoring", () => {
    bench("Check Performance Thresholds", () => {
      const metrics = mockPerformanceMonitor.collectMetrics();
      mockPerformanceMonitor.checkThresholds(metrics);
    });

    bench("Check Memory Thresholds", () => {
      const metrics = mockPerformanceMonitor.collectMetrics();
      const memoryThresholds = {
        warning: 50 * 1024 * 1024, // 50MB
        critical: 100 * 1024 * 1024, // 100MB
      };

      let status = "healthy";
      if (metrics.memory.used > memoryThresholds.critical) {
        status = "critical";
      } else if (metrics.memory.used > memoryThresholds.warning) {
        status = "warning";
      }
    });

    bench("Check Animation Performance Thresholds", () => {
      const metrics = mockPerformanceMonitor.collectMetrics();
      const animationThresholds = {
        frameRate: { warning: 45, critical: 30 },
        droppedFrames: { warning: 5, critical: 10 },
      };

      const alerts: Array<{ type: string; message: string }> = [];

      if (metrics.animation.frameRate < animationThresholds.frameRate.critical) {
        alerts.push({ type: "critical", message: "Frame rate critically low" });
      } else if (metrics.animation.frameRate < animationThresholds.frameRate.warning) {
        alerts.push({ type: "warning", message: "Frame rate low" });
      }

      if (metrics.animation.droppedFrames > animationThresholds.droppedFrames.critical) {
        alerts.push({ type: "critical", message: "Too many dropped frames" });
      } else if (metrics.animation.droppedFrames > animationThresholds.droppedFrames.warning) {
        alerts.push({ type: "warning", message: "Some dropped frames" });
      }
    });
  });
});
