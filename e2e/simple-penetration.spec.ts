import { test, expect } from "@playwright/test";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

interface PenetrationTestResult {
  success: boolean;
  vulnerabilitiesFound: number;
  details: Array<{
    type: string;
    description: string;
    impact: string;
  }>;
  executionTime: number;
}

/**
 * Run a fenrir exploit and return structured results
 */
async function runFenrirExploit(
  exploitModule: string,
  options: any = {},
): Promise<PenetrationTestResult> {
  const startTime = Date.now();

  try {
    const fenrirPath = path.join(process.cwd(), "..", "fenrir");
    const pythonPath = process.env.PYTHON_PATH || "bash -c 'source ~/venv/bin/activate && python3'";

    // Build command to run specific exploit
    const timeout = options.timeout || 30000; // Default 30 second timeout
    const command = `${pythonPath} -c "
import sys
sys.path.append('${fenrirPath}')
from ${exploitModule} import *
import json

# Run the exploit
exploit = ${getExploitClassName(exploitModule)}('${options.target || "http://localhost:8888"}')
result = exploit.run_exploit()

# Return results as JSON
print(json.dumps({
    'success': True,
    'vulnerabilities_found': len([r for r in result if hasattr(r, 'success') and r.success]),
    'details': [{'type': r.vulnerability_type, 'description': r.description, 'impact': r.impact} for r in result if hasattr(r, 'vulnerability_type')],
    'execution_time': 0
}))
"`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: timeout,
      cwd: fenrirPath,
    });

    if (stderr && !stderr.includes("Warning")) {
      console.warn(`⚠️ Exploit warning: ${stderr}`);
    }

    const result = JSON.parse(stdout.trim());
    const executionTime = Date.now() - startTime;

    return {
      success: result.success,
      vulnerabilitiesFound: result.vulnerabilities_found,
      details: result.details || [],
      executionTime,
    };
  } catch (error: any) {
    console.error(`❌ Exploit ${exploitModule} failed:`, error.message);
    return {
      success: false,
      vulnerabilitiesFound: 0,
      details: [{ type: "Error", description: error.message, impact: "Unknown" }],
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Get the exploit class name from module path
 */
function getExploitClassName(modulePath: string): string {
  const parts = modulePath.split(".");
  const moduleName = parts[parts.length - 1];
  
  // Map of module names to actual class names
  const classMap: Record<string, string> = {
    // Fuzzing modules
    "comprehensive_fuzzer": "ComprehensiveFuzzerExploit",
    "endpoint_fuzzer": "EndpointFuzzerExploit",
    "exploit_wrappers": "ComprehensiveFuzzerExploit", // Default to comprehensive fuzzer
  };
  
  // Return mapped class name or generate default
  if (classMap[moduleName]) {
    return classMap[moduleName];
  }
  
  // Fallback: generate class name without "Exploit" suffix
  const className = moduleName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  return className;
}

test.describe("🐺 Simple Penetration Testing", () => {
  test("should run fuzzing exploit successfully", async () => {
    const result = await runFenrirExploit("fuzzing.exploit_wrappers", {
      target: "http://localhost:8888",
      timeout: 30000, // 30 second timeout
    });

    expect(result.success).toBe(true);
    expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    expect(result.executionTime).toBeLessThan(30000); // Should complete within timeout
    console.log(`✅ Fuzzing completed in ${result.executionTime}ms`);
    console.log(`📊 Vulnerabilities found: ${result.vulnerabilitiesFound}`);
  });
});
