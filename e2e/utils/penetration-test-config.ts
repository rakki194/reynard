/**
 * 🐺 Penetration Test Configuration
 * 
 * *snarls with precision* Centralized configuration for all penetration testing
 * modules in the Reynard security testing suite.
 */

/**
 * Penetration Test Configuration
 */
export interface PenetrationTestConfig {
  targetUrl: string;
  backendUrl: string;
  destructive: boolean;
  verbose: boolean;
  timeout: number;
}

/**
 * Penetration Test Details
 */
export interface PenetrationTestDetails {
  requestUrl?: string;
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  errorMessage?: string;
  payload?: string;
  attackVector?: string;
  evidence?: string[];
  recommendations?: string[];
}

/**
 * Complete Suite Details
 */
export interface CompleteSuiteDetails {
  testResults: PenetrationTestResult[];
  summary: {
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
  };
  recommendations: string[];
  timestamp: string;
}

/**
 * Penetration Test Result
 */
export interface PenetrationTestResult {
  exploitName: string;
  success: boolean;
  vulnerabilitiesFound: number;
  executionTime: number;
  details: PenetrationTestDetails;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

/**
 * Complete Suite Result
 */
export interface CompleteSuiteResult {
  success: boolean;
  totalVulnerabilities: number;
  exploitsRun: number;
  executionTime: number;
  securityRating: string;
  details: CompleteSuiteDetails;
}

/**
 * Default penetration test configuration
 */
export const createDefaultConfig = (): PenetrationTestConfig => ({
  targetUrl: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
  backendUrl: process.env.BACKEND_URL || "http://localhost:8000",
  destructive: process.env.DESTRUCTIVE_TESTING === "true",
  verbose: process.env.VERBOSE_TESTING === "true",
  timeout: 60000, // 60 seconds for penetration tests
});

/**
 * Determine severity based on vulnerability count
 */
export function determineSeverity(
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
export function determineSecurityRating(count: number): string {
  if (count >= 5) return "CRITICAL - Multiple vulnerabilities found";
  if (count >= 3) return "HIGH RISK - Significant vulnerabilities found";
  if (count >= 1) return "MEDIUM RISK - Some vulnerabilities found";
  return "SECURE - No vulnerabilities found";
}

