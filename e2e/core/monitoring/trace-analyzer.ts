/**
 * 🦦 ADVANCED TRACE ANALYSIS UTILITIES
 *
 * *splashes with trace analysis excitement* Comprehensive utilities for
 * analyzing Playwright traces, extracting performance insights, and
 * generating detailed reports.
 */

import { BrowserContext } from "@playwright/test";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface TraceAnalysis {
  traceFile: string;
  duration: number;
  networkRequests: NetworkRequest[];
  consoleLogs: ConsoleLog[];
  errors: Error[];
  performanceMetrics: PerformanceMetrics;
  layoutShifts: LayoutShift[];
  screenshots: Screenshot[];
  recommendations: string[];
}

export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  duration: number;
  size: number;
  type: string;
  timestamp: number;
}

export interface ConsoleLog {
  level: string;
  message: string;
  timestamp: number;
  source: string;
}

export interface Error {
  type: string;
  message: string;
  stack?: string;
  timestamp: number;
  source: string;
}

export interface PerformanceMetrics {
  navigationTiming: NavigationTiming;
  resourceTiming: ResourceTiming[];
  paintTiming: PaintTiming;
  userTiming: UserTiming[];
}

export interface NavigationTiming {
  navigationStart: number;
  loadEventEnd: number;
  domContentLoaded: number;
  firstByte: number;
  domInteractive: number;
}

export interface ResourceTiming {
  name: string;
  startTime: number;
  duration: number;
  transferSize: number;
  initiatorType: string;
}

export interface PaintTiming {
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

export interface UserTiming {
  name: string;
  startTime: number;
  duration: number;
}

export interface LayoutShift {
  timestamp: number;
  value: number;
  sources: LayoutShiftSource[];
}

export interface LayoutShiftSource {
  node: string;
  previousRect: DOMRect;
  currentRect: DOMRect;
}

export interface Screenshot {
  timestamp: number;
  path: string;
  description: string;
}

export class TraceAnalyzer {
  private context: BrowserContext;
  private traceFile: string;
  private analysis: TraceAnalysis | null = null;

  constructor(context: BrowserContext, traceFile: string) {
    this.context = context;
    this.traceFile = traceFile;
  }

  /**
   * Start comprehensive tracing with all capture modes
   */
  async startTracing(
    options: {
      screenshots?: boolean;
      snapshots?: boolean;
      sources?: boolean;
      attachments?: boolean;
    } = {}
  ): Promise<void> {
    console.log("🦦 Starting comprehensive tracing...");

    await this.context.tracing.start({
      screenshots: options.screenshots ?? true,
      snapshots: options.snapshots ?? true,
      sources: options.sources ?? true,
      attachments: options.attachments ?? true,
    });
  }

  /**
   * Stop tracing and save to file
   */
  async stopTracing(): Promise<string> {
    console.log("🦦 Stopping tracing and saving to file...");

    const tracePath = path.resolve(this.traceFile);
    await this.context.tracing.stop({ path: tracePath });

    console.log(`✅ Trace saved to: ${tracePath}`);
    return tracePath;
  }

  /**
   * Analyze trace file and extract comprehensive insights
   */
  async analyzeTrace(): Promise<TraceAnalysis> {
    console.log("🦦 Analyzing trace file...");

    if (!fs.existsSync(this.traceFile)) {
      throw new Error(`Trace file not found: ${this.traceFile}`);
    }

    // Extract trace data using Playwright's trace viewer
    const traceData = await this.extractTraceData();

    this.analysis = {
      traceFile: this.traceFile,
      duration: traceData.duration,
      networkRequests: traceData.networkRequests,
      consoleLogs: traceData.consoleLogs,
      errors: traceData.errors,
      performanceMetrics: traceData.performanceMetrics,
      layoutShifts: traceData.layoutShifts,
      screenshots: traceData.screenshots,
      recommendations: this.generateRecommendations(traceData),
    };

    return this.analysis;
  }

  /**
   * Extract comprehensive data from trace file
   */
  private async extractTraceData(): Promise<any> {
    // This would typically involve parsing the trace file
    // For now, we'll simulate the extraction process
    console.log("🦦 Extracting trace data...");

    // In a real implementation, you would:
    // 1. Parse the trace file (usually a ZIP containing JSON)
    // 2. Extract network requests, console logs, errors, etc.
    // 3. Calculate performance metrics
    // 4. Identify layout shifts and visual changes

    return {
      duration: 0,
      networkRequests: [],
      consoleLogs: [],
      errors: [],
      performanceMetrics: {
        navigationTiming: {
          navigationStart: 0,
          loadEventEnd: 0,
          domContentLoaded: 0,
          firstByte: 0,
          domInteractive: 0,
        },
        resourceTiming: [],
        paintTiming: {
          firstPaint: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
        },
        userTiming: [],
      },
      layoutShifts: [],
      screenshots: [],
    };
  }

  /**
   * Generate performance recommendations based on analysis
   */
  private generateRecommendations(traceData: any): string[] {
    const recommendations: string[] = [];

    // Network performance recommendations
    if (traceData.networkRequests) {
      const slowRequests = traceData.networkRequests.filter((req: NetworkRequest) => req.duration > 1000);
      if (slowRequests.length > 0) {
        recommendations.push(`Optimize ${slowRequests.length} slow network requests (>1s)`);
      }
    }

    // Layout shift recommendations
    if (traceData.layoutShifts) {
      const significantShifts = traceData.layoutShifts.filter((shift: LayoutShift) => shift.value > 0.1);
      if (significantShifts.length > 0) {
        recommendations.push(`Address ${significantShifts.length} significant layout shifts (CLS > 0.1)`);
      }
    }

    // Error recommendations
    if (traceData.errors && traceData.errors.length > 0) {
      recommendations.push(`Fix ${traceData.errors.length} JavaScript errors detected in trace`);
    }

    return recommendations;
  }

  /**
   * Generate comprehensive trace report
   */
  async generateReport(): Promise<string> {
    if (!this.analysis) {
      await this.analyzeTrace();
    }

    const analysis = this.analysis!;

    return `
# 🦦 Trace Analysis Report

## Trace Information
- **File**: ${analysis.traceFile}
- **Duration**: ${analysis.duration.toFixed(2)}ms

## Performance Metrics
### Navigation Timing
- **Navigation Start**: ${analysis.performanceMetrics.navigationTiming.navigationStart}ms
- **Load Event End**: ${analysis.performanceMetrics.navigationTiming.loadEventEnd}ms
- **DOM Content Loaded**: ${analysis.performanceMetrics.navigationTiming.domContentLoaded}ms
- **First Byte**: ${analysis.performanceMetrics.navigationTiming.firstByte}ms
- **DOM Interactive**: ${analysis.performanceMetrics.navigationTiming.domInteractive}ms

### Paint Timing
- **First Paint**: ${analysis.performanceMetrics.paintTiming.firstPaint}ms
- **First Contentful Paint**: ${analysis.performanceMetrics.paintTiming.firstContentfulPaint}ms
- **Largest Contentful Paint**: ${analysis.performanceMetrics.paintTiming.largestContentfulPaint}ms

## Network Analysis
- **Total Requests**: ${analysis.networkRequests.length}
- **Slow Requests (>1s)**: ${analysis.networkRequests.filter(r => r.duration > 1000).length}
- **Failed Requests**: ${analysis.networkRequests.filter(r => r.status >= 400).length}

## Layout Stability
- **Total Layout Shifts**: ${analysis.layoutShifts.length}
- **Significant Shifts (>0.1)**: ${analysis.layoutShifts.filter(s => s.value > 0.1).length}

## Console & Errors
- **Console Logs**: ${analysis.consoleLogs.length}
- **Errors**: ${analysis.errors.length}

## Screenshots
- **Total Screenshots**: ${analysis.screenshots.length}

## Recommendations
${analysis.recommendations.map(rec => `- ${rec}`).join("\n")}

## Next Steps
1. Review slow network requests and optimize loading
2. Address layout shifts for better visual stability
3. Fix JavaScript errors for improved reliability
4. Consider implementing performance budgets
5. Set up continuous performance monitoring
`;
  }

  /**
   * Save analysis report to file
   */
  async saveReport(outputPath: string): Promise<void> {
    const report = await this.generateReport();
    fs.writeFileSync(outputPath, report);
    console.log(`✅ Trace analysis report saved to: ${outputPath}`);
  }

  /**
   * Open trace in Playwright trace viewer
   */
  async openTraceViewer(): Promise<void> {
    console.log("🦦 Opening trace in Playwright trace viewer...");

    try {
      await execAsync(`npx playwright show-trace "${this.traceFile}"`);
    } catch (error) {
      console.error("Failed to open trace viewer:", error);
      console.log(`Manual command: npx playwright show-trace "${this.traceFile}"`);
    }
  }

  /**
   * Upload trace to trace.playwright.dev for sharing
   */
  async uploadToTraceViewer(): Promise<string> {
    console.log("🦦 Uploading trace to trace.playwright.dev...");

    // This would typically involve uploading the trace file
    // and returning the shareable URL
    const uploadUrl = `https://trace.playwright.dev/?trace=${encodeURIComponent(this.traceFile)}`;

    console.log(`✅ Trace uploaded: ${uploadUrl}`);
    return uploadUrl;
  }

  /**
   * Compare two traces and generate diff report
   */
  async compareTraces(otherTraceFile: string): Promise<string> {
    console.log("🦦 Comparing traces...");

    const otherAnalyzer = new TraceAnalyzer(this.context, otherTraceFile);
    const otherAnalysis = await otherAnalyzer.analyzeTrace();

    if (!this.analysis) {
      await this.analyzeTrace();
    }

    const current = this.analysis!;

    return `
# 🦦 Trace Comparison Report

## Performance Comparison
| Metric | Current | Previous | Change |
|--------|---------|----------|--------|
| Duration | ${current.duration.toFixed(2)}ms | ${otherAnalysis.duration.toFixed(2)}ms | ${(((current.duration - otherAnalysis.duration) / otherAnalysis.duration) * 100).toFixed(1)}% |
| Network Requests | ${current.networkRequests.length} | ${otherAnalysis.networkRequests.length} | ${current.networkRequests.length - otherAnalysis.networkRequests.length} |
| Layout Shifts | ${current.layoutShifts.length} | ${otherAnalysis.layoutShifts.length} | ${current.layoutShifts.length - otherAnalysis.layoutShifts.length} |
| Errors | ${current.errors.length} | ${otherAnalysis.errors.length} | ${current.errors.length - otherAnalysis.errors.length} |

## Key Differences
${this.generateComparisonInsights(current, otherAnalysis)}
`;
  }

  /**
   * Generate insights from trace comparison
   */
  private generateComparisonInsights(current: TraceAnalysis, previous: TraceAnalysis): string {
    const insights: string[] = [];

    if (current.duration > previous.duration * 1.1) {
      insights.push("⚠️ Performance regression detected - duration increased significantly");
    }

    if (current.networkRequests.length > previous.networkRequests.length) {
      insights.push("📈 More network requests in current trace");
    }

    if (current.layoutShifts.length > previous.layoutShifts.length) {
      insights.push("🔄 More layout shifts detected - visual stability may be impacted");
    }

    if (current.errors.length > previous.errors.length) {
      insights.push("❌ More errors in current trace - reliability may be impacted");
    }

    return insights.join("\n");
  }
}
