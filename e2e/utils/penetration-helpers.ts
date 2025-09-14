/**
 * 🐺 PENETRATION TESTING HELPERS
 *
 * *snarls with predatory glee* Helper functions for integrating fenrir exploits
 * with E2E authentication tests for comprehensive security testing.
 */

import { Page, expect } from "@playwright/test";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

/**
 * Penetration Test Configuration
 */
export interface PenetrationConfig {
  targetUrl: string;
  backendUrl: string;
  destructive: boolean;
  verbose: boolean;
  timeout: number;
  maxConcurrent: number;
}

/**
 * Penetration Test Result
 */
export interface PenetrationResult {
  exploitName: string;
  success: boolean;
  vulnerabilitiesFound: number;
  executionTime: number;
  details: any;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendations?: string[];
}

/**
 * Security Assessment Summary
 */
export interface SecurityAssessment {
  totalVulnerabilities: number;
  exploitsRun: number;
  securityRating: string;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  recommendations: string[];
}

/**
 * Penetration Testing Helper Class
 */
export class PenetrationTestHelper {
  private page: Page;
  private config: PenetrationConfig;
  private fenrirPath: string;

  constructor(page: Page, config: Partial<PenetrationConfig> = {}) {
    this.page = page;
    this.config = {
      targetUrl: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
      backendUrl: process.env.BACKEND_URL || "http://localhost:8000",
      destructive: process.env.DESTRUCTIVE_TESTING === "true",
      verbose: process.env.VERBOSE_TESTING === "true",
      timeout: 60000,
      maxConcurrent: 5,
      ...config,
    };

    this.fenrirPath = path.join(process.cwd(), "..", "fenrir");
  }

  /**
   * Run JWT security tests
   */
  async testJWTSecurity(): Promise<PenetrationResult[]> {
    const jwtTests = [
      "jwt_exploits.secret_key_attack",
      "jwt_exploits.signature_bypass",
      "jwt_exploits.timing_attack",
      "jwt_exploits.token_replay",
    ];

    const results: PenetrationResult[] = [];

    for (const test of jwtTests) {
      const result = await this.runExploit(test, {
        target: this.config.backendUrl,
        verbose: this.config.verbose,
        destructive: this.config.destructive,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Run SQL injection tests
   */
  async testSQLInjection(): Promise<PenetrationResult[]> {
    const sqlTests = [
      "sql_injection.regex_bypass",
      "sql_injection.blind_injection",
      "sql_injection.obfuscated_payloads",
      "sql_injection.union_attacks",
    ];

    const results: PenetrationResult[] = [];

    for (const test of sqlTests) {
      const result = await this.runExploit(test, {
        target: this.config.backendUrl,
        verbose: this.config.verbose,
        destructive: this.config.destructive,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Run path traversal tests
   */
  async testPathTraversal(): Promise<PenetrationResult[]> {
    const pathTests = [
      "path_traversal.encoded_traversal",
      "path_traversal.unicode_bypass",
      "path_traversal.double_encoded",
      "path_traversal.windows_bypass",
    ];

    const results: PenetrationResult[] = [];

    for (const test of pathTests) {
      const result = await this.runExploit(test, {
        target: this.config.backendUrl,
        verbose: this.config.verbose,
        destructive: this.config.destructive,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Run comprehensive fuzzing tests
   */
  async testFuzzing(): Promise<PenetrationResult[]> {
    const fuzzingTests = [
      "fuzzing.comprehensive_fuzzer",
      "fuzzing.endpoint_fuzzer",
    ];

    const results: PenetrationResult[] = [];

    for (const test of fuzzingTests) {
      const result = await this.runExploit(test, {
        target: this.config.backendUrl,
        verbose: this.config.verbose,
        destructive: this.config.destructive,
        maxPayloads: 50, // Limit for E2E testing
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Run authentication-specific security tests
   */
  async testAuthenticationSecurity(): Promise<PenetrationResult[]> {
    const authTests = [
      "rate_limiting.rate_limit_bypass",
      "cors_exploits.cors_misconfiguration",
      "csrf_exploits.csrf_attacks",
    ];

    const results: PenetrationResult[] = [];

    for (const test of authTests) {
      const result = await this.runExploit(test, {
        target: this.config.backendUrl,
        verbose: this.config.verbose,
        destructive: this.config.destructive,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Run complete security assessment
   */
  async runCompleteSecurityAssessment(): Promise<SecurityAssessment> {
    const startTime = Date.now();

    try {
      const pythonPath = process.env.PYTHON_PATH || "bash -c 'source ~/venv/bin/activate && python3'";
      const command = `${pythonPath} run_all_exploits.py --url ${this.config.backendUrl} ${this.config.verbose ? "--verbose" : ""} ${this.config.destructive ? "--destructive" : ""}`;

      const { stdout, stderr } = await execAsync(command, {
        timeout: this.config.timeout * 2,
        cwd: this.fenrirPath,
      });

      if (stderr && !stderr.includes("Warning")) {
        console.warn(`⚠️ Security assessment warning: ${stderr}`);
      }

      const executionTime = Date.now() - startTime;

      // Parse results from output
      const vulnerabilityMatch = stdout.match(
        /Total Vulnerabilities Found: (\d+)/,
      );
      const totalVulnerabilities = vulnerabilityMatch
        ? parseInt(vulnerabilityMatch[1])
        : 0;

      const exploitsMatch = stdout.match(/Total Exploits Executed: (\d+)/);
      const exploitsRun = exploitsMatch ? parseInt(exploitsMatch[1]) : 0;

      // Categorize vulnerabilities by severity
      const criticalMatch = stdout.match(/🔴 CRITICAL.*?(\d+)/g);
      const highMatch = stdout.match(/🟠 HIGH.*?(\d+)/g);
      const mediumMatch = stdout.match(/🟡 MEDIUM.*?(\d+)/g);
      const lowMatch = stdout.match(/🟢 LOW.*?(\d+)/g);

      const criticalIssues = criticalMatch ? criticalMatch.length : 0;
      const highIssues = highMatch ? highMatch.length : 0;
      const mediumIssues = mediumMatch ? mediumMatch.length : 0;
      const lowIssues = lowMatch ? lowMatch.length : 0;

      return {
        totalVulnerabilities,
        exploitsRun,
        securityRating: this.determineSecurityRating(totalVulnerabilities),
        criticalIssues,
        highIssues,
        mediumIssues,
        lowIssues,
        recommendations:
          this.generateSecurityRecommendations(totalVulnerabilities),
      };
    } catch (error) {
      console.error(`❌ Security assessment failed:`, error);

      return {
        totalVulnerabilities: 0,
        exploitsRun: 0,
        securityRating: "ASSESSMENT_FAILED",
        criticalIssues: 0,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0,
        recommendations: ["Fix security assessment infrastructure"],
      };
    }
  }

  /**
   * Run a specific exploit
   */
  private async runExploit(
    exploitModule: string,
    options: any = {},
  ): Promise<PenetrationResult> {
    const startTime = Date.now();

    try {
      const pythonPath = process.env.PYTHON_PATH || "bash -c 'source ~/venv/bin/activate && python3'";

      const quickTestFlag = options.quickTest ? "quick_test=True" : "quick_test=False";
      
      const command = `${pythonPath} -c "
import sys
sys.path.append('${this.fenrirPath}')
from ${exploitModule} import *
import json

# Run the exploit
exploit = ${this.getExploitClassName(exploitModule)}('${options.target || this.config.backendUrl}')
result = exploit.run_exploit(${quickTestFlag})

# Return results as JSON
print(json.dumps({
    'success': True,
    'vulnerabilities_found': len([r for r in result if hasattr(r, 'success') and r.success]),
    'details': [{'type': r.vulnerability_type, 'description': r.description, 'impact': r.impact} for r in result if hasattr(r, 'vulnerability_type')],
    'execution_time': 0
}))
"`;

      const { stdout, stderr } = await execAsync(command, {
        timeout: this.config.timeout,
        cwd: this.fenrirPath,
      });

      if (stderr && !stderr.includes("Warning")) {
        console.warn(`⚠️ Exploit ${exploitModule} warning: ${stderr}`);
      }

      const result = JSON.parse(stdout);
      const executionTime = Date.now() - startTime;

      return {
        exploitName: exploitModule,
        success: result.success,
        vulnerabilitiesFound: result.vulnerabilities_found || 0,
        executionTime,
        details: result.details || [],
        severity: this.determineSeverity(result.vulnerabilities_found || 0),
        recommendations: this.generateExploitRecommendations(
          exploitModule,
          result.vulnerabilities_found || 0,
        ),
      };
    } catch (error) {
      console.error(`❌ Exploit ${exploitModule} failed:`, error);

      return {
        exploitName: exploitModule,
        success: false,
        vulnerabilitiesFound: 0,
        executionTime: Date.now() - startTime,
        details: { error: error.message },
        severity: "LOW",
        recommendations: [`Fix ${exploitModule} execution`],
      };
    }
  }

  /**
   * Get the exploit class name from module path
   */
  private getExploitClassName(modulePath: string): string {
    const parts = modulePath.split(".");
    const moduleName = parts[parts.length - 1];
    
    // Map of module names to actual class names
    const classMap: Record<string, string> = {
      // Fuzzing modules
      "comprehensive_fuzzer": "ComprehensiveFuzzerExploit",
      "endpoint_fuzzer": "EndpointFuzzerExploit",
      "exploit_wrappers": "ComprehensiveFuzzerExploit", // Default to comprehensive fuzzer
      
      // SQL Injection modules
      "basic_injection": "BasicInjectionExploit",
      "blind_injection": "BlindInjectionExploit", 
      "time_based_injection": "TimeBasedInjectionExploit",
      "union_injection": "UnionInjectionExploit",
      "obfuscated_payloads": "ObfuscatedPayloadExploit",
      "regex_bypass": "RegexBypassExploit",
      
      // API Exploits
      "bola_attacks": "BolaAttacksExploit",
      "idor_attacks": "IdorAttacksExploit",
      
      // CSRF Exploits
      "csrf_attacks": "CsrfAttacksExploit",
      "csrf_bypass": "CsrfBypassExploit",
      
      // Path Traversal
      "basic_traversal": "BasicTraversalExploit",
      "encoded_traversal": "EncodedPathTraversalExploit",
      "unicode_bypass": "UnicodeBypassExploit",
      "null_byte_injection": "NullByteInjectionExploit",
      "double_encoding": "DoubleEncodingExploit",
      
      // SSRF Exploits
      "ssrf_attacks": "SsrfAttacksExploit",
      "ssrf_bypass": "SsrfBypassExploit",
      
      // Race Conditions
      "race_exploits": "RaceExploitsExploit",
      "concurrent_attacks": "ConcurrentAttacksExploit",
      
      // CORS Exploits
      "cors_misconfiguration": "CorsMisconfigurationExploit",
      "cors_bypass": "CorsBypassExploit",
      
      // HTTP Smuggling
      "request_smuggling": "RequestSmugglingExploit",
      "response_smuggling": "ResponseSmugglingExploit",
      
      // Unicode Exploits
      "normalization_bypass": "NormalizationBypassExploit",
      "unicode_attacks": "UnicodeAttacksExploit",
      
      // Rate Limiting
      "rate_limit_bypass": "RateLimitBypassExploit",
      "rate_limit_attacks": "RateLimitAttacksExploit",
      
      // JWT Exploits
      "secret_key_attack": "SecretKeyVulnerabilityExploit",
      "algorithm_confusion": "AlgorithmConfusionExploit",
      "kid_manipulation": "KidManipulationExploit",
      "jwt_replay": "JwtReplayExploit",
      "jwt_injection": "JwtInjectionExploit",
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

  /**
   * Determine severity based on vulnerability count
   */
  private determineSeverity(
    count: number,
  ): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (count >= 5) return "CRITICAL";
    if (count >= 3) return "HIGH";
    if (count >= 1) return "MEDIUM";
    return "LOW";
  }

  /**
   * Determine overall security rating
   */
  private determineSecurityRating(count: number): string {
    if (count >= 5) return "CRITICAL - Multiple vulnerabilities found";
    if (count >= 3) return "HIGH RISK - Significant vulnerabilities found";
    if (count >= 1) return "MEDIUM RISK - Some vulnerabilities found";
    return "SECURE - No vulnerabilities found";
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(
    vulnerabilityCount: number,
  ): string[] {
    const recommendations = [
      "🔐 Authentication & Authorization:",
      "  • Use persistent, secure JWT secret keys",
      "  • Implement proper token rotation",
      "  • Add rate limiting to authentication endpoints",
      "  • Use strong password policies",
      "",
      "🛡️ Input Validation & Sanitization:",
      "  • Use parameterized queries exclusively",
      "  • Implement comprehensive input validation",
      "  • Add multiple layers of validation",
      "  • Use allowlists instead of blocklists",
      "",
      "📁 File Security:",
      "  • Implement proper path validation",
      "  • Use secure file upload handling",
      "  • Add file type validation",
      "  • Implement file size limits",
      "",
      "🔒 Error Handling:",
      "  • Sanitize all error messages",
      "  • Implement structured logging",
      "  • Add proper exception handling",
      "  • Prevent information disclosure",
      "",
      "🌐 Network Security:",
      "  • Configure proper CORS policies",
      "  • Use HTTPS in production",
      "  • Implement security headers",
      "  • Add request validation",
    ];

    if (vulnerabilityCount > 0) {
      recommendations.unshift("🚨 IMMEDIATE ACTION REQUIRED:");
      recommendations.unshift(
        "  • Review and fix all identified vulnerabilities",
      );
      recommendations.unshift("  • Implement additional security controls");
      recommendations.unshift("  • Conduct regular security assessments");
    }

    return recommendations;
  }

  /**
   * Generate exploit-specific recommendations
   */
  private generateExploitRecommendations(
    exploitModule: string,
    vulnerabilityCount: number,
  ): string[] {
    if (vulnerabilityCount === 0) {
      return [`✅ ${exploitModule} - No vulnerabilities found`];
    }

    const recommendations: string[] = [];

    if (exploitModule.includes("jwt")) {
      recommendations.push("🔐 JWT Security Recommendations:");
      recommendations.push("  • Use persistent, secure secret keys");
      recommendations.push("  • Implement proper token rotation");
      recommendations.push("  • Add token validation middleware");
    }

    if (exploitModule.includes("sql")) {
      recommendations.push("🛡️ SQL Injection Prevention:");
      recommendations.push("  • Use parameterized queries exclusively");
      recommendations.push("  • Implement input validation");
      recommendations.push("  • Add database access controls");
    }

    if (exploitModule.includes("path")) {
      recommendations.push("📁 Path Traversal Prevention:");
      recommendations.push("  • Implement proper path validation");
      recommendations.push("  • Use allowlists for file access");
      recommendations.push("  • Add file system access controls");
    }

    if (exploitModule.includes("cors")) {
      recommendations.push("🌐 CORS Security:");
      recommendations.push("  • Configure specific allowed origins");
      recommendations.push("  • Avoid wildcard origins");
      recommendations.push("  • Implement proper CORS headers");
    }

    if (exploitModule.includes("rate")) {
      recommendations.push("⚡ Rate Limiting:");
      recommendations.push("  • Implement proper rate limiting");
      recommendations.push("  • Add IP-based restrictions");
      recommendations.push("  • Monitor for bypass attempts");
    }

    return recommendations;
  }

  /**
   * Generate security report
   */
  async generateSecurityReport(): Promise<string> {
    const assessment = await this.runCompleteSecurityAssessment();

    const report = `
🐺 REYNARD SECURITY ASSESSMENT REPORT
=====================================

📊 OVERALL ASSESSMENT
- Total Vulnerabilities Found: ${assessment.totalVulnerabilities}
- Exploits Executed: ${assessment.exploitsRun}
- Security Rating: ${assessment.securityRating}

🚨 VULNERABILITY BREAKDOWN
- Critical Issues: ${assessment.criticalIssues}
- High Issues: ${assessment.highIssues}
- Medium Issues: ${assessment.mediumIssues}
- Low Issues: ${assessment.lowIssues}

🛡️ SECURITY RECOMMENDATIONS
${assessment.recommendations.map((rec) => `- ${rec}`).join("\n")}

Generated: ${new Date().toISOString()}
Target: ${this.config.backendUrl}
`;

    return report;
  }
}
