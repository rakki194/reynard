/**
 * 🐺 Fenrir Suite Runner
 *
 * *snarls with pack coordination* Utility functions for executing
 * the complete fenrir security exploit suite.
 */

import { exec } from "child_process";
import * as path from "path";
import { promisify } from "util";
import type { CompleteSuiteResult } from "./penetration-test-config";
import { determineSecurityRating } from "./penetration-test-config";

const execAsync = promisify(exec);

/**
 * Run the complete fenrir exploit suite
 */
export async function runCompleteFenrirSuite(options: Record<string, unknown> = {}): Promise<CompleteSuiteResult> {
  const startTime = Date.now();

  try {
    const command = buildSuiteCommand(options);
    const { stdout, stderr } = await executeSuiteCommand(command);

    if (stderr && !stderr.includes("Warning")) {
      console.warn(`⚠️ Suite warning: ${stderr}`);
    }

    const executionTime = Date.now() - startTime;
    const { totalVulnerabilities, exploitsRun } = parseSuiteOutput(stdout);

    return createSuccessResult(totalVulnerabilities, exploitsRun, executionTime);
  } catch (error) {
    console.error(`❌ Complete suite failed:`, error);
    return createErrorResult(error, Date.now() - startTime);
  }
}

/**
 * Build the command for running the complete suite
 */
function buildSuiteCommand(options: Record<string, unknown>): string {
  const pythonPath = process.env.PYTHON_PATH || "bash -c 'source ~/venv/bin/activate && python3'";
  const target = typeof options.target === "string" ? options.target : "http://localhost:8000";

  return `${pythonPath} run_all_exploits.py --url ${target} ${options.verbose ? "--verbose" : ""} ${options.destructive ? "--destructive" : ""}`;
}

/**
 * Execute the suite command
 */
async function executeSuiteCommand(command: string): Promise<{ stdout: string; stderr: string }> {
  const fenrirPath = path.join(process.cwd(), "..", "fenrir");

  return await execAsync(command, {
    timeout: 120000, // Longer timeout for full suite
    cwd: fenrirPath,
  });
}

/**
 * Parse the suite output to extract results
 */
function parseSuiteOutput(stdout: string): { totalVulnerabilities: number; exploitsRun: number } {
  const vulnerabilityRegex = /Total Vulnerabilities Found: (\d+)/;
  const vulnerabilityMatch = vulnerabilityRegex.exec(stdout);
  const totalVulnerabilities = vulnerabilityMatch ? parseInt(vulnerabilityMatch[1]) : 0;

  const exploitsRegex = /Total Exploits Executed: (\d+)/;
  const exploitsMatch = exploitsRegex.exec(stdout);
  const exploitsRun = exploitsMatch ? parseInt(exploitsMatch[1]) : 0;

  return { totalVulnerabilities, exploitsRun };
}

/**
 * Create a successful result object
 */
function createSuccessResult(
  totalVulnerabilities: number,
  exploitsRun: number,
  executionTime: number
): CompleteSuiteResult {
  return {
    success: true,
    totalVulnerabilities,
    exploitsRun,
    executionTime,
    securityRating: determineSecurityRating(totalVulnerabilities),
    details: {
      testResults: [],
      summary: {
        criticalVulnerabilities: 0,
        highVulnerabilities: 0,
        mediumVulnerabilities: 0,
        lowVulnerabilities: totalVulnerabilities,
      },
      recommendations: [],
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Create an error result object
 */
function createErrorResult(error: unknown, executionTime: number): CompleteSuiteResult {
  const errorMessage = error instanceof Error ? error.message : String(error);

  return {
    success: false,
    totalVulnerabilities: 0,
    exploitsRun: 0,
    executionTime,
    securityRating: "UNKNOWN",
    details: {
      testResults: [],
      summary: {
        criticalVulnerabilities: 0,
        highVulnerabilities: 0,
        mediumVulnerabilities: 0,
        lowVulnerabilities: 0,
      },
      recommendations: [`Error: ${errorMessage}`],
      timestamp: new Date().toISOString(),
    },
  };
}
