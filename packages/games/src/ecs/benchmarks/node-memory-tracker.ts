/**
 * @fileoverview Node.js Memory Tracker for ECS Benchmarks
 *
 * This module provides comprehensive memory tracking for Node.js environments,
 * using process.memoryUsage() and performance hooks for accurate monitoring.
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { performance } from "perf_hooks";

/**
 * Memory usage statistics from Node.js process.
 */
export interface NodeMemoryUsage {
  rss: number; // Resident Set Size
  heapTotal: number; // Total heap size
  heapUsed: number; // Used heap size
  external: number; // External memory
  arrayBuffers: number; // ArrayBuffer memory
}

/**
 * Memory tracking statistics.
 */
export interface MemoryStats {
  initialMemory: NodeMemoryUsage;
  currentMemory: NodeMemoryUsage;
  peakMemory: NodeMemoryUsage;
  memoryDelta: NodeMemoryUsage;
  memoryDeltaMB: NodeMemoryUsage;
  trackingTimeMs: number;
  sampleCount: number;
}

/**
 * Configuration for memory tracking.
 */
export interface MemoryTrackerConfig {
  enableDetailedLogging: boolean;
  sampleInterval: number;
  trackGarbageCollection: boolean;
  trackExternalMemory: boolean;
}

/**
 * Default configuration for memory tracking.
 */
const DEFAULT_CONFIG: MemoryTrackerConfig = {
  enableDetailedLogging: false,
  sampleInterval: 100, // Sample every 100ms
  trackGarbageCollection: true,
  trackExternalMemory: true,
};

/**
 * Node.js memory tracker with comprehensive monitoring capabilities.
 */
export class NodeMemoryTracker {
  private config: MemoryTrackerConfig;
  private startTime: number = 0;
  private initialMemory: NodeMemoryUsage | null = null;
  private currentMemory: NodeMemoryUsage | null = null;
  private peakMemory: NodeMemoryUsage | null = null;
  private sampleCount: number = 0;
  private gcStats: any[] = [];
  private isTracking: boolean = false;

  constructor(config: Partial<MemoryTrackerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Starts memory tracking.
   */
  start(): void {
    this.startTime = performance.now();
    this.initialMemory = this.getCurrentMemoryUsage();
    this.currentMemory = { ...this.initialMemory };
    this.peakMemory = { ...this.initialMemory };
    this.sampleCount = 0;
    this.gcStats = [];
    this.isTracking = true;

    if (this.config.enableDetailedLogging) {
      console.log("🔍 Memory tracking started");
      console.log(
        `   Initial RSS: ${this.formatBytes(this.initialMemory.rss)}`,
      );
      console.log(
        `   Initial Heap: ${this.formatBytes(this.initialMemory.heapUsed)}/${this.formatBytes(this.initialMemory.heapTotal)}`,
      );
    }
  }

  /**
   * Updates memory tracking with current usage.
   */
  update(): void {
    if (!this.isTracking) return;

    this.currentMemory = this.getCurrentMemoryUsage();
    this.sampleCount++;

    // Update peak memory
    if (this.currentMemory.heapUsed > this.peakMemory!.heapUsed) {
      this.peakMemory = { ...this.currentMemory };
    }

    // Track garbage collection if enabled
    if (this.config.trackGarbageCollection) {
      this.trackGarbageCollection();
    }

    if (this.config.enableDetailedLogging && this.sampleCount % 10 === 0) {
      this.logMemoryUpdate();
    }
  }

  /**
   * Stops memory tracking and returns final statistics.
   */
  stop(): MemoryStats {
    if (
      !this.isTracking ||
      !this.initialMemory ||
      !this.currentMemory ||
      !this.peakMemory
    ) {
      throw new Error("Memory tracking not started");
    }

    this.isTracking = false;
    const endTime = performance.now();
    const trackingTimeMs = endTime - this.startTime;

    const memoryDelta: NodeMemoryUsage = {
      rss: this.currentMemory.rss - this.initialMemory.rss,
      heapTotal: this.currentMemory.heapTotal - this.initialMemory.heapTotal,
      heapUsed: this.currentMemory.heapUsed - this.initialMemory.heapUsed,
      external: this.currentMemory.external - this.initialMemory.external,
      arrayBuffers:
        this.currentMemory.arrayBuffers - this.initialMemory.arrayBuffers,
    };

    const memoryDeltaMB: NodeMemoryUsage = {
      rss: memoryDelta.rss / (1024 * 1024),
      heapTotal: memoryDelta.heapTotal / (1024 * 1024),
      heapUsed: memoryDelta.heapUsed / (1024 * 1024),
      external: memoryDelta.external / (1024 * 1024),
      arrayBuffers: memoryDelta.arrayBuffers / (1024 * 1024),
    };

    const stats: MemoryStats = {
      initialMemory: this.initialMemory,
      currentMemory: this.currentMemory,
      peakMemory: this.peakMemory,
      memoryDelta,
      memoryDeltaMB,
      trackingTimeMs,
      sampleCount: this.sampleCount,
    };

    if (this.config.enableDetailedLogging) {
      this.logFinalStats(stats);
    }

    return stats;
  }

  /**
   * Gets current memory usage from Node.js process.
   */
  private getCurrentMemoryUsage(): NodeMemoryUsage {
    const usage = process.memoryUsage();
    return {
      rss: usage.rss,
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external,
      arrayBuffers: usage.arrayBuffers,
    };
  }

  /**
   * Tracks garbage collection events.
   */
  private trackGarbageCollection(): void {
    // Note: GC tracking requires --expose-gc flag and manual GC calls
    // This is a simplified version for demonstration
    if (typeof global.gc === "function") {
      const beforeGC = this.getCurrentMemoryUsage();
      global.gc();
      const afterGC = this.getCurrentMemoryUsage();

      this.gcStats.push({
        timestamp: performance.now(),
        before: beforeGC,
        after: afterGC,
        freed: beforeGC.heapUsed - afterGC.heapUsed,
      });
    }
  }

  /**
   * Logs memory update information.
   */
  private logMemoryUpdate(): void {
    if (!this.currentMemory || !this.initialMemory) return;

    const delta = this.currentMemory.heapUsed - this.initialMemory.heapUsed;
    const deltaMB = delta / (1024 * 1024);

    console.log(`📊 Memory Update #${this.sampleCount}:`);
    console.log(
      `   Heap Delta: ${deltaMB > 0 ? "+" : ""}${deltaMB.toFixed(2)} MB`,
    );
    console.log(
      `   Current Heap: ${this.formatBytes(this.currentMemory.heapUsed)}`,
    );
  }

  /**
   * Logs final memory statistics.
   */
  private logFinalStats(stats: MemoryStats): void {
    console.log("\n📊 Final Memory Statistics:");
    console.log("=".repeat(50));
    console.log(`Tracking Time: ${stats.trackingTimeMs.toFixed(2)}ms`);
    console.log(`Samples Taken: ${stats.sampleCount}`);
    console.log("");

    console.log("Memory Delta:");
    console.log(
      `  RSS: ${stats.memoryDeltaMB.rss > 0 ? "+" : ""}${stats.memoryDeltaMB.rss.toFixed(2)} MB`,
    );
    console.log(
      `  Heap Used: ${stats.memoryDeltaMB.heapUsed > 0 ? "+" : ""}${stats.memoryDeltaMB.heapUsed.toFixed(2)} MB`,
    );
    console.log(
      `  Heap Total: ${stats.memoryDeltaMB.heapTotal > 0 ? "+" : ""}${stats.memoryDeltaMB.heapTotal.toFixed(2)} MB`,
    );
    console.log(
      `  External: ${stats.memoryDeltaMB.external > 0 ? "+" : ""}${stats.memoryDeltaMB.external.toFixed(2)} MB`,
    );
    console.log("");

    console.log("Peak Memory:");
    console.log(`  RSS: ${this.formatBytes(stats.peakMemory.rss)}`);
    console.log(`  Heap Used: ${this.formatBytes(stats.peakMemory.heapUsed)}`);
    console.log(
      `  Heap Total: ${this.formatBytes(stats.peakMemory.heapTotal)}`,
    );

    if (this.gcStats.length > 0) {
      console.log(`\nGarbage Collection Events: ${this.gcStats.length}`);
      const totalFreed = this.gcStats.reduce((sum, gc) => sum + gc.freed, 0);
      console.log(`Total Memory Freed: ${this.formatBytes(totalFreed)}`);
    }
  }

  /**
   * Formats bytes into human-readable format.
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Gets current memory usage in MB.
   */
  getMemoryUsageMB(): number {
    if (!this.currentMemory || !this.initialMemory) return 0;
    const usage =
      (this.currentMemory.heapUsed - this.initialMemory.heapUsed) /
      (1024 * 1024);
    // Ensure we never return negative values (garbage collection can cause this)
    return Math.max(0, usage);
  }

  /**
   * Gets peak memory usage in MB.
   */
  getPeakMemoryUsageMB(): number {
    if (!this.peakMemory || !this.initialMemory) return 0;
    const usage =
      (this.peakMemory.heapUsed - this.initialMemory.heapUsed) / (1024 * 1024);
    // Ensure we never return negative values
    return Math.max(0, usage);
  }

  /**
   * Checks if memory tracking is available.
   */
  isMemoryTrackingAvailable(): boolean {
    return true; // Node.js always has process.memoryUsage()
  }

  /**
   * Forces garbage collection (requires --expose-gc flag).
   */
  forceGarbageCollection(): void {
    if (typeof global.gc === "function") {
      global.gc();
      if (this.config.enableDetailedLogging) {
        console.log("🗑️  Forced garbage collection");
      }
    } else {
      console.warn(
        "⚠️  Garbage collection not available (use --expose-gc flag)",
      );
    }
  }

  /**
   * Gets garbage collection statistics.
   */
  getGCStats(): any[] {
    return [...this.gcStats];
  }
}

/**
 * Creates a new Node.js memory tracker.
 */
export function createNodeMemoryTracker(
  config?: Partial<MemoryTrackerConfig>,
): NodeMemoryTracker {
  return new NodeMemoryTracker(config);
}

/**
 * Utility function to get current memory usage.
 */
export function getCurrentMemoryUsage(): NodeMemoryUsage {
  const usage = process.memoryUsage();
  return {
    rss: usage.rss,
    heapTotal: usage.heapTotal,
    heapUsed: usage.heapUsed,
    external: usage.external,
    arrayBuffers: usage.arrayBuffers,
  };
}

/**
 * Utility function to format memory usage for logging.
 */
export function formatMemoryUsage(usage: NodeMemoryUsage): string {
  return (
    `RSS: ${(usage.rss / 1024 / 1024).toFixed(2)}MB, ` +
    `Heap: ${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB/${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB, ` +
    `External: ${(usage.external / 1024 / 1024).toFixed(2)}MB`
  );
}
