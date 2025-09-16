/**
 * CLI Types and Interfaces for Trace Analyzer
 *
 * This module defines the core types and interfaces used throughout
 * the trace analyzer CLI system.
 */

export type OutputFormat = "markdown" | "json" | "console";

export interface CLIOptions {
  readonly input: string;
  readonly output?: string;
  readonly format: OutputFormat;
  readonly verbose: boolean;
  readonly compare?: string;
}

export interface TraceAnalysis {
  readonly traceFile: string;
  readonly totalDuration: number;
  readonly resources: ResourceInfo[];
  readonly errors: ErrorInfo[];
  readonly screenshots: ScreenshotInfo[];
  readonly performance: PerformanceMetrics;
  readonly bottlenecks: BottleneckInfo;
  readonly recommendations: string[];
}

export interface ResourceInfo {
  readonly filename: string;
  readonly totalTime: number;
  readonly size: number;
  readonly waitTime?: number;
}

export interface ErrorInfo {
  readonly message: string;
  readonly timestamp: number;
  readonly type: string;
}

export interface ScreenshotInfo {
  readonly filename: string;
  readonly timestamp: number;
  readonly description?: string;
}

export interface PerformanceMetrics {
  readonly firstContentfulPaint: number;
  readonly largestContentfulPaint: number;
  readonly cumulativeLayoutShift: number;
}

export interface BottleneckInfo {
  readonly slowestResources: ResourceInfo[];
  readonly serverDelays: ResourceInfo[];
}

export interface ComparisonResult {
  readonly duration: ChangeInfo;
  readonly resources: ChangeInfo;
  readonly errors: ChangeInfo;
  readonly performance: PerformanceChangeInfo;
}

export interface ChangeInfo {
  readonly old: number;
  readonly new: number;
  readonly change: string;
  readonly emoji: string;
}

export interface PerformanceChangeInfo {
  readonly fcp: ChangeInfo;
  readonly lcp: ChangeInfo;
  readonly cls: ChangeInfo;
}
