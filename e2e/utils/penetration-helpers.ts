/**
 * 🐺 PENETRATION TESTING HELPERS ... OwO
 *
 * *snarls with predatory glee* Helper functions for integrating fenrir exploits
 * with E2E authentication tests for comprehensive security testing.
 */

import { ExploitRunner } from "./exploit-runner";
import { SecurityAssessor } from "./security-assessor";
import type {
  PenetrationConfig,
  PenetrationResult,
  SecurityAssessment,
} from "./penetration-types";

// Re-export types for convenience
export type {
  PenetrationConfig,
  PenetrationResult,
  SecurityAssessment,
  ExploitOptions,
  VulnerabilityDetail,
  ExploitResult,
  SeverityLevel,
} from "./penetration-types";

/**
 * Penetration Testing Helper Class
 */
export class PenetrationTestHelper {
  private config: PenetrationConfig;
  private exploitRunner: ExploitRunner;
  private securityAssessor: SecurityAssessor;

  constructor(config: Partial<PenetrationConfig> = {}) {
    this.config = {
      targetUrl: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
      backendUrl: process.env.BACKEND_URL || "http://localhost:8000",
      destructive: process.env.DESTRUCTIVE_TESTING === "true",
      verbose: process.env.VERBOSE_TESTING === "true",
      timeout: 60000,
      maxConcurrent: 5,
      ...config,
    };

    this.exploitRunner = new ExploitRunner({
      timeout: this.config.timeout,
      backendUrl: this.config.backendUrl,
      verbose: this.config.verbose,
      destructive: this.config.destructive,
    });

    this.securityAssessor = new SecurityAssessor({
      backendUrl: this.config.backendUrl,
      verbose: this.config.verbose,
      destructive: this.config.destructive,
      timeout: this.config.timeout,
    });
  }

  /**
   * Run JWT security tests
   */
  async testJWTSecurity(): Promise<PenetrationResult[]> {
    return this.runTestSuite([
      "jwt_exploits.secret_key_attack",
      "jwt_exploits.signature_bypass",
      "jwt_exploits.timing_attack",
      "jwt_exploits.token_replay",
    ]);
  }

  /**
   * Run SQL injection tests
   */
  async testSQLInjection(): Promise<PenetrationResult[]> {
    return this.runTestSuite([
      "sql_injection.regex_bypass",
      "sql_injection.blind_injection",
      "sql_injection.obfuscated_payloads",
      "sql_injection.union_attacks",
    ]);
  }

  /**
   * Run path traversal tests
   */
  async testPathTraversal(): Promise<PenetrationResult[]> {
    return this.runTestSuite([
      "path_traversal.encoded_traversal",
      "path_traversal.unicode_bypass",
      "path_traversal.double_encoded",
      "path_traversal.windows_bypass",
    ]);
  }

  /**
   * Run comprehensive fuzzing tests
   */
  async testFuzzing(): Promise<PenetrationResult[]> {
    return this.runTestSuite([
      "fuzzing.comprehensive_fuzzer",
      "fuzzing.endpoint_fuzzer",
    ], { maxPayloads: 50 });
  }

  /**
   * Run authentication-specific security tests
   */
  async testAuthenticationSecurity(): Promise<PenetrationResult[]> {
    return this.runTestSuite([
      "rate_limiting.rate_limit_bypass",
      "cors_exploits.cors_misconfiguration",
      "csrf_exploits.csrf_attacks",
    ]);
  }

  /**
   * Run a test suite with common options
   */
  private async runTestSuite(
    tests: string[],
    options: { maxPayloads?: number } = {},
  ): Promise<PenetrationResult[]> {
    const results: PenetrationResult[] = [];

    for (const test of tests) {
      const result = await this.exploitRunner.runExploit(test, {
        target: this.config.backendUrl,
        verbose: this.config.verbose,
        destructive: this.config.destructive,
        ...options,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Run complete security assessment
   */
  async runCompleteSecurityAssessment(): Promise<SecurityAssessment> {
    return this.securityAssessor.runCompleteSecurityAssessment();
  }

  /**
   * Generate security report
   */
  async generateSecurityReport(): Promise<string> {
    return this.securityAssessor.generateSecurityReport(this.config.backendUrl);
  }
}