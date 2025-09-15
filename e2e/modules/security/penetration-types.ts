/**
 * 🐺 PENETRATION TESTING TYPES
 *
 * *snarls with predatory precision* Type definitions for penetration testing
 * and security assessment functionality.
 */

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
 * Vulnerability Detail
 */
export interface VulnerabilityDetail {
  type: string;
  description: string;
  impact: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  payload?: string;
  response?: string;
  statusCode?: number;
}

/**
 * Exploit Options
 */
export interface ExploitOptions {
  target?: string;
  verbose?: boolean;
  destructive?: boolean;
  maxPayloads?: number;
  quickTest?: boolean;
  timeout?: number;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}

/**
 * Exploit Result
 */
export interface ExploitResult {
  success: boolean;
  vulnerabilities_found: number;
  details: VulnerabilityDetail[];
  execution_time: number;
  error?: string;
}

/**
 * Penetration Test Result
 */
export interface PenetrationResult {
  exploitName: string;
  success: boolean;
  vulnerabilitiesFound: number;
  executionTime: number;
  details: VulnerabilityDetail[] | { error: string };
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
 * Severity Level
 */
export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
