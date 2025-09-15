#!/usr/bin/env tsx

import { TraceAnalyzer } from "../core/analysis/trace-analyzer";

interface CLIOptions {
  input: string;
  output?: string;
  format: "markdown" | "json" | "console";
  verbose: boolean;
  compare?: string;
}

class TraceAnalyzerCLI {
  private analyzer: TraceAnalyzer;

  constructor() {
    this.analyzer = new TraceAnalyzer();
  }

  async run(args: string[]): Promise<void> {
    const options = this.parseArgs(args);

    if (!options.input) {
      this.showHelp();
      return;
    }

    try {
      console.log("🔍 Reynard Trace Analyzer");
      console.log("=".repeat(50));

      // Analyze the trace
      const analysis = await this.analyzer.analyzeTrace(options.input);

      // Output results
      await this.outputResults(analysis, options);

      // Compare if requested
      if (options.compare) {
        await this.compareTraces(options.input, options.compare, options);
      }

      console.log("✅ Analysis complete!");
    } catch (error) {
      console.error("❌ Analysis failed:", error);
      process.exit(1);
    }
  }

  private parseArgs(args: string[]): CLIOptions {
    const options: CLIOptions = {
      input: "",
      format: "console",
      verbose: false,
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case "-i":
        case "--input":
          options.input = args[++i];
          break;
        case "-o":
        case "--output":
          options.output = args[++i];
          break;
        case "-f":
        case "--format":
          options.format = args[++i] as "markdown" | "json" | "console";
          break;
        case "-v":
        case "--verbose":
          options.verbose = true;
          break;
        case "-c":
        case "--compare":
          options.compare = args[++i];
          break;
        case "-h":
        case "--help":
          this.showHelp();
          process.exit(0);
          break;
      }
    }

    return options;
  }

  private async outputResults(analysis: any, options: CLIOptions): Promise<void> {
    switch (options.format) {
      case "json":
        await this.outputJSON(analysis, options);
        break;
      case "markdown":
        await this.outputMarkdown(analysis, options);
        break;
      case "console":
      default:
        this.outputConsole(analysis, options);
        break;
    }
  }

  private async outputJSON(analysis: any, options: CLIOptions): Promise<void> {
    const outputPath = options.output || `trace-analysis-${Date.now()}.json`;
    const jsonOutput = JSON.stringify(analysis, null, 2);

    if (options.output) {
      const { writeFileSync } = await import("fs");
      writeFileSync(outputPath, jsonOutput);
      console.log(`📄 JSON report saved to: ${outputPath}`);
    } else {
      console.log(jsonOutput);
    }
  }

  private async outputMarkdown(analysis: any, options: CLIOptions): Promise<void> {
    const outputPath = options.output || `trace-analysis-${Date.now()}.md`;
    const markdownReport = this.analyzer.generateReport(analysis, outputPath);

    if (!options.output) {
      console.log(markdownReport);
    }
  }

  private outputConsole(analysis: any, options: CLIOptions): void {
    const { resources, performance, bottlenecks, recommendations } = analysis;

    console.log(`\n📊 Trace Analysis: ${analysis.traceFile}`);
    console.log(`⏱️  Duration: ${analysis.totalDuration.toFixed(1)}ms`);
    console.log(`📦 Resources: ${resources.length}`);
    console.log(`❌ Errors: ${analysis.errors.length}`);
    console.log(`📸 Screenshots: ${analysis.screenshots.length}`);

    console.log("\n🚨 Performance Metrics:");
    console.log(`  Page Load Time: ${analysis.totalDuration.toFixed(0)}ms`);
    console.log(`  First Contentful Paint: ${performance.firstContentfulPaint.toFixed(0)}ms`);
    console.log(`  Largest Contentful Paint: ${performance.largestContentfulPaint.toFixed(0)}ms`);
    console.log(`  Cumulative Layout Shift: ${performance.cumulativeLayoutShift.toFixed(3)}`);

    console.log("\n🐌 Slowest Resources:");
    bottlenecks.slowestResources.slice(0, 5).forEach((r: any, i: number) => {
      console.log(`  ${i + 1}. ${r.filename}: ${r.totalTime.toFixed(1)}ms`);
    });

    console.log("\n⏳ Server Delays (>200ms):");
    bottlenecks.serverDelays.slice(0, 5).forEach((r: any, i: number) => {
      console.log(`  ${i + 1}. ${r.filename}: ${r.waitTime.toFixed(1)}ms wait`);
    });

    console.log("\n🎯 Top Recommendations:");
    recommendations.slice(0, 3).forEach((rec: string, i: number) => {
      console.log(`  ${i + 1}. ${rec}`);
    });

    if (options.verbose) {
      console.log("\n📋 All Resources:");
      resources.forEach((r: any, i: number) => {
        console.log(
          `  ${i + 1}. ${r.filename} - ${r.totalTime.toFixed(1)}ms (${r.size > 0 ? (r.size / 1024).toFixed(1) + "KB" : "unknown"})`
        );
      });
    }
  }

  private async compareTraces(trace1: string, trace2: string, options: CLIOptions): Promise<void> {
    console.log("\n🔄 Comparing traces...");

    try {
      const analysis1 = await this.analyzer.analyzeTrace(trace1);
      const analysis2 = await this.analyzer.analyzeTrace(trace2);

      console.log("\n📊 Comparison Results:");
      console.log("=".repeat(50));

      console.log(
        `Duration: ${analysis1.totalDuration.toFixed(1)}ms → ${analysis2.totalDuration.toFixed(1)}ms (${this.getChange(analysis1.totalDuration, analysis2.totalDuration)})`
      );
      console.log(`Resources: ${analysis1.resources.length} → ${analysis2.resources.length}`);
      console.log(`Errors: ${analysis1.errors.length} → ${analysis2.errors.length}`);

      console.log("\nPerformance Changes:");
      console.log(
        `FCP: ${analysis1.performance.firstContentfulPaint.toFixed(0)}ms → ${analysis2.performance.firstContentfulPaint.toFixed(0)}ms (${this.getChange(analysis1.performance.firstContentfulPaint, analysis2.performance.firstContentfulPaint)})`
      );
      console.log(
        `LCP: ${analysis1.performance.largestContentfulPaint.toFixed(0)}ms → ${analysis2.performance.largestContentfulPaint.toFixed(0)}ms (${this.getChange(analysis1.performance.largestContentfulPaint, analysis2.performance.largestContentfulPaint)})`
      );
      console.log(
        `CLS: ${analysis1.performance.cumulativeLayoutShift.toFixed(3)} → ${analysis2.performance.cumulativeLayoutShift.toFixed(3)} (${this.getChange(analysis1.performance.cumulativeLayoutShift, analysis2.performance.cumulativeLayoutShift)})`
      );
    } catch (error) {
      console.error("❌ Comparison failed:", error);
    }
  }

  private getChange(old: number, newVal: number): string {
    const change = ((newVal - old) / old) * 100;
    const sign = change > 0 ? "+" : "";
    const emoji = change > 0 ? "📈" : change < 0 ? "📉" : "➡️";
    return `${emoji} ${sign}${change.toFixed(1)}%`;
  }

  private showHelp(): void {
    console.log(`
🔍 Reynard Trace Analyzer

Usage: tsx trace-analyzer-cli.ts [options]

Options:
  -i, --input <file>     Input trace zip file (required)
  -o, --output <file>    Output file path
  -f, --format <format>  Output format: console, markdown, json (default: console)
  -v, --verbose          Show detailed resource list
  -c, --compare <file>   Compare with another trace file
  -h, --help             Show this help message

Examples:
  tsx trace-analyzer-cli.ts -i trace.zip
  tsx trace-analyzer-cli.ts -i trace.zip -f markdown -o report.md
  tsx trace-analyzer-cli.ts -i trace1.zip -c trace2.zip -f json
  tsx trace-analyzer-cli.ts -i trace.zip -v
`);
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new TraceAnalyzerCLI();
  cli.run(process.argv.slice(2)).catch(console.error);
}

export { TraceAnalyzerCLI };
