import { createSignal, onCleanup } from "solid-js";
/**
 * Performance monitoring composable for analyzing application performance
 *
 * @param options Configuration options for performance monitoring
 * @returns Performance debugger with monitoring capabilities
 */
export function usePerformanceMonitor(options = {}) {
    const { thresholds = {} } = options;
    // Performance thresholds with defaults
    const THRESHOLDS = {
        CRITICAL_OPERATION_TIME: thresholds.criticalOperationTime ?? 2000, // 2 seconds
        HIGH_OPERATION_TIME: thresholds.highOperationTime ?? 1000, // 1 second
        CRITICAL_DOM_UPDATE_TIME: thresholds.criticalDomUpdateTime ?? 100, // 100ms
        HIGH_DOM_UPDATE_TIME: thresholds.highDomUpdateTime ?? 50, // 50ms
        CRITICAL_STYLE_APPLICATION_TIME: thresholds.criticalStyleApplicationTime ?? 50, // 50ms
        HIGH_STYLE_APPLICATION_TIME: thresholds.highStyleApplicationTime ?? 20, // 20ms
        CRITICAL_FRAME_TIME: thresholds.criticalFrameTime ?? 32, // 32ms (30fps)
        HIGH_FRAME_TIME: thresholds.highFrameTime ?? 16, // 16ms (60fps)
        CRITICAL_MEMORY_USAGE: thresholds.criticalMemoryUsage ?? 100 * 1024 * 1024, // 100MB
        HIGH_MEMORY_USAGE: thresholds.highMemoryUsage ?? 50 * 1024 * 1024, // 50MB
        CRITICAL_FREEZE_TIME: thresholds.criticalFreezeTime ?? 500, // 500ms
        HIGH_FREEZE_TIME: thresholds.highFreezeTime ?? 100, // 100ms
    };
    const [currentMetrics, setCurrentMetrics] = createSignal(null);
    const [warnings, setWarnings] = createSignal([]);
    const [isMonitoring, setIsMonitoring] = createSignal(false);
    let profiling = false;
    let renderingObserver = null;
    let frameTimings = [];
    let domUpdateTimings = [];
    let styleApplicationTimings = [];
    let frameDropCount = 0;
    let browserFreezeStartTime = 0;
    let totalBrowserFreezeTime = 0;
    const addWarning = (warning) => {
        setWarnings((prev) => [...prev, warning]);
        console.warn(`[Performance Warning] ${warning.type.toUpperCase()}: ${warning.message}`, {
            value: warning.value,
            threshold: warning.threshold,
            severity: warning.severity,
        });
    };
    const measureMemoryUsage = async () => {
        if ("memory" in performance) {
            const memoryInfo = performance.memory;
            return memoryInfo.usedJSHeapSize;
        }
        // Fallback: estimate memory usage
        try {
            const estimate = await navigator.storage?.estimate?.();
            return estimate?.usage || 0;
        }
        catch {
            return 0;
        }
    };
    const checkBrowserResponsiveness = async () => {
        const start = performance.now();
        await new Promise((resolve) => {
            const measureStart = performance.now();
            setTimeout(() => {
                const delay = performance.now() - measureStart;
                resolve(delay);
            }, 0);
        });
        return performance.now() - start;
    };
    const startProfiling = (operationType, datasetSize) => {
        if (profiling) {
            console.warn("Performance profiling already in progress");
            return;
        }
        profiling = true;
        setIsMonitoring(true);
        // Reset metrics
        frameTimings = [];
        domUpdateTimings = [];
        styleApplicationTimings = [];
        frameDropCount = 0;
        browserFreezeStartTime = performance.now();
        totalBrowserFreezeTime = 0;
        // Start browser responsiveness monitoring
        const monitorFreeze = async () => {
            while (profiling) {
                const freezeTime = await checkBrowserResponsiveness();
                if (freezeTime > THRESHOLDS.HIGH_FREEZE_TIME) {
                    totalBrowserFreezeTime += freezeTime;
                    const severity = freezeTime > THRESHOLDS.CRITICAL_FREEZE_TIME ? "critical" : "high";
                    addWarning({
                        type: "freeze",
                        severity,
                        message: `Browser freeze detected: ${freezeTime.toFixed(2)}ms`,
                        value: freezeTime,
                        threshold: THRESHOLDS.HIGH_FREEZE_TIME,
                        timestamp: performance.now(),
                    });
                }
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        };
        monitorFreeze();
        // Initialize metrics
        const initialMetrics = {
            operationStartTime: performance.now(),
            operationEndTime: 0,
            operationDuration: 0,
            itemsProcessed: 0,
            itemsPerSecond: 0,
            domUpdateCount: 0,
            domUpdateDuration: 0,
            averageDomUpdateTime: 0,
            styleApplicationCount: 0,
            styleApplicationDuration: 0,
            averageStyleApplicationTime: 0,
            memoryUsageBefore: 0,
            memoryUsageAfter: 0,
            memoryDelta: 0,
            frameDropCount: 0,
            averageFrameTime: 0,
            worstFrameTime: 0,
            browserFreezeTime: 0,
            operationType,
            datasetSize,
            threshold: datasetSize > 1000 ? 1000 : 5000,
            batchSize: 500,
            maxBatchTime: 12,
        };
        // Measure initial memory usage
        measureMemoryUsage().then((memory) => {
            setCurrentMetrics((prev) => prev ? { ...prev, memoryUsageBefore: memory } : null);
        });
        setCurrentMetrics(initialMetrics);
        console.log(`[Performance Monitor] Started profiling ${operationType} operation for ${datasetSize} items`);
    };
    const endProfiling = () => {
        if (!profiling) {
            throw new Error("No profiling session in progress");
        }
        profiling = false;
        setIsMonitoring(false);
        const metrics = currentMetrics();
        if (!metrics) {
            throw new Error("No metrics available");
        }
        const endTime = performance.now();
        const duration = endTime - metrics.operationStartTime;
        // Calculate final metrics
        const finalMetrics = {
            ...metrics,
            operationEndTime: endTime,
            operationDuration: duration,
            itemsProcessed: metrics.datasetSize,
            itemsPerSecond: metrics.datasetSize / (duration / 1000),
            domUpdateCount: domUpdateTimings.length,
            domUpdateDuration: domUpdateTimings.reduce((sum, time) => sum + time, 0),
            averageDomUpdateTime: domUpdateTimings.length > 0
                ? domUpdateTimings.reduce((sum, time) => sum + time, 0) /
                    domUpdateTimings.length
                : 0,
            styleApplicationCount: styleApplicationTimings.length,
            styleApplicationDuration: styleApplicationTimings.reduce((sum, time) => sum + time, 0),
            averageStyleApplicationTime: styleApplicationTimings.length > 0
                ? styleApplicationTimings.reduce((sum, time) => sum + time, 0) /
                    styleApplicationTimings.length
                : 0,
            frameDropCount,
            averageFrameTime: frameTimings.length > 0
                ? frameTimings.reduce((sum, time) => sum + time, 0) /
                    frameTimings.length
                : 0,
            worstFrameTime: frameTimings.length > 0 ? Math.max(...frameTimings) : 0,
            browserFreezeTime: totalBrowserFreezeTime,
        };
        // Measure final memory usage
        measureMemoryUsage().then((memory) => {
            const memoryDelta = memory - finalMetrics.memoryUsageBefore;
            const updatedMetrics = {
                ...finalMetrics,
                memoryUsageAfter: memory,
                memoryDelta,
            };
            setCurrentMetrics(updatedMetrics);
            // Check for memory warnings
            if (memoryDelta > THRESHOLDS.HIGH_MEMORY_USAGE) {
                const severity = memoryDelta > THRESHOLDS.CRITICAL_MEMORY_USAGE ? "critical" : "high";
                addWarning({
                    type: "memory",
                    severity,
                    message: `High memory usage: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
                    value: memoryDelta,
                    threshold: THRESHOLDS.HIGH_MEMORY_USAGE,
                    timestamp: performance.now(),
                });
            }
        });
        // Check for performance warnings
        if (duration > THRESHOLDS.HIGH_OPERATION_TIME) {
            const severity = duration > THRESHOLDS.CRITICAL_OPERATION_TIME ? "critical" : "high";
            addWarning({
                type: "dom",
                severity,
                message: `Slow operation: ${duration.toFixed(2)}ms`,
                value: duration,
                threshold: THRESHOLDS.HIGH_OPERATION_TIME,
                timestamp: performance.now(),
            });
        }
        if (finalMetrics.worstFrameTime > THRESHOLDS.HIGH_FRAME_TIME) {
            const severity = finalMetrics.worstFrameTime > THRESHOLDS.CRITICAL_FRAME_TIME
                ? "critical"
                : "high";
            addWarning({
                type: "rendering",
                severity,
                message: `Frame drops detected: worst frame ${finalMetrics.worstFrameTime.toFixed(2)}ms`,
                value: finalMetrics.worstFrameTime,
                threshold: THRESHOLDS.HIGH_FRAME_TIME,
                timestamp: performance.now(),
            });
        }
        setCurrentMetrics(finalMetrics);
        console.log(`[Performance Monitor] Completed profiling ${metrics.operationType} operation`, finalMetrics);
        return finalMetrics;
    };
    const recordDOMUpdate = (updateType, duration) => {
        if (!profiling)
            return;
        domUpdateTimings.push(duration);
        if (duration > THRESHOLDS.HIGH_DOM_UPDATE_TIME) {
            const severity = duration > THRESHOLDS.CRITICAL_DOM_UPDATE_TIME ? "critical" : "high";
            addWarning({
                type: "dom",
                severity,
                message: `Slow DOM update (${updateType}): ${duration.toFixed(2)}ms`,
                value: duration,
                threshold: THRESHOLDS.HIGH_DOM_UPDATE_TIME,
                timestamp: performance.now(),
            });
        }
        console.debug(`[Performance Monitor] DOM update (${updateType}): ${duration.toFixed(2)}ms`);
    };
    const recordStyleApplication = (elementCount, duration) => {
        if (!profiling)
            return;
        styleApplicationTimings.push(duration);
        if (duration > THRESHOLDS.HIGH_STYLE_APPLICATION_TIME) {
            const severity = duration > THRESHOLDS.CRITICAL_STYLE_APPLICATION_TIME
                ? "critical"
                : "high";
            addWarning({
                type: "css",
                severity,
                message: `Slow style application (${elementCount} elements): ${duration.toFixed(2)}ms`,
                value: duration,
                threshold: THRESHOLDS.HIGH_STYLE_APPLICATION_TIME,
                timestamp: performance.now(),
            });
        }
        console.debug(`[Performance Monitor] Style application (${elementCount} elements): ${duration.toFixed(2)}ms`);
    };
    const recordFrameDrop = (frameTime) => {
        if (!profiling)
            return;
        frameTimings.push(frameTime);
        if (frameTime > THRESHOLDS.HIGH_FRAME_TIME) {
            frameDropCount++;
        }
    };
    const monitorRenderingPerformance = () => {
        if (!("PerformanceObserver" in window)) {
            console.warn("PerformanceObserver not supported, skipping rendering monitoring");
            return;
        }
        try {
            renderingObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.entryType === "measure" && entry.name.includes("render")) {
                        recordFrameDrop(entry.duration);
                    }
                });
            });
            renderingObserver.observe({ entryTypes: ["measure"] });
        }
        catch (error) {
            console.warn("Failed to setup rendering performance monitoring:", error);
        }
    };
    const stopRenderingMonitoring = () => {
        if (renderingObserver) {
            renderingObserver.disconnect();
            renderingObserver = null;
        }
    };
    const logPerformanceReport = () => {
        const metrics = currentMetrics();
        if (!metrics) {
            console.log("[Performance Monitor] No metrics available");
            return;
        }
        const report = {
            operation: metrics.operationType,
            datasetSize: metrics.datasetSize,
            duration: `${metrics.operationDuration.toFixed(2)}ms`,
            performance: `${metrics.itemsPerSecond.toFixed(0)} items/second`,
            domUpdates: `${metrics.domUpdateCount} updates (avg: ${metrics.averageDomUpdateTime.toFixed(2)}ms)`,
            styleApplications: `${metrics.styleApplicationCount} applications (avg: ${metrics.averageStyleApplicationTime.toFixed(2)}ms)`,
            frameDrops: `${metrics.frameDropCount} drops (worst: ${metrics.worstFrameTime.toFixed(2)}ms)`,
            memoryUsage: `${(metrics.memoryDelta / 1024 / 1024).toFixed(2)}MB delta`,
            browserFreezes: `${metrics.browserFreezeTime.toFixed(2)}ms total`,
            warnings: warnings().length,
            severityBreakdown: {
                critical: warnings().filter((w) => w.severity === "critical").length,
                high: warnings().filter((w) => w.severity === "high").length,
                medium: warnings().filter((w) => w.severity === "medium").length,
                low: warnings().filter((w) => w.severity === "low").length,
            },
        };
        console.group("[Performance Monitor] Performance Report");
        console.table(report);
        console.groupCollapsed("Warnings");
        warnings().forEach((warning) => {
            console.warn(`[${warning.severity.toUpperCase()}] ${warning.message}`, {
                value: warning.value,
                threshold: warning.threshold,
                timestamp: new Date(warning.timestamp).toISOString(),
            });
        });
        console.groupEnd();
        console.groupEnd();
    };
    const exportMetrics = () => {
        const metrics = currentMetrics();
        const exportData = {
            metrics,
            warnings: warnings(),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            browserInfo: {
                memory: "memory" in performance ? performance.memory : null,
                connection: "connection" in navigator ? navigator.connection : null,
                hardwareConcurrency: navigator.hardwareConcurrency || "unknown",
            },
        };
        return JSON.stringify(exportData, null, 2);
    };
    const clearMetrics = () => {
        setCurrentMetrics(null);
        setWarnings([]);
        frameTimings = [];
        domUpdateTimings = [];
        styleApplicationTimings = [];
        frameDropCount = 0;
        totalBrowserFreezeTime = 0;
    };
    // Cleanup on unmount
    onCleanup(() => {
        stopRenderingMonitoring();
        profiling = false;
        setIsMonitoring(false);
    });
    return {
        startProfiling,
        endProfiling,
        recordDOMUpdate,
        recordStyleApplication,
        recordFrameDrop,
        metrics: currentMetrics,
        warnings,
        isMonitoring,
        logPerformanceReport,
        exportMetrics,
        clearMetrics,
        measureMemoryUsage,
        checkBrowserResponsiveness,
        monitorRenderingPerformance,
        stopRenderingMonitoring,
    };
}
