/**
 * MemoryTrackingPanel Component
 * Comprehensive memory usage tracking and leak detection
 */
import { Component } from "solid-js";
export interface MemoryTrackingPanelProps {
    /** Current memory usage in bytes */
    memoryUsage: number;
    /** Performance history data */
    performanceHistory: Array<{
        timestamp: number;
        memoryUsage: number;
        browserResponsiveness: number;
        frameRate: number;
        selectionDuration?: number;
        itemsPerSecond?: number;
        domUpdateCount?: number;
        styleApplicationCount?: number;
        frameDropCount?: number;
    }>;
    /** Auto-refresh interval in milliseconds */
    refreshInterval?: number;
}
export interface MemoryLeakDetection {
    isLeakDetected: boolean;
    leakSeverity: "low" | "medium" | "high" | "critical";
    leakRate: number;
    estimatedLeakSize: number;
    timeToCritical: number;
    recommendations: string[];
}
export interface MemoryStats {
    currentUsage: number;
    peakUsage: number;
    averageUsage: number;
    usageTrend: "increasing" | "stable" | "decreasing";
    memoryPressure: "low" | "medium" | "high" | "critical";
    gcFrequency: number;
    gcEfficiency: number;
}
export declare const MemoryTrackingPanel: Component<MemoryTrackingPanelProps>;
