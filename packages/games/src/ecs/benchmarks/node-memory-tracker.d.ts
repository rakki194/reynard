/**
 * @fileoverview Node.js Memory Tracker for ECS Benchmarks
 *
 * This module provides comprehensive memory tracking for Node.js environments,
 * using process.memoryUsage() and performance hooks for accurate monitoring.
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
/**
 * Memory usage statistics from Node.js process.
 */
export interface NodeMemoryUsage {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
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
 * Node.js memory tracker with comprehensive monitoring capabilities.
 */
export declare class NodeMemoryTracker {
    private config;
    private startTime;
    private initialMemory;
    private currentMemory;
    private peakMemory;
    private sampleCount;
    private gcStats;
    private isTracking;
    constructor(config?: Partial<MemoryTrackerConfig>);
    /**
     * Starts memory tracking.
     */
    start(): void;
    /**
     * Updates memory tracking with current usage.
     */
    update(): void;
    /**
     * Stops memory tracking and returns final statistics.
     */
    stop(): MemoryStats;
    /**
     * Gets current memory usage from Node.js process.
     */
    private getCurrentMemoryUsage;
    /**
     * Tracks garbage collection events.
     */
    private trackGarbageCollection;
    /**
     * Logs memory update information.
     */
    private logMemoryUpdate;
    /**
     * Logs final memory statistics.
     */
    private logFinalStats;
    /**
     * Formats bytes into human-readable format.
     */
    private formatBytes;
    /**
     * Gets current memory usage in MB.
     */
    getMemoryUsageMB(): number;
    /**
     * Gets peak memory usage in MB.
     */
    getPeakMemoryUsageMB(): number;
    /**
     * Checks if memory tracking is available.
     */
    isMemoryTrackingAvailable(): boolean;
    /**
     * Forces garbage collection (requires --expose-gc flag).
     */
    forceGarbageCollection(): void;
    /**
     * Gets garbage collection statistics.
     */
    getGCStats(): any[];
}
/**
 * Creates a new Node.js memory tracker.
 */
export declare function createNodeMemoryTracker(config?: Partial<MemoryTrackerConfig>): NodeMemoryTracker;
/**
 * Utility function to get current memory usage.
 */
export declare function getCurrentMemoryUsage(): NodeMemoryUsage;
/**
 * Utility function to format memory usage for logging.
 */
export declare function formatMemoryUsage(usage: NodeMemoryUsage): string;
