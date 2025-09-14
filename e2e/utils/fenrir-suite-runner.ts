/**
 * 🐺 Fenrir Suite Runner
 * 
 * *snarls with pack coordination* Utility functions for executing
 * the complete fenrir security exploit suite.
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import type { CompleteSuiteResult } from "./penetration-test-config";

const execAsync = promisify(exec);

/**
 * Run the complete fenrir exploit suite
 */
export async function runCompleteFenrirSuite(
  options: Record<string, unknown> = {},
): Promise<CompleteSuiteResult> {
  const startTime = Date.now();

  try {
    const fenrirPath = path.join(process.cwd(), "..", "fenrir");
    const pythonPath =
      process.env.PYTHON_PATH ||
      "bash -c 'source ~/venv/bin/activate && python3'";

    const command = `${pythonPath} run_all_exploits.py --url ${options.target || "http://localhost:8000"} ${options.verbose ? "--verbose" : ""} ${options.destructive ? "--destructive" : ""}`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: 120000, // Longer timeout for full suite
      cwd: fenrirPath,
    });

    if (stderr && !stderr.includes("Warning")) {
      console.warn(`⚠️ Suite warning: ${stderr}`);
    }

    // Parse the output to extract results
    const executionTime = Date.now() - startTime;

    // Extract vulnerability count from output
    const vulnerabilityMatch = stdout.match(
      /Total Vulnerabilities Found: (\d+)/,
    );
    const totalVulnerabilities = vulnerabilityMatch
      ? parseInt(vulnerabilityMatch[1])
      : 0;

    // Extract exploits run count
    const exploitsMatch = stdout.match(/Total Exploits Executed: (\d+)/);
    const exploitsRun = exploitsMatch ? parseInt(exploitsMatch[1]) : 0;

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
  } catch (error) {
    console.error(`❌ Complete suite failed:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      totalVulnerabilities: 0,
      exploitsRun: 0,
      executionTime: Date.now() - startTime,
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
}

// Import the utility functions we need
import { determineSecurityRating } from "./penetration-test-config";
