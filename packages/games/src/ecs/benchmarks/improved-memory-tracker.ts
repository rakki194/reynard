/**
 * @fileoverview Improved Memory Tracker with Garbage Collection Handling
 * 
 * This module provides enhanced memory tracking that properly handles
 * garbage collection events and provides more accurate memory usage statistics.
 * 
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { performance } from "perf_hooks";

/**
 * Enhanced memory usage statistics.
 */
export interface EnhancedMemoryStats {
    initialMemory: number;
    currentMemory: number;
    peakMemory: number;
    memoryDelta: number;
    memoryDeltaMB: number;
    gcEvents: number;
    totalAllocated: number;
    totalFreed: number;
    netAllocation: number;
    trackingTimeMs: number;
    sampleCount: number;
}

/**
 * Configuration for enhanced memory tracking.
 */
export interface EnhancedMemoryConfig {
    enableDetailedLogging: boolean;
    sampleInterval: number;
    trackGarbageCollection: boolean;
    handleNegativeMemory: boolean;
    smoothingFactor: number;
}

/**
 * Default configuration for enhanced memory tracking.
 */
const DEFAULT_ENHANCED_CONFIG: EnhancedMemoryConfig = {
    enableDetailedLogging: false,
    sampleInterval: 100,
    trackGarbageCollection: true,
    handleNegativeMemory: true,
    smoothingFactor: 0.1, // For smoothing memory spikes
};

/**
 * Enhanced memory tracker that properly handles garbage collection.
 */
export class EnhancedMemoryTracker {
    private config: EnhancedMemoryConfig;
    private startTime: number = 0;
    private initialMemory: number = 0;
    private currentMemory: number = 0;
    private peakMemory: number = 0;
    private smoothedMemory: number = 0;
    private sampleCount: number = 0;
    private gcEvents: number = 0;
    private totalAllocated: number = 0;
    private totalFreed: number = 0;
    private lastMemory: number = 0;
    private isTracking: boolean = false;
    private memoryHistory: number[] = [];

    constructor(config: Partial<EnhancedMemoryConfig> = {}) {
        this.config = { ...DEFAULT_ENHANCED_CONFIG, ...config };
    }

    /**
     * Starts enhanced memory tracking.
     */
    start(): void {
        this.startTime = performance.now();
        this.initialMemory = this.getCurrentMemoryUsage();
        this.currentMemory = this.initialMemory;
        this.peakMemory = this.initialMemory;
        this.smoothedMemory = this.initialMemory;
        this.sampleCount = 0;
        this.gcEvents = 0;
        this.totalAllocated = 0;
        this.totalFreed = 0;
        this.lastMemory = this.initialMemory;
        this.memoryHistory = [this.initialMemory];
        this.isTracking = true;

        if (this.config.enableDetailedLogging) {
            console.log("🔍 Enhanced memory tracking started");
            console.log(`   Initial Memory: ${this.formatBytes(this.initialMemory)}`);
        }
    }

    /**
     * Updates memory tracking with enhanced garbage collection handling.
     */
    update(): void {
        if (!this.isTracking) return;

        const previousMemory = this.currentMemory;
        this.currentMemory = this.getCurrentMemoryUsage();
        this.sampleCount++;

        // Detect garbage collection events (significant memory decrease)
        const memoryDelta = this.currentMemory - previousMemory;
        if (memoryDelta < -1024 * 1024) { // More than 1MB decrease
            this.gcEvents++;
            this.totalFreed += Math.abs(memoryDelta);

            if (this.config.enableDetailedLogging) {
                console.log(`🗑️  Garbage collection detected: ${this.formatBytes(Math.abs(memoryDelta))} freed`);
            }
        } else if (memoryDelta > 0) {
            this.totalAllocated += memoryDelta;
        }

        // Update peak memory
        if (this.currentMemory > this.peakMemory) {
            this.peakMemory = this.currentMemory;
        }

        // Apply smoothing to reduce noise
        this.smoothedMemory = this.smoothedMemory * (1 - this.config.smoothingFactor) +
            this.currentMemory * this.config.smoothingFactor;

        // Keep memory history for analysis
        this.memoryHistory.push(this.currentMemory);
        if (this.memoryHistory.length > 100) {
            this.memoryHistory.shift();
        }

        this.lastMemory = this.currentMemory;
    }

    /**
     * Stops memory tracking and returns enhanced statistics.
     */
    stop(): EnhancedMemoryStats {
        if (!this.isTracking) {
            throw new Error("Memory tracking not started");
        }

        this.isTracking = false;
        const endTime = performance.now();
        const trackingTimeMs = endTime - this.startTime;

        const memoryDelta = this.currentMemory - this.initialMemory;
        const memoryDeltaMB = memoryDelta / (1024 * 1024);
        const netAllocation = this.totalAllocated - this.totalFreed;

        const stats: EnhancedMemoryStats = {
            initialMemory: this.initialMemory,
            currentMemory: this.currentMemory,
            peakMemory: this.peakMemory,
            memoryDelta,
            memoryDeltaMB: this.config.handleNegativeMemory ? Math.max(0, memoryDeltaMB) : memoryDeltaMB,
            gcEvents: this.gcEvents,
            totalAllocated: this.totalAllocated,
            totalFreed: this.totalFreed,
            netAllocation,
            trackingTimeMs,
            sampleCount: this.sampleCount,
        };

        if (this.config.enableDetailedLogging) {
            this.logEnhancedStats(stats);
        }

        return stats;
    }

    /**
     * Gets current memory usage in bytes.
     */
    private getCurrentMemoryUsage(): number {
        const usage = process.memoryUsage();
        return usage.heapUsed;
    }

    /**
     * Gets current memory usage in MB (with garbage collection handling).
     */
    getMemoryUsageMB(): number {
        if (!this.isTracking) return 0;

        const usage = (this.currentMemory - this.initialMemory) / (1024 * 1024);
        return this.config.handleNegativeMemory ? Math.max(0, usage) : usage;
    }

    /**
     * Gets peak memory usage in MB.
     */
    getPeakMemoryUsageMB(): number {
        if (!this.isTracking) return 0;

        const usage = (this.peakMemory - this.initialMemory) / (1024 * 1024);
        return this.config.handleNegativeMemory ? Math.max(0, usage) : usage;
    }

    /**
     * Gets smoothed memory usage in MB.
     */
    getSmoothedMemoryUsageMB(): number {
        if (!this.isTracking) return 0;

        const usage = (this.smoothedMemory - this.initialMemory) / (1024 * 1024);
        return this.config.handleNegativeMemory ? Math.max(0, usage) : usage;
    }

    /**
     * Gets memory efficiency metrics.
     */
    getMemoryEfficiency(): {
        allocationRate: number; // MB/s
        gcEfficiency: number; // Percentage of memory freed by GC
        memoryStability: number; // Coefficient of variation
    } {
        if (!this.isTracking || this.sampleCount === 0) {
            return { allocationRate: 0, gcEfficiency: 0, memoryStability: 0 };
        }

        const trackingTimeSeconds = (performance.now() - this.startTime) / 1000;
        const allocationRate = (this.totalAllocated / (1024 * 1024)) / trackingTimeSeconds;

        const gcEfficiency = this.totalAllocated > 0 ?
            (this.totalFreed / this.totalAllocated) * 100 : 0;

        // Calculate memory stability (coefficient of variation)
        const mean = this.memoryHistory.reduce((sum, val) => sum + val, 0) / this.memoryHistory.length;
        const variance = this.memoryHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.memoryHistory.length;
        const stdDev = Math.sqrt(variance);
        const memoryStability = mean > 0 ? (stdDev / mean) * 100 : 0;

        return {
            allocationRate,
            gcEfficiency,
            memoryStability,
        };
    }

    /**
     * Checks if memory tracking is available.
     */
    isMemoryTrackingAvailable(): boolean {
        return true; // Node.js always has process.memoryUsage()
    }

    /**
     * Forces garbage collection if available.
     */
    forceGarbageCollection(): void {
        if (typeof global.gc === 'function') {
            global.gc();
            this.gcEvents++;

            if (this.config.enableDetailedLogging) {
                console.log("🗑️  Forced garbage collection");
            }
        } else {
            console.warn("⚠️  Garbage collection not available (use --expose-gc flag)");
        }
    }

    /**
     * Logs enhanced memory statistics.
     */
    private logEnhancedStats(stats: EnhancedMemoryStats): void {
        console.log("\n📊 Enhanced Memory Statistics:");
        console.log("=".repeat(50));
        console.log(`Tracking Time: ${stats.trackingTimeMs.toFixed(2)}ms`);
        console.log(`Samples Taken: ${stats.sampleCount}`);
        console.log(`GC Events: ${stats.gcEvents}`);
        console.log("");

        console.log("Memory Usage:");
        console.log(`  Initial: ${this.formatBytes(stats.initialMemory)}`);
        console.log(`  Current: ${this.formatBytes(stats.currentMemory)}`);
        console.log(`  Peak: ${this.formatBytes(stats.peakMemory)}`);
        console.log(`  Delta: ${stats.memoryDeltaMB > 0 ? '+' : ''}${stats.memoryDeltaMB.toFixed(2)} MB`);
        console.log("");

        console.log("Allocation Statistics:");
        console.log(`  Total Allocated: ${this.formatBytes(stats.totalAllocated)}`);
        console.log(`  Total Freed: ${this.formatBytes(stats.totalFreed)}`);
        console.log(`  Net Allocation: ${this.formatBytes(stats.netAllocation)}`);

        const efficiency = this.getMemoryEfficiency();
        console.log(`  Allocation Rate: ${efficiency.allocationRate.toFixed(2)} MB/s`);
        console.log(`  GC Efficiency: ${efficiency.gcEfficiency.toFixed(1)}%`);
        console.log(`  Memory Stability: ${efficiency.memoryStability.toFixed(1)}%`);
    }

    /**
     * Formats bytes into human-readable format.
     */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }
}

/**
 * Creates an enhanced memory tracker.
 */
export function createEnhancedMemoryTracker(
    config?: Partial<EnhancedMemoryConfig>
): EnhancedMemoryTracker {
    return new EnhancedMemoryTracker(config);
}

/**
 * Utility function to get current memory usage with garbage collection handling.
 */
export function getCurrentMemoryUsageWithGC(): {
    current: number;
    delta: number;
    deltaMB: number;
    isGC: boolean;
} {
    const usage = process.memoryUsage();
    const current = usage.heapUsed;

    // This is a simplified version - in practice you'd want to track previous values
    return {
        current,
        delta: 0, // Would need previous value to calculate
        deltaMB: 0,
        isGC: false, // Would need previous value to detect GC
    };
}
