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
export class PerformanceTimer {
    constructor() {
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "endTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "isRunning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    start() {
        this.startTime = performance.now();
        this.isRunning = true;
    }
    stop() {
        if (!this.isRunning) {
            throw new Error("Timer is not running");
        }
        this.endTime = performance.now();
        this.isRunning = false;
        return this.endTime - this.startTime;
    }
    getElapsed() {
        if (!this.isRunning) {
            return this.endTime - this.startTime;
        }
        return performance.now() - this.startTime;
    }
    reset() {
        this.startTime = 0;
        this.endTime = 0;
        this.isRunning = false;
    }
}
