/**
 * @fileoverview Type definitions for component rendering benchmarks
 *
 * Comprehensive type system for measuring and analyzing component performance
 * across different rendering approaches and component categories.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

export interface PerformanceMetrics {
  /** Time from navigation start to DOM content loaded */
  domContentLoaded: number;
  /** Time from navigation start to load complete */
  loadComplete: number;
  /** First paint timing */
  firstPaint: number;
  /** First contentful paint timing */
  firstContentfulPaint: number;
  /** Memory usage at start of render */
  memoryUsage: number;
  /** Total render time */
  renderTime: number;
  /** Total time for the benchmark iteration */
  totalTime: number;
  /** Time to render individual components */
  componentRenderTime: number;
  /** Memory usage after render */
  memoryAfterRender: number;
  /** Memory delta (after - before) */
  memoryDelta: number;
}

export interface ComponentCategory {
  /** Category name (primitives, layouts, data, overlays) */
  name: string;
  /** List of components in this category */
  components: string[];
  /** Description of the category */
  description: string;
}

export interface BenchmarkResult {
  /** Component category being tested */
  category: string;
  /** Rendering approach used */
  approach: string;
  /** Number of components rendered */
  componentCount: number;
  /** Unique test identifier */
  testName: string;
  /** Average render time across iterations */
  averageRenderTime: number;
  /** Standard deviation of render times */
  stdDeviation: number;
  /** Minimum render time observed */
  minRenderTime: number;
  /** Maximum render time observed */
  maxRenderTime: number;
  /** Average memory usage */
  averageMemoryUsage: number;
  /** Average memory delta */
  averageMemoryDelta: number;
  /** Number of iterations performed */
  iterations: number;
  /** Timestamp when benchmark was run */
  timestamp: Date;
}

export interface BenchmarkConfig {
  /** Number of benchmark iterations */
  iterations: number;
  /** Number of warmup runs */
  warmupRuns: number;
  /** Component counts to test */
  componentCounts: number[];
  /** Rendering approaches to test */
  renderingApproaches: string[];
}

export interface RenderingApproach {
  /** Approach identifier */
  name: string;
  /** Human-readable description */
  description: string;
  /** Whether this approach supports SSR */
  supportsSSR: boolean;
  /** Whether this approach supports lazy loading */
  supportsLazy: boolean;
  /** Whether this approach supports virtual scrolling */
  supportsVirtual: boolean;
  /** Performance characteristics */
  characteristics: {
    /** Best for small component counts */
    smallComponents: boolean;
    /** Best for large component counts */
    largeComponents: boolean;
    /** Best for initial load */
    initialLoad: boolean;
    /** Best for runtime performance */
    runtimePerformance: boolean;
  };
}

export interface ComponentBenchmarkData {
  /** Component name */
  name: string;
  /** Component category */
  category: string;
  /** Bundle size in bytes */
  bundleSize: number;
  /** Gzipped bundle size in bytes */
  gzippedSize: number;
  /** Number of dependencies */
  dependencyCount: number;
  /** Whether component supports SSR */
  supportsSSR: boolean;
  /** Whether component supports lazy loading */
  supportsLazy: boolean;
  /** Performance baseline (ms) */
  baselineRenderTime: number;
}

export interface BenchmarkSuite {
  /** Run all benchmarks */
  runAll(): Promise<BenchmarkResult[]>;
  /** Run benchmarks for specific category */
  runCategory(category: string): Promise<BenchmarkResult[]>;
  /** Run benchmarks for specific approach */
  runApproach(approach: string): Promise<BenchmarkResult[]>;
  /** Generate performance report */
  generateReport(results: BenchmarkResult[]): Promise<string>;
  /** Export results to JSON */
  exportResults(results: BenchmarkResult[]): Promise<string>;
}

export interface PerformanceThresholds {
  /** Maximum acceptable render time (ms) */
  maxRenderTime: number;
  /** Maximum acceptable memory usage (MB) */
  maxMemoryUsage: number;
  /** Maximum acceptable bundle size (KB) */
  maxBundleSize: number;
  /** Performance regression threshold (%) */
  regressionThreshold: number;
}

export interface BenchmarkEnvironment {
  /** Browser name */
  browser: string;
  /** Browser version */
  browserVersion: string;
  /** Operating system */
  os: string;
  /** Device type */
  device: string;
  /** Screen resolution */
  resolution: string;
  /** Network conditions */
  network: string;
  /** CPU throttling level */
  cpuThrottling: number;
  /** Memory constraints */
  memoryConstraints: number;
}

export interface BenchmarkReport {
  /** Report metadata */
  metadata: {
    timestamp: Date;
    environment: BenchmarkEnvironment;
    config: BenchmarkConfig;
  };
  /** Benchmark results */
  results: BenchmarkResult[];
  /** Performance recommendations */
  recommendations: Array<{
    category: string;
    approach: string;
    reason: string;
    confidence: number;
  }>;
  /** Performance regressions detected */
  regressions: Array<{
    testName: string;
    previousTime: number;
    currentTime: number;
    regressionPercent: number;
  }>;
  /** Summary statistics */
  summary: {
    totalTests: number;
    averageRenderTime: number;
    fastestApproach: string;
    slowestApproach: string;
    memoryEfficientApproach: string;
  };
}

