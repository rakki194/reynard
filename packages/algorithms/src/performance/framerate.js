/**
 * Frame Rate Monitoring Utilities
 *
 * Frame rate monitoring and performance tracking utilities.
 *
 * @module algorithms/performance/framerate
 */
/**
 * Frame rate monitor
 */
export class FrameRateMonitor {
    constructor() {
        Object.defineProperty(this, "frameCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lastTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: performance.now()
        });
        Object.defineProperty(this, "frameTimes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "droppedFrames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "isMonitoring", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "animationFrameId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    start() {
        if (this.isMonitoring)
            return;
        this.isMonitoring = true;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.frameTimes = [];
        this.droppedFrames = 0;
        this.monitorFrame();
    }
    stop() {
        this.isMonitoring = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    monitorFrame() {
        if (!this.isMonitoring)
            return;
        const currentTime = performance.now();
        const frameTime = currentTime - this.lastTime;
        this.frameTimes.push(frameTime);
        this.frameCount++;
        // Detect dropped frames (assuming 60fps = 16.67ms per frame)
        if (frameTime > 20) {
            this.droppedFrames += Math.floor(frameTime / 16.67) - 1;
        }
        // Keep only last 60 frame times for average calculation
        if (this.frameTimes.length > 60) {
            this.frameTimes.shift();
        }
        this.lastTime = currentTime;
        this.animationFrameId = requestAnimationFrame(() => this.monitorFrame());
    }
    getMetrics() {
        const averageFrameTime = this.frameTimes.length > 0
            ? this.frameTimes.reduce((sum, time) => sum + time, 0) /
                this.frameTimes.length
            : 0;
        const fps = averageFrameTime > 0 ? 1000 / averageFrameTime : 0;
        return {
            fps,
            frameTime: averageFrameTime,
            droppedFrames: this.droppedFrames,
            averageFrameTime,
            timestamp: Date.now(),
        };
    }
}
