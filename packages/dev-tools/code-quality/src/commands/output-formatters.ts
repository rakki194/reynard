/**
 * JSON Output Formatter for Junk Detection
 *
 * Provides JSON output formatting for junk file detection results,
 * with optional file output capability.
 */

import { JunkFileAnalysis } from "../JunkFileDetector";
import { writeFileSync } from "fs";

/**
 * Handle JSON output format
 */
export async function handleJsonOutput(analysis: JunkFileAnalysis, outputFile?: string): Promise<void> {
  const jsonOutput = JSON.stringify(analysis, null, 2);

  if (outputFile) {
    writeFileSync(outputFile, jsonOutput);
    console.log(`📄 Results saved to: ${outputFile}`);
  } else {
    console.log(jsonOutput);
  }
}
