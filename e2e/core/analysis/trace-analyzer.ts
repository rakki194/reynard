import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";

export interface TraceResource {
  url: string;
  filename: string;
  method: string;
  status: number;
  size: number;
  totalTime: number;
  waitTime: number;
  receiveTime: number;
  connectTime: number;
  dnsTime: number;
  sslTime: number;
  startTime: number;
  endTime: number;
  mimeType: string;
  isCritical: boolean;
}

export interface TraceConsole {
  type: "log" | "error" | "warn" | "info" | "debug";
  message: string;
  timestamp: number;
  location?: string;
}

export interface TraceError {
  message: string;
  stack?: string;
  timestamp: number;
  type: string;
  location?: string;
}

export interface TraceScreenshot {
  timestamp: number;
  filename: string;
  width: number;
  height: number;
  size: number;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
  timeToInteractive: number;
}

export interface TraceAnalysis {
  traceFile: string;
  extractedAt: string;
  totalDuration: number;
  resources: TraceResource[];
  console: TraceConsole[];
  errors: TraceError[];
  screenshots: TraceScreenshot[];
  performance: PerformanceMetrics;
  bottlenecks: {
    slowestResources: TraceResource[];
    criticalPath: TraceResource[];
    serverDelays: TraceResource[];
    networkIssues: TraceResource[];
  };
  recommendations: string[];
}

export class TraceAnalyzer {
  private tempDir: string;
  private traceData: any = {};

  constructor(tempDir: string = "./temp-trace-analysis") {
    this.tempDir = tempDir;
  }

  /**
   * Extract and analyze a Playwright trace zip file
   */
  async analyzeTrace(traceZipPath: string): Promise<TraceAnalysis> {
    console.log(`🔍 Analyzing trace: ${basename(traceZipPath)}`);

    // Ensure temp directory exists
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }

    // Extract trace files
    await this.extractTraceFiles(traceZipPath);

    // Parse all trace data
    await this.parseTraceData();

    // Generate analysis
    const analysis = this.generateAnalysis(traceZipPath);

    // Clean up temp files
    this.cleanup();

    return analysis;
  }

  /**
   * Extract trace files from zip
   */
  private async extractTraceFiles(traceZipPath: string): Promise<void> {
    try {
      const extractPath = join(this.tempDir, "extracted");
      execSync(`unzip -q "${traceZipPath}" -d "${extractPath}"`, { stdio: "pipe" });
      console.log(`✅ Extracted trace files to ${extractPath}`);
    } catch (error) {
      throw new Error(`Failed to extract trace files: ${error}`);
    }
  }

  /**
   * Parse all trace data files
   */
  private async parseTraceData(): Promise<void> {
    const extractedPath = join(this.tempDir, "extracted");

    // Parse network trace
    this.traceData.network = this.parseNetworkTrace(join(extractedPath, "trace.network"));

    // Parse console trace
    this.traceData.console = this.parseConsoleTrace(join(extractedPath, "trace.trace"));

    // Parse errors
    this.traceData.errors = this.parseErrors(join(extractedPath, "trace.trace"));

    // Parse screenshots
    this.traceData.screenshots = this.parseScreenshots(extractedPath);

    // Parse performance metrics
    this.traceData.performance = this.parsePerformanceMetrics(join(extractedPath, "trace.trace"));
  }

  /**
   * Parse network trace data
   */
  private parseNetworkTrace(networkFile: string): TraceResource[] {
    if (!existsSync(networkFile)) return [];

    const resources: TraceResource[] = [];
    const lines = readFileSync(networkFile, "utf-8").split("\n");

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const data = JSON.parse(line);
        if (data.type === "resource-snapshot") {
          const snapshot = data.snapshot;
          const request = snapshot.request;
          const response = snapshot.response;
          const timings = snapshot.timings;

          const filename = this.extractFilename(request.url);
          const isCritical = this.isCriticalResource(request.url);

          resources.push({
            url: request.url,
            filename,
            method: request.method,
            status: response.status,
            size: response.content?.size || 0,
            totalTime: snapshot.time,
            waitTime: timings.wait,
            receiveTime: timings.receive,
            connectTime: timings.connect,
            dnsTime: timings.dns,
            sslTime: timings.ssl,
            startTime: this.parseTimestamp(snapshot.startedDateTime),
            endTime: this.parseTimestamp(snapshot.startedDateTime) + snapshot.time,
            mimeType: response.content?.mimeType || "unknown",
            isCritical,
          });
        }
      } catch (error) {
        // Skip malformed lines
        continue;
      }
    }

    return resources.sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Parse console trace data
   */
  private parseConsoleTrace(traceFile: string): TraceConsole[] {
    if (!existsSync(traceFile)) return [];

    const console: TraceConsole[] = [];
    const lines = readFileSync(traceFile, "utf-8").split("\n");

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const data = JSON.parse(line);
        if (data.type === "console" || data.type === "log") {
          console.push({
            type: data.type === "console" ? data.method : "log",
            message: data.text || data.message || "",
            timestamp: data.timestamp || 0,
            location: data.location?.url,
          });
        }
      } catch (error) {
        continue;
      }
    }

    return console.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Parse error data
   */
  private parseErrors(traceFile: string): TraceError[] {
    if (!existsSync(traceFile)) return [];

    const errors: TraceError[] = [];
    const lines = readFileSync(traceFile, "utf-8").split("\n");

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const data = JSON.parse(line);
        if (data.type === "error" || data.type === "exception") {
          errors.push({
            message: data.text || data.message || "Unknown error",
            stack: data.stack,
            timestamp: data.timestamp || 0,
            type: data.type,
            location: data.location?.url,
          });
        }
      } catch (error) {
        continue;
      }
    }

    return errors.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Parse screenshot data
   */
  private parseScreenshots(extractedPath: string): TraceScreenshot[] {
    const screenshots: TraceScreenshot[] = [];
    const resourcesPath = join(extractedPath, "resources");

    if (!existsSync(resourcesPath)) return screenshots;

    try {
      const files = execSync(`find "${resourcesPath}" -name "*.png" -o -name "*.jpg" -o -name "*.jpeg"`, {
        encoding: "utf-8",
      })
        .split("\n")
        .filter(f => f.trim());

      for (const file of files) {
        try {
          const stats = execSync(`file "${file}"`, { encoding: "utf-8" });
          const size = parseInt(execSync(`stat -c%s "${file}"`, { encoding: "utf-8" }).trim());

          // Extract dimensions from file command output
          const dimensions = stats.match(/(\d+) x (\d+)/);
          const width = dimensions ? parseInt(dimensions[1]) : 0;
          const height = dimensions ? parseInt(dimensions[2]) : 0;

          screenshots.push({
            timestamp: this.extractTimestampFromFilename(basename(file)),
            filename: basename(file),
            width,
            height,
            size,
          });
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      // No screenshots found or error reading
    }

    return screenshots.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Parse performance metrics
   */
  private parsePerformanceMetrics(traceFile: string): PerformanceMetrics {
    if (!existsSync(traceFile)) return this.getDefaultPerformanceMetrics();

    const lines = readFileSync(traceFile, "utf-8").split("\n");
    const metrics = this.getDefaultPerformanceMetrics();

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const data = JSON.parse(line);
        if (data.type === "mark" || data.type === "measure") {
          const name = data.name || data.text;
          const value = data.startTime || data.timestamp || 0;

          switch (name) {
            case "first-contentful-paint":
            case "FCP":
              metrics.firstContentfulPaint = value;
              break;
            case "largest-contentful-paint":
            case "LCP":
              metrics.largestContentfulPaint = value;
              break;
            case "first-input-delay":
            case "FID":
              metrics.firstInputDelay = value;
              break;
            case "cumulative-layout-shift":
            case "CLS":
              metrics.cumulativeLayoutShift = value;
              break;
            case "total-blocking-time":
            case "TBT":
              metrics.totalBlockingTime = value;
              break;
          }
        }
      } catch (error) {
        continue;
      }
    }

    return metrics;
  }

  /**
   * Generate comprehensive analysis
   */
  private generateAnalysis(traceZipPath: string): TraceAnalysis {
    const resources = this.traceData.network || [];
    const console = this.traceData.console || [];
    const errors = this.traceData.errors || [];
    const screenshots = this.traceData.screenshots || [];
    const performance = this.traceData.performance || this.getDefaultPerformanceMetrics();

    // Calculate total duration
    const totalDuration =
      resources.length > 0
        ? Math.max(...resources.map(r => r.endTime)) - Math.min(...resources.map(r => r.startTime))
        : 0;

    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(resources);

    // Generate recommendations
    const recommendations = this.generateRecommendations(resources, performance, errors);

    return {
      traceFile: basename(traceZipPath),
      extractedAt: new Date().toISOString(),
      totalDuration,
      resources,
      console,
      errors,
      screenshots,
      performance,
      bottlenecks,
      recommendations,
    };
  }

  /**
   * Identify performance bottlenecks
   */
  private identifyBottlenecks(resources: TraceResource[]) {
    const slowestResources = [...resources].sort((a, b) => b.totalTime - a.totalTime).slice(0, 10);

    const criticalPath = resources.filter(r => r.isCritical).sort((a, b) => a.startTime - b.startTime);

    const serverDelays = resources.filter(r => r.waitTime > 200).sort((a, b) => b.waitTime - a.waitTime);

    const networkIssues = resources
      .filter(r => r.status >= 400 || r.totalTime > 1000)
      .sort((a, b) => b.totalTime - a.totalTime);

    return {
      slowestResources,
      criticalPath,
      serverDelays,
      networkIssues,
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    resources: TraceResource[],
    performance: PerformanceMetrics,
    errors: TraceError[]
  ): string[] {
    const recommendations: string[] = [];

    // Server delay recommendations
    const slowServerResources = resources.filter(r => r.waitTime > 400);
    if (slowServerResources.length > 0) {
      recommendations.push(
        `🚨 Critical: ${slowServerResources.length} resources have server delays >400ms. Consider optimizing Vite configuration or using production builds.`
      );
    }

    // Bundle size recommendations
    const largeResources = resources.filter(r => r.size > 100000);
    if (largeResources.length > 0) {
      recommendations.push(
        `📦 Large bundles detected: ${largeResources.length} resources >100KB. Consider code splitting and lazy loading.`
      );
    }

    // Performance metrics recommendations
    if (performance.firstContentfulPaint > 1000) {
      recommendations.push(
        `⚡ FCP is ${performance.firstContentfulPaint}ms (target: <1000ms). Optimize critical rendering path.`
      );
    }

    if (performance.cumulativeLayoutShift > 0.1) {
      recommendations.push(
        `📐 CLS is ${performance.cumulativeLayoutShift} (target: <0.1). Fix layout shifts by setting element dimensions.`
      );
    }

    // Error recommendations
    if (errors.length > 0) {
      recommendations.push(`❌ ${errors.length} errors detected. Review console logs and fix JavaScript errors.`);
    }

    // Network recommendations
    const failedRequests = resources.filter(r => r.status >= 400);
    if (failedRequests.length > 0) {
      recommendations.push(
        `🌐 ${failedRequests.length} failed requests detected. Check network connectivity and server status.`
      );
    }

    return recommendations;
  }

  /**
   * Generate detailed report
   */
  generateReport(analysis: TraceAnalysis, outputPath?: string): string {
    const report = this.formatAnalysisReport(analysis);

    if (outputPath) {
      writeFileSync(outputPath, report);
      console.log(`📊 Report generated: ${outputPath}`);
    }

    return report;
  }

  /**
   * Format analysis as markdown report
   */
  private formatAnalysisReport(analysis: TraceAnalysis): string {
    const { resources, performance, bottlenecks, recommendations } = analysis;

    return `# 🔍 Trace Analysis Report

**Trace File**: ${analysis.traceFile}
**Analyzed**: ${analysis.extractedAt}
**Duration**: ${analysis.totalDuration.toFixed(1)}ms

## 📊 Performance Summary

| Metric | Value | Status |
|--------|-------|--------|
| Page Load Time | ${analysis.totalDuration.toFixed(0)}ms | ${this.getStatus(analysis.totalDuration, 2000)} |
| First Contentful Paint | ${performance.firstContentfulPaint.toFixed(0)}ms | ${this.getStatus(performance.firstContentfulPaint, 1000)} |
| Largest Contentful Paint | ${performance.largestContentfulPaint.toFixed(0)}ms | ${this.getStatus(performance.largestContentfulPaint, 2000)} |
| Cumulative Layout Shift | ${performance.cumulativeLayoutShift.toFixed(3)} | ${this.getStatus(performance.cumulativeLayoutShift, 0.1, true)} |
| Total Blocking Time | ${performance.totalBlockingTime.toFixed(0)}ms | ${this.getStatus(performance.totalBlockingTime, 300)} |

## 🚨 Critical Bottlenecks

### Slowest Resources (Top 5)
${bottlenecks.slowestResources
  .slice(0, 5)
  .map(
    r =>
      `- **${r.filename}**: ${r.totalTime.toFixed(1)}ms (${r.size > 0 ? (r.size / 1024).toFixed(1) + "KB" : "unknown size"})`
  )
  .join("\n")}

### Server Delays (>200ms)
${bottlenecks.serverDelays
  .slice(0, 5)
  .map(r => `- **${r.filename}**: ${r.waitTime.toFixed(1)}ms wait time`)
  .join("\n")}

### Critical Path Resources
${bottlenecks.criticalPath.map(r => `- **${r.filename}**: ${r.totalTime.toFixed(1)}ms`).join("\n")}

## 📈 Resource Analysis

**Total Resources**: ${resources.length}
**Total Size**: ${(resources.reduce((sum, r) => sum + r.size, 0) / 1024).toFixed(1)}KB
**Failed Requests**: ${resources.filter(r => r.status >= 400).length}
**Average Load Time**: ${(resources.reduce((sum, r) => sum + r.totalTime, 0) / resources.length).toFixed(1)}ms

## 🎯 Recommendations

${recommendations.map(rec => `- ${rec}`).join("\n")}

## 📋 Detailed Resource List

| Resource | Size | Time | Wait | Status |
|----------|------|------|------|--------|
${resources
  .slice(0, 20)
  .map(
    r =>
      `| ${r.filename} | ${r.size > 0 ? (r.size / 1024).toFixed(1) + "KB" : "N/A"} | ${r.totalTime.toFixed(1)}ms | ${r.waitTime.toFixed(1)}ms | ${r.status} |`
  )
  .join("\n")}

---
*Generated by Reynard Trace Analyzer*
`;
  }

  /**
   * Utility methods
   */
  private extractFilename(url: string): string {
    const filename = url.split("/").pop() || url;
    return filename.split("?")[0];
  }

  private isCriticalResource(url: string): boolean {
    const criticalPatterns = [
      "main.tsx",
      "main.js",
      "index.html",
      "app.tsx",
      "app.js",
      "styles.css",
      "main.css",
      "bundle.js",
      "vendor.js",
    ];
    const filename = this.extractFilename(url).toLowerCase();
    return criticalPatterns.some(pattern => filename.includes(pattern));
  }

  private parseTimestamp(dateString: string): number {
    return new Date(dateString).getTime();
  }

  private extractTimestampFromFilename(filename: string): number {
    const match = filename.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private getDefaultPerformanceMetrics(): PerformanceMetrics {
    return {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      totalBlockingTime: 0,
      timeToInteractive: 0,
    };
  }

  private getStatus(value: number, threshold: number, reverse: boolean = false): string {
    const isGood = reverse ? value <= threshold : value <= threshold;
    return isGood ? "✅ Good" : "⚠️ Needs Improvement";
  }

  private cleanup(): void {
    try {
      execSync(`rm -rf "${this.tempDir}"`, { stdio: "pipe" });
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}
