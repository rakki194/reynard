/**
 * 🦊 Performance Monitor
 * Advanced performance monitoring and optimization utilities
 */
export class PerformanceMonitor {
    constructor(thresholds = {}) {
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "maxMetrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 120
        }); // 2 seconds at 60fps
        Object.defineProperty(this, "thresholds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isMonitoring", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.thresholds = {
            minFPS: 30,
            maxFrameTime: 33.33, // ~30fps
            maxMemoryUsage: 100 * 1024 * 1024, // 100MB
            stabilityFrames: 60,
            ...thresholds,
        };
    }
    /**
     * Start performance monitoring
     */
    start() {
        this.isMonitoring = true;
        this.metrics = [];
    }
    /**
     * Stop performance monitoring
     */
    stop() {
        this.isMonitoring = false;
    }
    /**
     * Record a frame's performance metrics
     */
    recordFrame(metrics) {
        if (!this.isMonitoring)
            return;
        const fullMetrics = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            renderTime: 0,
            updateTime: 0,
            isStable: false,
            qualityLevel: 1,
            ...metrics,
        };
        this.metrics.push(fullMetrics);
        // Keep only recent metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift();
        }
    }
    /**
     * Get current performance status
     */
    getStatus() {
        if (this.metrics.length === 0) {
            return {
                isHealthy: true,
                issues: [],
                recommendations: [],
                averageFPS: 0,
                stability: 0,
            };
        }
        const recentMetrics = this.metrics.slice(-this.thresholds.stabilityFrames);
        const averageFPS = this.calculateAverageFPS(recentMetrics);
        const averageFrameTime = this.calculateAverageFrameTime(recentMetrics);
        const stability = this.calculateStability(recentMetrics);
        const issues = [];
        const recommendations = [];
        // Check FPS
        if (averageFPS < this.thresholds.minFPS) {
            issues.push(`Low FPS: ${averageFPS.toFixed(1)} (target: ${this.thresholds.minFPS})`);
            recommendations.push("Reduce animation complexity or enable quality scaling");
        }
        // Check frame time
        if (averageFrameTime > this.thresholds.maxFrameTime) {
            issues.push(`High frame time: ${averageFrameTime.toFixed(1)}ms (max: ${this.thresholds.maxFrameTime}ms)`);
            recommendations.push("Optimize rendering or reduce update frequency");
        }
        // Check stability
        if (stability < 0.8) {
            issues.push(`Unstable performance: ${(stability * 100).toFixed(1)}% stability`);
            recommendations.push("Implement frame rate smoothing or adaptive quality");
        }
        return {
            isHealthy: issues.length === 0,
            issues,
            recommendations,
            averageFPS,
            stability,
        };
    }
    /**
     * Get performance trend over time
     */
    getTrend() {
        if (this.metrics.length < 20) {
            return { direction: "stable", change: 0, confidence: 0 };
        }
        const firstHalf = this.metrics.slice(0, Math.floor(this.metrics.length / 2));
        const secondHalf = this.metrics.slice(Math.floor(this.metrics.length / 2));
        const firstAvg = this.calculateAverageFPS(firstHalf);
        const secondAvg = this.calculateAverageFPS(secondHalf);
        const change = ((secondAvg - firstAvg) / firstAvg) * 100;
        const confidence = Math.min(this.metrics.length / 60, 1); // More data = higher confidence
        let direction = "stable";
        if (change > 5)
            direction = "improving";
        else if (change < -5)
            direction = "degrading";
        return { direction, change, confidence };
    }
    /**
     * Calculate optimal quality level based on performance
     */
    calculateOptimalQuality() {
        const status = this.getStatus();
        if (status.isHealthy)
            return 1.0;
        if (status.averageFPS > 45)
            return 0.8;
        if (status.averageFPS > 30)
            return 0.6;
        if (status.averageFPS > 20)
            return 0.4;
        return 0.2;
    }
    calculateAverageFPS(metrics) {
        if (metrics.length === 0)
            return 0;
        return metrics.reduce((sum, m) => sum + m.fps, 0) / metrics.length;
    }
    calculateAverageFrameTime(metrics) {
        if (metrics.length === 0)
            return 0;
        return metrics.reduce((sum, m) => sum + m.frameTime, 0) / metrics.length;
    }
    calculateStability(metrics) {
        if (metrics.length < 2)
            return 1;
        const fpsValues = metrics.map((m) => m.fps);
        const mean = fpsValues.reduce((sum, fps) => sum + fps, 0) / fpsValues.length;
        const variance = fpsValues.reduce((sum, fps) => sum + Math.pow(fps - mean, 2), 0) /
            fpsValues.length;
        const standardDeviation = Math.sqrt(variance);
        // Stability is inverse of coefficient of variation
        return Math.max(0, 1 - standardDeviation / mean);
    }
    /**
     * Get memory usage (if available)
     */
    getMemoryUsage() {
        if ("memory" in performance) {
            const memory = performance.memory;
            return memory.usedJSHeapSize;
        }
        return 0;
    }
    /**
     * Reset all metrics
     */
    reset() {
        this.metrics = [];
    }
}
