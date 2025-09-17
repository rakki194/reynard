/**
 * @fileoverview Improved Memory Tracker with Garbage Collection Handling
 *
 * This module provides enhanced memory tracking that properly handles
 * garbage collection events and provides more accurate memory usage statistics.
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
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
 * Enhanced memory tracker that properly handles garbage collection.
 */
export declare class EnhancedMemoryTracker {
    private config;
    private startTime;
    private initialMemory;
    private currentMemory;
    private peakMemory;
    private smoothedMemory;
    private sampleCount;
    private gcEvents;
    private totalAllocated;
    private totalFreed;
    private lastMemory;
    private isTracking;
    private memoryHistory;
    constructor(config?: Partial<EnhancedMemoryConfig>);
    /**
     * Starts enhanced memory tracking.
     */
    start(): void;
    /**
     * Updates memory tracking with enhanced garbage collection handling.
     */
    update(): void;
    /**
     * Stops memory tracking and returns enhanced statistics.
     */
    stop(): EnhancedMemoryStats;
    /**
     * Gets current memory usage in bytes.
     */
    private getCurrentMemoryUsage;
    /**
     * Gets current memory usage in MB (with garbage collection handling).
     */
    getMemoryUsageMB(): number;
    /**
     * Gets peak memory usage in MB.
     */
    getPeakMemoryUsageMB(): number;
    /**
     * Gets smoothed memory usage in MB.
     */
    getSmoothedMemoryUsageMB(): number;
    /**
     * Gets memory efficiency metrics.
     */
    getMemoryEfficiency(): {
        allocationRate: number;
        gcEfficiency: number;
        memoryStability: number;
    };
    /**
     * Checks if memory tracking is available.
     */
    isMemoryTrackingAvailable(): boolean;
    /**
     * Forces garbage collection if available.
     */
    forceGarbageCollection(): void;
    /**
     * Logs enhanced memory statistics.
     */
    private logEnhancedStats;
    /**
     * Formats bytes into human-readable format.
     */
    private formatBytes;
}
/**
 * Creates an enhanced memory tracker.
 */
export declare function createEnhancedMemoryTracker(config?: Partial<EnhancedMemoryConfig>): EnhancedMemoryTracker;
/**
 * Utility function to get current memory usage with garbage collection handling.
 */
export declare function getCurrentMemoryUsageWithGC(): {
    current: number;
    delta: number;
    deltaMB: number;
    isGC: boolean;
};
