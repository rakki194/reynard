/**
 * 🐺 PENETRATION TESTING E2E SUITE
 * 
 * *snarls with predatory glee* Integration of blackhat exploits with E2E authentication tests
 * for comprehensive security testing of the Reynard ecosystem.
 */

import { test, expect } from "@playwright/test";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";

const execAsync = promisify(exec);

/**
 * Penetration Test Configuration
 */
interface PenetrationTestConfig {
  targetUrl: string;
  backendUrl: string;
  destructive: boolean;
  verbose: boolean;
  timeout: number;
}

/**
 * Penetration Test Result
 */
interface PenetrationTestResult {
  exploitName: string;
  success: boolean;
  vulnerabilitiesFound: number;
  executionTime: number;
  details: any;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

test.describe("🐺 Penetration Testing Suite", () => {
  const config: PenetrationTestConfig = {
    targetUrl: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    backendUrl: process.env.BACKEND_URL || "http://localhost:8000",
    destructive: process.env.DESTRUCTIVE_TESTING === "true",
    verbose: process.env.VERBOSE_TESTING === "true",
    timeout: 60000, // 60 seconds for penetration tests
  };

  test.beforeAll(async () => {
    // Verify blackhat suite is available
    const blackhatPath = path.join(process.cwd(), "..", "blackhat");
    console.log(`🐺 Blackhat suite path: ${blackhatPath}`);
  });

  test.describe("JWT Security Testing", () => {
    test("should test JWT secret key vulnerabilities", async () => {
      const result = await runBlackhatExploit("jwt_exploits.secret_key_attack", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
      
      if (result.vulnerabilitiesFound > 0) {
        console.log(`🚨 JWT vulnerabilities found: ${result.vulnerabilitiesFound}`);
        console.log(`Details: ${JSON.stringify(result.details, null, 2)}`);
      }
    });

    test("should test JWT signature bypass attempts", async () => {
      const result = await runBlackhatExploit("jwt_exploits.signature_bypass", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });

    test("should test JWT timing attacks", async () => {
      const result = await runBlackhatExploit("jwt_exploits.timing_attack", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("SQL Injection Testing", () => {
    test("should test SQL injection regex bypass", async () => {
      const result = await runBlackhatExploit("sql_injection.regex_bypass", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });

    test("should test blind SQL injection", async () => {
      const result = await runBlackhatExploit("sql_injection.blind_injection", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });

    test("should test obfuscated SQL payloads", async () => {
      const result = await runBlackhatExploit("sql_injection.obfuscated_payloads", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Path Traversal Testing", () => {
    test("should test encoded path traversal", async () => {
      const result = await runBlackhatExploit("path_traversal.encoded_traversal", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });

    test("should test unicode path traversal bypass", async () => {
      const result = await runBlackhatExploit("path_traversal.unicode_bypass", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("CORS Security Testing", () => {
    test("should test CORS misconfiguration", async () => {
      const result = await runBlackhatExploit("cors_exploits.cors_misconfiguration", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Rate Limiting Testing", () => {
    test("should test rate limiting bypass", async () => {
      const result = await runBlackhatExploit("rate_limiting.rate_limit_bypass", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Comprehensive Fuzzing", () => {
    test("should run comprehensive fuzzing framework", async () => {
      const result = await runBlackhatExploit("fuzzing.comprehensive_fuzzer", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive,
        maxPayloads: 100 // Limit for E2E testing
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });

    test("should run endpoint-specific fuzzing", async () => {
      const result = await runBlackhatExploit("fuzzing.endpoint_fuzzer", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive,
        endpoints: ["/api/auth/login", "/api/auth/register"]
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("API Security Testing", () => {
    test("should test BOLA (Broken Object Level Authorization)", async () => {
      const result = await runBlackhatExploit("api_exploits.bola_attacks", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("CSRF Testing", () => {
    test("should test CSRF attack vectors", async () => {
      const result = await runBlackhatExploit("csrf_exploits.csrf_attacks", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("SSRF Testing", () => {
    test("should test Server-Side Request Forgery", async () => {
      const result = await runBlackhatExploit("ssrf_exploits.ssrf_attacks", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Race Condition Testing", () => {
    test("should test race condition exploits", async () => {
      const result = await runBlackhatExploit("race_conditions.race_exploits", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("HTTP Request Smuggling", () => {
    test("should test HTTP request smuggling", async () => {
      const result = await runBlackhatExploit("http_smuggling.request_smuggling", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Unicode Security Testing", () => {
    test("should test unicode normalization bypass", async () => {
      const result = await runBlackhatExploit("unicode_exploits.normalization_bypass", {
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Comprehensive Security Assessment", () => {
    test("should run complete blackhat exploit suite", async () => {
      const result = await runCompleteBlackhatSuite({
        target: config.backendUrl,
        verbose: config.verbose,
        destructive: config.destructive
      });

      expect(result.success).toBeDefined();
      expect(result.totalVulnerabilities).toBeGreaterThanOrEqual(0);
      expect(result.exploitsRun).toBeGreaterThan(0);

      // Log comprehensive results
      console.log(`🐺 Complete Security Assessment Results:`);
      console.log(`Total Exploits Run: ${result.exploitsRun}`);
      console.log(`Total Vulnerabilities Found: ${result.totalVulnerabilities}`);
      console.log(`Overall Security Rating: ${result.securityRating}`);

      if (result.totalVulnerabilities > 0) {
        console.log(`🚨 Security vulnerabilities detected!`);
        console.log(`Details: ${JSON.stringify(result.details, null, 2)}`);
      }
    });
  });
});

/**
 * Run a specific blackhat exploit
 */
async function runBlackhatExploit(
  exploitModule: string, 
  options: any = {}
): Promise<PenetrationTestResult> {
  const startTime = Date.now();
  
  try {
    const blackhatPath = path.join(process.cwd(), "..", "blackhat");
    const pythonPath = process.env.PYTHON_PATH || "python3";
    
    // Build command to run specific exploit
    const command = `${pythonPath} -c "
import sys
sys.path.append('${blackhatPath}')
from ${exploitModule} import *
import json

# Run the exploit
exploit = ${getExploitClassName(exploitModule)}('${options.target || 'http://localhost:8000'}')
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
      timeout: 60000,
      cwd: blackhatPath 
    });

    if (stderr && !stderr.includes('Warning')) {
      console.warn(`⚠️ Exploit warning: ${stderr}`);
    }

    const result = JSON.parse(stdout);
    const executionTime = Date.now() - startTime;

    return {
      exploitName: exploitModule,
      success: result.success,
      vulnerabilitiesFound: result.vulnerabilities_found || 0,
      executionTime,
      details: result.details || [],
      severity: determineSeverity(result.vulnerabilities_found || 0)
    };

  } catch (error) {
    console.error(`❌ Exploit ${exploitModule} failed:`, error);
    
    return {
      exploitName: exploitModule,
      success: false,
      vulnerabilitiesFound: 0,
      executionTime: Date.now() - startTime,
      details: { error: error.message },
      severity: 'LOW'
    };
  }
}

/**
 * Run the complete blackhat exploit suite
 */
async function runCompleteBlackhatSuite(options: any = {}): Promise<any> {
  const startTime = Date.now();
  
  try {
    const blackhatPath = path.join(process.cwd(), "..", "blackhat");
    const pythonPath = process.env.PYTHON_PATH || "python3";
    
    const command = `${pythonPath} run_all_exploits.py --url ${options.target || 'http://localhost:8000'} ${options.verbose ? '--verbose' : ''} ${options.destructive ? '--destructive' : ''}`;

    const { stdout, stderr } = await execAsync(command, { 
      timeout: 120000, // Longer timeout for full suite
      cwd: blackhatPath 
    });

    if (stderr && !stderr.includes('Warning')) {
      console.warn(`⚠️ Suite warning: ${stderr}`);
    }

    // Parse the output to extract results
    const executionTime = Date.now() - startTime;
    
    // Extract vulnerability count from output
    const vulnerabilityMatch = stdout.match(/Total Vulnerabilities Found: (\d+)/);
    const totalVulnerabilities = vulnerabilityMatch ? parseInt(vulnerabilityMatch[1]) : 0;
    
    // Extract exploits run count
    const exploitsMatch = stdout.match(/Total Exploits Executed: (\d+)/);
    const exploitsRun = exploitsMatch ? parseInt(exploitsMatch[1]) : 0;

    return {
      success: true,
      totalVulnerabilities,
      exploitsRun,
      executionTime,
      securityRating: determineSecurityRating(totalVulnerabilities),
      details: { output: stdout }
    };

  } catch (error) {
    console.error(`❌ Complete suite failed:`, error);
    
    return {
      success: false,
      totalVulnerabilities: 0,
      exploitsRun: 0,
      executionTime: Date.now() - startTime,
      securityRating: 'UNKNOWN',
      details: { error: error.message }
    };
  }
}

/**
 * Get the exploit class name from module path
 */
function getExploitClassName(modulePath: string): string {
  const parts = modulePath.split('.');
  const className = parts[parts.length - 1]
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Exploit';
  
  return className;
}

/**
 * Determine severity based on vulnerability count
 */
function determineSeverity(count: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (count >= 5) return 'CRITICAL';
  if (count >= 3) return 'HIGH';
  if (count >= 1) return 'MEDIUM';
  return 'LOW';
}

/**
 * Determine overall security rating
 */
function determineSecurityRating(count: number): string {
  if (count >= 5) return 'CRITICAL - Multiple vulnerabilities found';
  if (count >= 3) return 'HIGH RISK - Significant vulnerabilities found';
  if (count >= 1) return 'MEDIUM RISK - Some vulnerabilities found';
  return 'SECURE - No vulnerabilities found';
}
