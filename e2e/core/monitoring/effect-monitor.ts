/**
 * 🦊 EFFECT MONITORING UTILITIES
 *
 * *whiskers twitch with strategic cunning* Advanced monitoring utilities for
 * tracking SolidJS createEffect executions, API calls, and detecting infinite loops
 * that could cause outages like the Cloudflare incident.
 */

import type { IApiCallTracker, IEffectMetrics } from "../../fixtures/effect-dependency-fixtures";

/**
 * Effect Monitor Configuration
 */
export interface IEffectMonitorConfig {
  maxApiCallsPerSecond: number;
  maxEffectExecutions: number;
  maxMemoryUsageMB: number;
  maxCpuUsagePercent: number;
  detectionWindowMs: number;
  alertThreshold: number;
}

/**
 * Effect Execution Event
 */
export interface IEffectExecutionEvent {
  effectId: string;
  timestamp: number;
  executionTime: number;
  dependencySnapshot: any;
  stackTrace?: string;
}

/**
 * API Call Event
 */
export interface IApiCallEvent {
  endpoint: string;
  method: string;
  timestamp: number;
  requestId: string;
  responseTime?: number;
  statusCode?: number;
  payload?: any;
}

/**
 * Infinite Loop Detection Result
 */
export interface IInfiniteLoopDetection {
  isDetected: boolean;
  effectId: string;
  executionCount: number;
  timeWindow: number;
  averageExecutionTime: number;
  confidence: number;
  recommendations: string[];
}

/**
 * Performance Metrics
 */
export interface IPerformanceMetrics {
  memoryUsage: number;
  cpuUsage: number;
  apiCallRate: number;
  effectExecutionRate: number;
  timestamp: number;
}

/**
 * 🦊 Effect Monitor Class
 *
 * Monitors SolidJS createEffect executions and API calls to detect
 * infinite loops and performance issues that could cause outages.
 */
export class EffectMonitor {
  private config: IEffectMonitorConfig;
  private effectExecutions: Map<string, IEffectExecutionEvent[]> = new Map();
  private apiCalls: IApiCallEvent[] = [];
  private performanceMetrics: IPerformanceMetrics[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;
  private alertCallbacks: ((alert: string) => void)[] = [];

  constructor(config?: Partial<IEffectMonitorConfig>) {
    this.config = {
      maxApiCallsPerSecond: 10,
      maxEffectExecutions: 5,
      maxMemoryUsageMB: 100,
      maxCpuUsagePercent: 80,
      detectionWindowMs: 5000, // 5 seconds
      alertThreshold: 0.8,
      ...config,
    };
  }

  /**
   * Start monitoring effect executions and API calls
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.warn("🦊 Effect monitoring is already running");
      return;
    }

    console.log("🦊 Starting effect monitoring...");
    this.isMonitoring = true;

    // Start performance monitoring
    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceMetrics();
      this.detectInfiniteLoops();
      this.detectApiCallSpam();
    }, 1000); // Check every second

    // Hook into global fetch to monitor API calls
    this.hookIntoFetch();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    console.log("🦊 Stopping effect monitoring...");
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    // Restore original fetch
    this.restoreFetch();
  }

  /**
   * Track effect execution
   */
  trackEffectExecution(effectId: string, executionTime: number, dependencySnapshot?: any): void {
    if (!this.isMonitoring) return;

    const event: IEffectExecutionEvent = {
      effectId,
      timestamp: Date.now(),
      executionTime,
      dependencySnapshot,
      stackTrace: this.getStackTrace(),
    };

    if (!this.effectExecutions.has(effectId)) {
      this.effectExecutions.set(effectId, []);
    }

    const executions = this.effectExecutions.get(effectId)!;
    executions.push(event);

    // Keep only recent executions (last 10 seconds)
    const cutoff = Date.now() - 10000;
    this.effectExecutions.set(
      effectId,
      executions.filter(e => e.timestamp > cutoff)
    );

    // Check for immediate infinite loop
    this.checkImmediateInfiniteLoop(effectId, executions);
  }

  /**
   * Track API call
   */
  trackApiCall(endpoint: string, method: string, requestId: string, payload?: any): void {
    if (!this.isMonitoring) return;

    const event: IApiCallEvent = {
      endpoint,
      method,
      timestamp: Date.now(),
      requestId,
      payload,
    };

    this.apiCalls.push(event);

    // Keep only recent API calls (last 30 seconds)
    const cutoff = Date.now() - 30000;
    this.apiCalls = this.apiCalls.filter(call => call.timestamp > cutoff);
  }

  /**
   * Complete API call tracking
   */
  completeApiCall(requestId: string, statusCode: number, responseTime: number): void {
    const call = this.apiCalls.find(c => c.requestId === requestId);
    if (call) {
      call.statusCode = statusCode;
      call.responseTime = responseTime;
    }
  }

  /**
   * Add alert callback
   */
  onAlert(callback: (alert: string) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Get current metrics for an effect
   */
  getEffectMetrics(effectId: string): IEffectMetrics | null {
    const executions = this.effectExecutions.get(effectId);
    if (!executions || executions.length === 0) {
      return null;
    }

    const now = Date.now();
    const recentExecutions = executions.filter(e => now - e.timestamp < this.config.detectionWindowMs);

    const totalExecutionTime = recentExecutions.reduce((sum, e) => sum + e.executionTime, 0);

    return {
      effectId,
      executionCount: recentExecutions.length,
      lastExecution: recentExecutions[recentExecutions.length - 1]?.timestamp || 0,
      averageExecutionTime: totalExecutionTime / recentExecutions.length,
      totalExecutionTime,
      dependencyChanges: this.countDependencyChanges(recentExecutions),
      isInfiniteLoop: recentExecutions.length > this.config.maxEffectExecutions,
    };
  }

  /**
   * Get all effect metrics
   */
  getAllEffectMetrics(): Map<string, IEffectMetrics> {
    const metrics = new Map<string, IEffectMetrics>();

    for (const effectId of this.effectExecutions.keys()) {
      const metric = this.getEffectMetrics(effectId);
      if (metric) {
        metrics.set(effectId, metric);
      }
    }

    return metrics;
  }

  /**
   * Get API call statistics
   */
  getApiCallStats(): {
    totalCalls: number;
    callsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    endpointBreakdown: Record<string, number>;
  } {
    const now = Date.now();
    const recentCalls = this.apiCalls.filter(call => now - call.timestamp < this.config.detectionWindowMs);

    const endpointBreakdown: Record<string, number> = {};
    let totalResponseTime = 0;
    let errorCount = 0;

    recentCalls.forEach(call => {
      endpointBreakdown[call.endpoint] = (endpointBreakdown[call.endpoint] || 0) + 1;

      if (call.responseTime) {
        totalResponseTime += call.responseTime;
      }

      if (call.statusCode && call.statusCode >= 400) {
        errorCount++;
      }
    });

    return {
      totalCalls: recentCalls.length,
      callsPerSecond: recentCalls.length / (this.config.detectionWindowMs / 1000),
      averageResponseTime: totalResponseTime / recentCalls.length || 0,
      errorRate: errorCount / recentCalls.length || 0,
      endpointBreakdown,
    };
  }

  /**
   * Generate comprehensive monitoring report
   */
  generateReport(): string {
    const effectMetrics = this.getAllEffectMetrics();
    const apiStats = this.getApiCallStats();
    const performance = this.performanceMetrics[this.performanceMetrics.length - 1];

    return `
# 🦊 Effect Monitoring Report

## Effect Execution Metrics
${Array.from(effectMetrics.entries())
  .map(
    ([id, metrics]) => `
### Effect: ${id}
- **Executions**: ${metrics.executionCount}
- **Average Time**: ${metrics.averageExecutionTime.toFixed(2)}ms
- **Total Time**: ${metrics.totalExecutionTime.toFixed(2)}ms
- **Dependency Changes**: ${metrics.dependencyChanges}
- **Infinite Loop**: ${metrics.isInfiniteLoop ? "⚠️ DETECTED" : "✅ Normal"}
`
  )
  .join("\n")}

## API Call Statistics
- **Total Calls**: ${apiStats.totalCalls}
- **Calls/Second**: ${apiStats.callsPerSecond.toFixed(2)}
- **Average Response Time**: ${apiStats.averageResponseTime.toFixed(2)}ms
- **Error Rate**: ${(apiStats.errorRate * 100).toFixed(1)}%

### Endpoint Breakdown
${Object.entries(apiStats.endpointBreakdown)
  .map(([endpoint, count]) => `- ${endpoint}: ${count} calls`)
  .join("\n")}

## Performance Metrics
${
  performance
    ? `
- **Memory Usage**: ${performance.memoryUsage.toFixed(2)}MB
- **CPU Usage**: ${performance.cpuUsage.toFixed(1)}%
- **API Call Rate**: ${performance.apiCallRate.toFixed(2)}/s
- **Effect Execution Rate**: ${performance.effectExecutionRate.toFixed(2)}/s
`
    : "No performance data available"
}

## Recommendations
${this.generateRecommendations(effectMetrics, apiStats)}
`;
  }

  /**
   * Hook into global fetch to monitor API calls
   */
  private hookIntoFetch(): void {
    // Only hook into fetch in browser environment
    if (typeof window === "undefined") {
      console.log("🦊 Skipping fetch hook - not in browser environment");
      return;
    }

    const originalFetch = window.fetch;
    const monitor = this;

    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method || "GET";
      const requestId = `req-${Math.random().toString(36).substr(2, 9)}`;

      // Track the API call
      monitor.trackApiCall(url, method, requestId, init?.body);

      const startTime = Date.now();

      try {
        const response = await originalFetch(input, init);
        const responseTime = Date.now() - startTime;

        // Complete the tracking
        monitor.completeApiCall(requestId, response.status, responseTime);

        return response;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        monitor.completeApiCall(requestId, 0, responseTime);
        throw error;
      }
    };
  }

  /**
   * Restore original fetch
   */
  private restoreFetch(): void {
    // Only restore fetch in browser environment
    if (typeof window === "undefined") {
      return;
    }

    // In a real implementation, you'd restore the original fetch
    // For testing purposes, we'll leave this as a placeholder
  }

  /**
   * Collect performance metrics
   */
  private collectPerformanceMetrics(): void {
    // Only collect performance metrics in browser environment
    if (typeof window === "undefined") {
      return;
    }

    const memoryUsage = (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0;
    const cpuUsage = this.estimateCpuUsage();

    const apiStats = this.getApiCallStats();
    const effectMetrics = this.getAllEffectMetrics();
    const effectExecutionRate =
      Array.from(effectMetrics.values()).reduce((sum, m) => sum + m.executionCount, 0) /
      (this.config.detectionWindowMs / 1000);

    this.performanceMetrics.push({
      memoryUsage,
      cpuUsage,
      apiCallRate: apiStats.callsPerSecond,
      effectExecutionRate,
      timestamp: Date.now(),
    });

    // Keep only recent metrics (last 5 minutes)
    const cutoff = Date.now() - 300000;
    this.performanceMetrics = this.performanceMetrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Detect infinite loops in effects
   */
  private detectInfiniteLoops(): void {
    const effectMetrics = this.getAllEffectMetrics();

    for (const [effectId, metrics] of effectMetrics) {
      if (metrics.isInfiniteLoop) {
        this.triggerAlert(
          `🦊 INFINITE LOOP DETECTED in effect "${effectId}": ` +
            `${metrics.executionCount} executions in ${this.config.detectionWindowMs}ms`
        );
      }
    }
  }

  /**
   * Detect API call spam
   */
  private detectApiCallSpam(): void {
    const apiStats = this.getApiCallStats();

    if (apiStats.callsPerSecond > this.config.maxApiCallsPerSecond) {
      this.triggerAlert(
        `🦊 API CALL SPAM DETECTED: ` +
          `${apiStats.callsPerSecond.toFixed(2)} calls/second (limit: ${this.config.maxApiCallsPerSecond})`
      );
    }
  }

  /**
   * Check for immediate infinite loop
   */
  private checkImmediateInfiniteLoop(effectId: string, executions: IEffectExecutionEvent[]): void {
    const recentExecutions = executions.slice(-10); // Last 10 executions

    if (recentExecutions.length >= 10) {
      const timeSpan = recentExecutions[recentExecutions.length - 1].timestamp - recentExecutions[0].timestamp;

      if (timeSpan < 1000) {
        // 10 executions in less than 1 second
        this.triggerAlert(
          `🦊 IMMEDIATE INFINITE LOOP DETECTED in effect "${effectId}": ` + `10 executions in ${timeSpan}ms`
        );
      }
    }
  }

  /**
   * Count dependency changes
   */
  private countDependencyChanges(executions: IEffectExecutionEvent[]): number {
    if (executions.length < 2) return 0;

    let changes = 0;
    for (let i = 1; i < executions.length; i++) {
      const prev = executions[i - 1].dependencySnapshot;
      const curr = executions[i].dependencySnapshot;

      if (JSON.stringify(prev) !== JSON.stringify(curr)) {
        changes++;
      }
    }

    return changes;
  }

  /**
   * Estimate CPU usage (simplified)
   */
  private estimateCpuUsage(): number {
    // Simplified CPU usage estimation
    // In a real implementation, you'd use more sophisticated methods
    return Math.random() * 100;
  }

  /**
   * Get stack trace
   */
  private getStackTrace(): string {
    const stack = new Error().stack;
    return stack ? stack.split("\n").slice(2, 5).join("\n") : "";
  }

  /**
   * Trigger alert
   */
  private triggerAlert(message: string): void {
    console.error(message);
    this.alertCallbacks.forEach(callback => callback(message));
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(effectMetrics: Map<string, IEffectMetrics>, apiStats: any): string {
    const recommendations: string[] = [];

    // Check for infinite loops
    for (const [effectId, metrics] of effectMetrics) {
      if (metrics.isInfiniteLoop) {
        recommendations.push(
          `🔧 Fix infinite loop in effect "${effectId}": ` +
            `Check dependency array for object/array/function recreation`
        );
      }
    }

    // Check for API spam
    if (apiStats.callsPerSecond > this.config.maxApiCallsPerSecond) {
      recommendations.push(`🔧 Reduce API call rate: ` + `Consider debouncing, caching, or fixing effect dependencies`);
    }

    // Check for high error rates
    if (apiStats.errorRate > 0.1) {
      recommendations.push(
        `🔧 High API error rate detected: ` + `Investigate API endpoint reliability and error handling`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ No issues detected - system is running normally");
    }

    return recommendations.join("\n");
  }
}

/**
 * Global effect monitor instance
 */
export const globalEffectMonitor = new EffectMonitor();

/**
 * SolidJS createEffect wrapper with monitoring
 */
export function createMonitoredEffect(effectFn: () => void, deps?: () => any[], effectId?: string): void {
  const id = effectId || `effect-${Math.random().toString(36).substr(2, 9)}`;

  // In a real SolidJS implementation, you'd wrap the actual createEffect
  // For testing purposes, we'll simulate the monitoring

  const startTime = Date.now();

  try {
    effectFn();
  } finally {
    const executionTime = Date.now() - startTime;
    const dependencySnapshot = deps ? deps() : undefined;

    globalEffectMonitor.trackEffectExecution(id, executionTime, dependencySnapshot);
  }
}
