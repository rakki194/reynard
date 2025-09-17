/**
 * Memory Monitoring Utilities
 *
 * Memory usage monitoring and leak detection utilities.
 *
 * @module algorithms/performance/memory
 */
/**
 * Memory usage monitor
 */
export declare class MemoryMonitor {
    private measurements;
    measure(): number;
    getDelta(): number;
    getAverageUsage(): number;
    clear(): void;
}
/**
 * Memory leak detector
 */
export declare class MemoryLeakDetector {
    private snapshots;
    private objectCount;
    private lastSnapshot;
    takeSnapshot(): void;
    detectLeak(): {
        isLeaking: boolean;
        growthRate: number;
        confidence: number;
    };
    private getMemoryUsage;
    clear(): void;
}
