/**
 * Performance Timer Utilities
 *
 * High-precision timing utilities for measuring execution time.
 *
 * @module algorithms/performance/timer
 */
/**
 * High-precision performance timer
 */
export declare class PerformanceTimer {
    private startTime;
    private endTime;
    private isRunning;
    start(): void;
    stop(): number;
    getElapsed(): number;
    reset(): void;
}
