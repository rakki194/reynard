export interface PerformanceMetrics {
    operationStartTime: number;
    operationEndTime: number;
    operationDuration: number;
    itemsProcessed: number;
    itemsPerSecond: number;
    domUpdateCount: number;
    domUpdateDuration: number;
    averageDomUpdateTime: number;
    styleApplicationCount: number;
    styleApplicationDuration: number;
    averageStyleApplicationTime: number;
    memoryUsageBefore: number;
    memoryUsageAfter: number;
    memoryDelta: number;
    frameDropCount: number;
    averageFrameTime: number;
    worstFrameTime: number;
    browserFreezeTime: number;
    operationType: string;
    datasetSize: number;
    threshold: number;
    batchSize: number;
    maxBatchTime: number;
}
export interface PerformanceWarning {
    type: "memory" | "css" | "dom" | "rendering" | "freeze";
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    value: number;
    threshold: number;
    timestamp: number;
}
export interface PerformanceDebugger {
    startProfiling: (operationType: string, datasetSize: number) => void;
    endProfiling: () => PerformanceMetrics;
    recordDOMUpdate: (updateType: string, duration: number) => void;
    recordStyleApplication: (elementCount: number, duration: number) => void;
    recordFrameDrop: (frameTime: number) => void;
    metrics: () => PerformanceMetrics | null;
    warnings: () => PerformanceWarning[];
    isMonitoring: () => boolean;
    logPerformanceReport: () => void;
    exportMetrics: () => string;
    clearMetrics: () => void;
    measureMemoryUsage: () => Promise<number>;
    checkBrowserResponsiveness: () => Promise<number>;
    monitorRenderingPerformance: () => void;
    stopRenderingMonitoring: () => void;
}
/**
 * Performance monitoring composable for analyzing application performance
 *
 * @param options Configuration options for performance monitoring
 * @returns Performance debugger with monitoring capabilities
 */
export declare function usePerformanceMonitor(options?: {
    thresholds?: {
        criticalOperationTime?: number;
        highOperationTime?: number;
        criticalDomUpdateTime?: number;
        highDomUpdateTime?: number;
        criticalStyleApplicationTime?: number;
        highStyleApplicationTime?: number;
        criticalFrameTime?: number;
        highFrameTime?: number;
        criticalMemoryUsage?: number;
        highMemoryUsage?: number;
        criticalFreezeTime?: number;
        highFreezeTime?: number;
    };
}): PerformanceDebugger;
