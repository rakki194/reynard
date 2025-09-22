/**
 * Analyze Output Handler
 *
 * Handles output generation and display for analysis results,
 * including file output and format-specific display.
 */

import { writeFile } from "fs/promises";
import { displaySummaryResults, displayTableResults } from "../display/results-display";
import { AnalyzeOptions } from "./analyze-command";
import { AnalysisExecutionResult } from "./analyze-execution-handler";

/**
 * Handle output generation and display
 */
export async function handleAnalysisOutput(
  options: AnalyzeOptions,
  executionResult: AnalysisExecutionResult
): Promise<void> {
  const output = createOutputObject(executionResult);

  // Save to file if requested
  if (options.output) {
    await saveOutputToFile(options.output, output);
  }

  // Display results based on format
  displayResultsByFormat(options.format, output);

  // Exit with appropriate code
  const hasFailures = executionResult.qualityGateResults.some((gate: any) => gate.status === "FAILED");
  process.exit(hasFailures ? 1 : 0);
}

/**
 * Create the output object
 */
function createOutputObject(executionResult: AnalysisExecutionResult): any {
  return {
    analysis: executionResult.analysisResult,
    security: executionResult.securityResult,
    qualityGates: executionResult.qualityGateResults,
    duration: executionResult.duration,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Save output to file
 */
async function saveOutputToFile(outputPath: string, output: any): Promise<void> {
  await writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`📄 Results saved to ${outputPath}`);
}

/**
 * Display results based on format
 */
function displayResultsByFormat(format: string, output: any): void {
  switch (format) {
    case "json":
      console.log(JSON.stringify(output, null, 2));
      break;
    case "table":
      displayTableResults(output);
      break;
    case "summary":
    default:
      displaySummaryResults(output);
      break;
  }
}
