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
export class MemoryMonitor {
    constructor() {
        Object.defineProperty(this, "measurements", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    measure() {
        const perf = performance;
        if (perf.memory) {
            const usage = perf.memory.usedJSHeapSize;
            this.measurements.push({ timestamp: Date.now(), usage });
            return usage;
        }
        return 0;
    }
    getDelta() {
        if (this.measurements.length < 2)
            return 0;
        const latest = this.measurements[this.measurements.length - 1];
        const previous = this.measurements[this.measurements.length - 2];
        return latest.usage - previous.usage;
    }
    getAverageUsage() {
        if (this.measurements.length === 0)
            return 0;
        const total = this.measurements.reduce((sum, m) => sum + m.usage, 0);
        return total / this.measurements.length;
    }
    clear() {
        this.measurements = [];
    }
}
/**
 * Memory leak detector
 */
export class MemoryLeakDetector {
    constructor() {
        Object.defineProperty(this, "snapshots", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "objectCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lastSnapshot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    takeSnapshot() {
        const now = Date.now();
        const usage = this.getMemoryUsage();
        this.snapshots.push({
            timestamp: now,
            usage,
            count: this.objectCount,
        });
        // Keep only last 10 snapshots
        if (this.snapshots.length > 10) {
            this.snapshots.shift();
        }
        this.lastSnapshot = now;
    }
    detectLeak() {
        if (this.snapshots.length < 3) {
            return { isLeaking: false, growthRate: 0, confidence: 0 };
        }
        const recent = this.snapshots.slice(-3);
        const growthRates = [];
        for (let i = 1; i < recent.length; i++) {
            const timeDiff = recent[i].timestamp - recent[i - 1].timestamp;
            const usageDiff = recent[i].usage - recent[i - 1].usage;
            const rate = usageDiff / timeDiff;
            growthRates.push(rate);
        }
        const averageGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
        const isLeaking = averageGrowthRate > 1000; // 1KB per second threshold
        // Calculate confidence based on consistency of growth
        const variance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - averageGrowthRate, 2), 0) / growthRates.length;
        const confidence = Math.max(0, 1 - Math.sqrt(variance) / Math.abs(averageGrowthRate));
        return {
            isLeaking,
            growthRate: averageGrowthRate,
            confidence,
        };
    }
    getMemoryUsage() {
        const perf = performance;
        if (perf.memory) {
            return perf.memory.usedJSHeapSize;
        }
        return 0;
    }
    clear() {
        this.snapshots = [];
    }
}
