/**
 * 🐺 Fenrir Exploit Runner
 * 
 * *snarls with predatory intelligence* Utility functions for executing
 * fenrir security exploits from the Reynard penetration testing suite.
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import type { PenetrationTestResult } from "./penetration-test-config";
import { getExploitClassName } from "./fenrir-class-mapper";
import { determineSeverity } from "./penetration-test-config";

const execAsync = promisify(exec);

/**
 * Build command for running a specific fenrir exploit
 */
function buildExploitCommand(
  exploitModule: string,
  options: Record<string, unknown>,
  fenrirPath: string,
  pythonPath: string,
): string {
  return `${pythonPath} -c "
import sys
sys.path.append('${fenrirPath}')
from ${exploitModule} import *
import json

# Run the exploit
exploit = ${getExploitClassName(exploitModule)}('${options.target || "http://localhost:8000"}')
result = exploit.run_exploit()

# Return results as JSON
print(json.dumps({
    'success': True,
    'vulnerabilities_found': len([r for r in result if hasattr(r, 'success') and r.success]),
    'details': [{'type': r.vulnerability_type, 'description': r.description, 'impact': r.impact} for r in result if hasattr(r, 'vulnerability_type')],
    'execution_time': 0
}))
"`;
}

/**
 * Parse exploit execution result
 */
function parseExploitResult(
  stdout: string,
  exploitModule: string,
  executionTime: number,
): PenetrationTestResult {
  const result = JSON.parse(stdout);
  
  return {
    exploitName: exploitModule,
    success: result.success,
    vulnerabilitiesFound: result.vulnerabilities_found || 0,
    executionTime,
    details: result.details || [],
    severity: determineSeverity(result.vulnerabilities_found || 0),
  };
}

/**
 * Handle exploit execution error
 */
function handleExploitError(
  error: unknown,
  exploitModule: string,
  executionTime: number,
): PenetrationTestResult {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`❌ Exploit ${exploitModule} failed:`, error);

  return {
    exploitName: exploitModule,
    success: false,
    vulnerabilitiesFound: 0,
    executionTime,
    details: { errorMessage },
    severity: "LOW",
  };
}

/**
 * Run a specific fenrir exploit
 */
export async function runFenrirExploit(
  exploitModule: string,
  options: Record<string, unknown> = {},
): Promise<PenetrationTestResult> {
  const startTime = Date.now();

  try {
    const fenrirPath = path.join(process.cwd(), "..", "fenrir");
    const pythonPath =
      process.env.PYTHON_PATH ||
      "bash -c 'source ~/venv/bin/activate && python3'";

    const command = buildExploitCommand(exploitModule, options, fenrirPath, pythonPath);
    const timeout = options.timeout || 60000;

    const { stdout, stderr } = await execAsync(command, {
      timeout: timeout as number,
      cwd: fenrirPath,
    });

    if (stderr && !stderr.includes("Warning")) {
      console.warn(`⚠️ Exploit warning: ${stderr}`);
    }

    const executionTime = Date.now() - startTime;
    return parseExploitResult(stdout, exploitModule, executionTime);
  } catch (error) {
    const executionTime = Date.now() - startTime;
    return handleExploitError(error, exploitModule, executionTime);
  }
}


