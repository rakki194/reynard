/**
 * Frame Rate Monitoring Utilities
 *
 * Frame rate monitoring and performance tracking utilities.
 *
 * @module algorithms/performance/framerate
 */
import type { FrameRateMetrics } from "./types";
/**
 * Frame rate monitor
 */
export declare class FrameRateMonitor {
    private frameCount;
    private lastTime;
    private frameTimes;
    private droppedFrames;
    private isMonitoring;
    private animationFrameId;
    start(): void;
    stop(): void;
    private monitorFrame;
    getMetrics(): FrameRateMetrics;
}
