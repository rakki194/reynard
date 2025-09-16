#!/usr/bin/env tsx

/**
 * Trace Analyzer CLI - Main Entry Point
 *
 * Orchestrates the trace analysis workflow using modular components.
 * This follows the Reynard 140-line axiom and otter principles of organization.
 */

import { TraceAnalyzer } from "../../core/analysis/trace-analyzer";
import { HelpSystem } from "./help";
import { HelpRequestedError, OptionsParser } from "./options-parser";
import { ConsoleOutputHandler, JsonOutputHandler, MarkdownOutputHandler } from "./output";
import type { CLIOptions, TraceAnalysis } from "./types";

export class TraceAnalyzerCLI {
  private readonly analyzer: TraceAnalyzer;

  constructor() {
    this.analyzer = new TraceAnalyzer();
  }

  /**
   * Main CLI entry point
   */
  async run(args: string[]): Promise<void> {
    try {
      const options = OptionsParser.parseArgs(args);
      OptionsParser.validateOptions(options);

      await this.executeAnalysis(options);
    } catch (error) {
      if (error instanceof HelpRequestedError) {
        HelpSystem.showHelp();
        return;
      }

      this.handleError(error);
    }
  }

  /**
   * Execute the main analysis workflow
   */
  private async executeAnalysis(options: CLIOptions): Promise<void> {
    console.log("🔍 Reynard Trace Analyzer");
    console.log("=".repeat(50));

    // Analyze the trace
    const analysis = await this.analyzer.analyzeTrace(options.input);

    // Output results
    await this.outputResults(analysis, options);

    // Compare if requested
    if (options.compare) {
      await this.executeComparison(options);
    }

    console.log("✅ Analysis complete!");
  }

  /**
   * Execute trace comparison
   */
  private async executeComparison(options: CLIOptions): Promise<void> {
    try {
      const analysis1 = await this.analyzer.analyzeTrace(options.input);
      const analysis2 = await this.analyzer.analyzeTrace(options.compare!);

      await this.outputComparison(analysis1, analysis2, options);
    } catch (error) {
      console.error("❌ Comparison failed:", error);
    }
  }

  /**
   * Output analysis results based on format
   */
  private async outputResults(analysis: TraceAnalysis, options: CLIOptions): Promise<void> {
    switch (options.format) {
      case "json":
        await JsonOutputHandler.output(analysis, options);
        break;
      case "markdown":
        await MarkdownOutputHandler.output(analysis, options, this.analyzer);
        break;
      case "console":
      default:
        ConsoleOutputHandler.output(analysis, options);
        break;
    }
  }

  /**
   * Output comparison results based on format
   */
  private async outputComparison(
    analysis1: TraceAnalysis,
    analysis2: TraceAnalysis,
    options: CLIOptions
  ): Promise<void> {
    switch (options.format) {
      case "json":
        await JsonOutputHandler.outputComparison(analysis1, analysis2, options);
        break;
      case "markdown":
        await MarkdownOutputHandler.outputComparison(analysis1, analysis2, options);
        break;
      case "console":
      default:
        ConsoleOutputHandler.outputComparison(analysis1, analysis2);
        break;
    }
  }

  /**
   * Handle errors with appropriate messaging
   */
  private handleError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    HelpSystem.showErrorHelp(errorMessage);
    process.exit(1);
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new TraceAnalyzerCLI();
  cli.run(process.argv.slice(2)).catch(console.error);
}
