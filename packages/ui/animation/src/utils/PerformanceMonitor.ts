/**
 * 🦊 Performance Monitor
 *
 * Real performance monitoring with tracer timers and metrics
 */

export interface PerformanceMetrics {
  duration: number;
  frameCount: number;
  averageFrameTime: number;
  minFrameTime: number;
  maxFrameTime: number;
  droppedFrames: number;
  memoryUsage?: number;
  timestamp: number;
}

export interface BenchmarkResult {
  name: string;
  metrics: PerformanceMetrics;
  iterations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  standardDeviation: number;
}

export class PerformanceMonitor {
  private startTime: number = 0;
  private frameTimes: number[] = [];
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private isMonitoring: boolean = false;
  private targetFPS: number = 60;
  private frameTimeThreshold: number = 16.67; // 60fps = 16.67ms per frame

  start(targetFPS: number = 60): void {
    this.startTime = performance.now();
    this.frameTimes = [];
    this.frameCount = 0;
    this.lastFrameTime = this.startTime;
    this.isMonitoring = true;
    this.targetFPS = targetFPS;
    this.frameTimeThreshold = 1000 / targetFPS;
  }

  recordFrame(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;

    this.frameTimes.push(frameTime);
    this.frameCount++;
    this.lastFrameTime = currentTime;
  }

  stop(): PerformanceMetrics {
    if (!this.isMonitoring) {
      throw new Error("Performance monitoring not started");
    }

    const endTime = performance.now();
    const totalDuration = endTime - this.startTime;

    const averageFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
    const minFrameTime = Math.min(...this.frameTimes);
    const maxFrameTime = Math.max(...this.frameTimes);
    const droppedFrames = this.frameTimes.filter(time => time > this.frameTimeThreshold * 1.5).length;

    const metrics: PerformanceMetrics = {
      duration: totalDuration,
      frameCount: this.frameCount,
      averageFrameTime,
      minFrameTime,
      maxFrameTime,
      droppedFrames,
      memoryUsage: this.getMemoryUsage(),
      timestamp: endTime,
    };

    this.isMonitoring = false;
    return metrics;
  }

  private getMemoryUsage(): number | undefined {
    if ("memory" in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }

  getCurrentMetrics(): Partial<PerformanceMetrics> {
    if (!this.isMonitoring) {
      return {};
    }

    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    const currentFPS = this.frameCount / (elapsed / 1000);

    return {
      duration: elapsed,
      frameCount: this.frameCount,
      timestamp: currentTime,
    };
  }
}

export class BenchmarkRunner {
  private results: BenchmarkResult[] = [];

  async runBenchmark(name: string, fn: () => Promise<void> | void, iterations: number = 1): Promise<BenchmarkResult> {
    const durations: number[] = [];
    const allMetrics: PerformanceMetrics[] = [];

    for (let i = 0; i < iterations; i++) {
      const monitor = new PerformanceMonitor();
      monitor.start();

      const startTime = performance.now();
      await fn();
      const endTime = performance.now();

      const metrics = monitor.stop();
      durations.push(endTime - startTime);
      allMetrics.push(metrics);
    }

    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    // Calculate standard deviation
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - averageDuration, 2), 0) / durations.length;
    const standardDeviation = Math.sqrt(variance);

    // Average metrics across all iterations
    const avgMetrics: PerformanceMetrics = {
      duration: allMetrics.reduce((sum, m) => sum + m.duration, 0) / allMetrics.length,
      frameCount: Math.round(allMetrics.reduce((sum, m) => sum + m.frameCount, 0) / allMetrics.length),
      averageFrameTime: allMetrics.reduce((sum, m) => sum + m.averageFrameTime, 0) / allMetrics.length,
      minFrameTime: Math.min(...allMetrics.map(m => m.minFrameTime)),
      maxFrameTime: Math.max(...allMetrics.map(m => m.maxFrameTime)),
      droppedFrames: Math.round(allMetrics.reduce((sum, m) => sum + m.droppedFrames, 0) / allMetrics.length),
      memoryUsage: allMetrics[0]?.memoryUsage,
      timestamp: performance.now(),
    };

    const result: BenchmarkResult = {
      name,
      metrics: avgMetrics,
      iterations,
      averageDuration,
      minDuration,
      maxDuration,
      standardDeviation,
    };

    this.results.push(result);
    return result;
  }

  getResults(): BenchmarkResult[] {
    return [...this.results];
  }

  generateReport(): string {
    let report = "Performance Benchmark Report\n";
    report += "============================\n\n";

    this.results.forEach(result => {
      report += `${result.name}:\n`;
      report += `  Iterations: ${result.iterations}\n`;
      report += `  Average Duration: ${result.averageDuration.toFixed(2)}ms\n`;
      report += `  Min Duration: ${result.minDuration.toFixed(2)}ms\n`;
      report += `  Max Duration: ${result.maxDuration.toFixed(2)}ms\n`;
      report += `  Standard Deviation: ${result.standardDeviation.toFixed(2)}ms\n`;
      report += `  Average Frame Time: ${result.metrics.averageFrameTime.toFixed(2)}ms\n`;
      report += `  Dropped Frames: ${result.metrics.droppedFrames}\n`;
      if (result.metrics.memoryUsage) {
        report += `  Memory Usage: ${(result.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB\n`;
      }
      report += "\n";
    });

    return report;
  }

  clear(): void {
    this.results = [];
  }
}

// Utility functions for common performance tests
export const performanceUtils = {
  /**
   * Measure function execution time
   */
  async measureFunction<T>(
    name: string,
    fn: () => Promise<T> | T,
    iterations: number = 1
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`${name}: ${duration.toFixed(2)}ms (${iterations} iterations)`);
    return { result, duration };
  },

  /**
   * Measure memory usage
   */
  getMemoryUsage(): { used: number; total: number; limit: number } | null {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  },

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(metrics: PerformanceMetrics): boolean {
    const targetFrameTime = 1000 / 60; // 60fps
    const acceptableFrameTime = targetFrameTime * 1.5; // 50% tolerance

    return (
      metrics.averageFrameTime <= acceptableFrameTime && metrics.droppedFrames <= metrics.frameCount * 0.05 // Less than 5% dropped frames
    );
  },
};
