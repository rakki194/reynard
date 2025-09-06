/**
 * Performance Utilities Algorithm
 *
 * A comprehensive performance monitoring and optimization toolkit for
 * measuring, analyzing, and improving application performance.
 *
 * Features:
 * - High-precision timing measurements
 * - Memory usage monitoring
 * - Performance benchmarking
 * - Throttling and debouncing utilities
 * - Frame rate monitoring
 * - Performance budgets
 * - Memory leak detection
 *
 * @module algorithms/performance
 */

export interface PerformanceMetrics {
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
  memoryDelta: number;
  timestamp: number;
  iterations: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  standardDeviation: number;
}

export interface PerformanceBudget {
  maxDuration: number;
  maxMemoryUsage: number;
  maxIterations: number;
  warningThreshold: number;
}

export interface PerformanceWarning {
  type: 'memory' | 'css' | 'dom' | 'rendering' | 'freeze';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}

export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface FrameRateMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  averageFrameTime: number;
  timestamp: number;
}

/**
 * High-precision performance timer
 */
export class PerformanceTimer {
  private startTime: number = 0;
  private endTime: number = 0;
  private isRunning: boolean = false;

  start(): void {
    this.startTime = performance.now();
    this.isRunning = true;
  }

  stop(): number {
    if (!this.isRunning) {
      throw new Error('Timer is not running');
    }
    this.endTime = performance.now();
    this.isRunning = false;
    return this.endTime - this.startTime;
  }

  getElapsed(): number {
    if (!this.isRunning) {
      return this.endTime - this.startTime;
    }
    return performance.now() - this.startTime;
  }

  reset(): void {
    this.startTime = 0;
    this.endTime = 0;
    this.isRunning = false;
  }
}

/**
 * Memory usage monitor
 */
export class MemoryMonitor {
  private measurements: Array<{ timestamp: number; usage: number }> = [];

  measure(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usage = memory.usedJSHeapSize;
      this.measurements.push({ timestamp: Date.now(), usage });
      return usage;
    }
    return 0;
  }

  getDelta(): number {
    if (this.measurements.length < 2) return 0;
    const latest = this.measurements[this.measurements.length - 1];
    const previous = this.measurements[this.measurements.length - 2];
    return latest.usage - previous.usage;
  }

  getAverageUsage(): number {
    if (this.measurements.length === 0) return 0;
    const total = this.measurements.reduce((sum, m) => sum + m.usage, 0);
    return total / this.measurements.length;
  }

  clear(): void {
    this.measurements = [];
  }
}

/**
 * Performance benchmark runner
 */
export class PerformanceBenchmark {
  private timer = new PerformanceTimer();
  private memoryMonitor = new MemoryMonitor();

  async run<T>(
    fn: () => T | Promise<T>,
    iterations: number = 1,
    budget?: PerformanceBudget
  ): Promise<PerformanceMetrics> {
    const times: number[] = [];
    const memoryBefore = this.memoryMonitor.measure();

    this.timer.start();

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);

      if (budget && end - start > budget.maxDuration) {
        console.warn(`Performance budget exceeded: ${end - start}ms > ${budget.maxDuration}ms`);
      }
    }

    const totalDuration = this.timer.stop();
    const memoryAfter = this.memoryMonitor.measure();

    const sortedTimes = times.sort((a, b) => a - b);
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = sortedTimes[0];
    const maxTime = sortedTimes[sortedTimes.length - 1];

    // Calculate standard deviation
    const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      duration: totalDuration,
      memoryBefore,
      memoryAfter,
      memoryDelta: memoryAfter - memoryBefore,
      timestamp: Date.now(),
      iterations,
      averageTime,
      minTime,
      maxTime,
      standardDeviation,
    };
  }
}

/**
 * Frame rate monitor
 */
export class FrameRateMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private frameTimes: number[] = [];
  private droppedFrames = 0;
  private isMonitoring = false;
  private animationFrameId: number | null = null;

  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameTimes = [];
    this.droppedFrames = 0;

    this.monitorFrame();
  }

  stop(): void {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private monitorFrame(): void {
    if (!this.isMonitoring) return;

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

  getMetrics(): FrameRateMetrics {
    const averageFrameTime =
      this.frameTimes.length > 0 ? this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length : 0;

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

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(func: T, wait: number, options: ThrottleOptions = {}): T {
  let timeoutId: number | null = null;
  let lastExecTime = 0;
  let lastArgs: any[] | null = null;

  const { leading = true, trailing = true, maxWait } = options;

  return ((...args: any[]) => {
    const now = Date.now();
    const timeSinceLastExec = now - lastExecTime;

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (leading && timeSinceLastExec >= wait) {
      lastExecTime = now;
      return func(...args);
    }

    if (trailing) {
      lastArgs = args;
      const delay = maxWait ? Math.min(wait, maxWait - timeSinceLastExec) : wait;

      timeoutId = window.setTimeout(() => {
        if (lastArgs) {
          lastExecTime = Date.now();
          func(...lastArgs);
          lastArgs = null;
        }
      }, delay);
    }
  }) as T;
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number, options: DebounceOptions = {}): T {
  let timeoutId: number | null = null;
  let lastExecTime = 0;
  let lastArgs: any[] | null = null;

  const { leading = false, trailing = true, maxWait } = options;

  return ((...args: any[]) => {
    const now = Date.now();
    const timeSinceLastExec = now - lastExecTime;

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (leading && timeSinceLastExec >= wait) {
      lastExecTime = now;
      return func(...args);
    }

    if (trailing) {
      lastArgs = args;
      const delay = maxWait ? Math.min(wait, maxWait - timeSinceLastExec) : wait;

      timeoutId = window.setTimeout(() => {
        if (lastArgs) {
          lastExecTime = Date.now();
          func(...lastArgs);
          lastArgs = null;
        }
      }, delay);
    }
  }) as T;
}

/**
 * Memory leak detector
 */
export class MemoryLeakDetector {
  private snapshots: Array<{ timestamp: number; usage: number; count: number }> = [];
  private objectCount = 0;
  private lastSnapshot = 0;

  takeSnapshot(): void {
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

  detectLeak(): { isLeaking: boolean; growthRate: number; confidence: number } {
    if (this.snapshots.length < 3) {
      return { isLeaking: false, growthRate: 0, confidence: 0 };
    }

    const recent = this.snapshots.slice(-3);
    const growthRates: number[] = [];

    for (let i = 1; i < recent.length; i++) {
      const timeDiff = recent[i].timestamp - recent[i - 1].timestamp;
      const usageDiff = recent[i].usage - recent[i - 1].usage;
      const rate = usageDiff / timeDiff;
      growthRates.push(rate);
    }

    const averageGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    const isLeaking = averageGrowthRate > 1000; // 1KB per second threshold

    // Calculate confidence based on consistency of growth
    const variance =
      growthRates.reduce((sum, rate) => sum + Math.pow(rate - averageGrowthRate, 2), 0) / growthRates.length;
    const confidence = Math.max(0, 1 - Math.sqrt(variance) / Math.abs(averageGrowthRate));

    return {
      isLeaking,
      growthRate: averageGrowthRate,
      confidence,
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  clear(): void {
    this.snapshots = [];
  }
}

/**
 * Performance budget checker
 */
export class PerformanceBudgetChecker {
  private budgets = new Map<string, PerformanceBudget>();

  setBudget(name: string, budget: PerformanceBudget): void {
    this.budgets.set(name, budget);
  }

  checkBudget(name: string, metrics: PerformanceMetrics): boolean {
    const budget = this.budgets.get(name);
    if (!budget) return true;

    const violations = [];

    if (metrics.duration > budget.maxDuration) {
      violations.push(`Duration: ${metrics.duration}ms > ${budget.maxDuration}ms`);
    }

    if (metrics.memoryDelta > budget.maxMemoryUsage) {
      violations.push(`Memory: ${metrics.memoryDelta} bytes > ${budget.maxMemoryUsage} bytes`);
    }

    if (metrics.iterations > budget.maxIterations) {
      violations.push(`Iterations: ${metrics.iterations} > ${budget.maxIterations}`);
    }

    if (violations.length > 0) {
      console.warn(`Performance budget violation for ${name}:`, violations.join(', '));
      return false;
    }

    return true;
  }

  clearBudget(name: string): void {
    this.budgets.delete(name);
  }

  clearAllBudgets(): void {
    this.budgets.clear();
  }
}

/**
 * Utility function to measure async operation performance
 */
export async function measureAsync<T>(
  operation: () => Promise<T>,
  name?: string
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  const benchmark = new PerformanceBenchmark();
  const metrics = await benchmark.run(operation, 1);

  if (name) {
    console.log(`Performance measurement for ${name}:`, metrics);
  }

  return { result: await operation(), metrics };
}

/**
 * Utility function to measure sync operation performance
 */
export async function measureSync<T>(
  operation: () => T,
  name?: string,
  iterations: number = 1
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  const benchmark = new PerformanceBenchmark();
  const metrics = await benchmark.run(operation, iterations);

  if (name) {
    console.log(`Performance measurement for ${name}:`, metrics);
  }

  return { result: operation(), metrics };
}
