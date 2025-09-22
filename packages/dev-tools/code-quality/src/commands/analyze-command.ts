#!/usr/bin/env node
/**
 * 🦊 Analyze Command Handler
 *
 * *whiskers twitch with intelligence* Handles the main analyze command
 * for comprehensive code quality analysis.
 */

import { executeAnalysis } from "./analyze-execution-handler";
import { handleAnalysisOutput } from "./analyze-output-handler";

export interface AnalyzeOptions {
  project: string;
  output?: string;
  format: string;
  security: boolean;
  qualityGates: boolean;
  environment: string;
  ai?: boolean;
  behavioral?: boolean;
  enhancedSecurity?: boolean;
}

export async function handleAnalyzeCommand(options: AnalyzeOptions): Promise<void> {
  try {
    console.log("🦊 Starting Reynard code quality analysis...");

    // Execute analysis
    const executionResult = await executeAnalysis(options);

    // Handle output and display
    await handleAnalysisOutput(options, executionResult);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Analysis failed:", errorMessage);
    process.exit(1);
  }
}
