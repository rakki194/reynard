/**
 * 🐺 ESLint Security Parser
 *
 * *snarls with predatory intelligence* Parses ESLint security analysis output
 * and converts it to standardized vulnerability format.
 */

import type { SecurityVulnerability } from "../types";

/**
 * 🦊 Parse ESLint security output
 */
export function parseESLintSecurityOutput(output: string): SecurityVulnerability[] {
  const vulnerabilities: SecurityVulnerability[] = [];

  try {
    const results = JSON.parse(output);

    for (const result of results) {
      for (const message of result.messages) {
        if (isSecurityRule(message.ruleId)) {
          vulnerabilities.push({
            id: `eslint-${message.ruleId}-${result.filePath}-${message.line}`,
            type: mapESLintSecurityRule(message.ruleId),
            severity: mapESLintSeverity(message.severity),
            title: message.message,
            description: message.message,
            file: result.filePath,
            line: message.line,
            column: message.column,
            remediation: getESLintSecurityRemediation(message.ruleId),
            confidence: "MEDIUM",
            tool: "eslint-security",
            createdAt: new Date(),
          });
        }
      }
    }
  } catch (error) {
    console.warn("⚠️ Failed to parse ESLint security output:", error);
  }

  return vulnerabilities;
}

/**
 * 🦊 Check if ESLint rule is a security rule
 */
function isSecurityRule(ruleId: string): boolean {
  const securityRules = [
    "security/detect-object-injection",
    "security/detect-non-literal-regexp",
    "security/detect-unsafe-regex",
    "security/detect-buffer-noassert",
    "security/detect-child-process",
    "security/detect-disable-mustache-escape",
    "security/detect-eval-with-expression",
    "security/detect-no-csrf-before-method-override",
    "security/detect-non-literal-fs-filename",
    "security/detect-non-literal-require",
    "security/detect-possible-timing-attacks",
    "security/detect-pseudoRandomBytes",
  ];
  return securityRules.includes(ruleId);
}

/**
 * 🦊 Map ESLint security rule to vulnerability type
 */
function mapESLintSecurityRule(ruleId: string): SecurityVulnerability["type"] {
  const ruleMap: Record<string, SecurityVulnerability["type"]> = {
    "security/detect-object-injection": "INFORMATION_DISCLOSURE",
    "security/detect-non-literal-regexp": "SECURITY_MISCONFIGURATION",
    "security/detect-unsafe-regex": "SECURITY_MISCONFIGURATION",
    "security/detect-child-process": "COMMAND_INJECTION",
    "security/detect-eval-with-expression": "COMMAND_INJECTION",
    "security/detect-non-literal-fs-filename": "PATH_TRAVERSAL",
    "security/detect-possible-timing-attacks": "AUTHENTICATION_BYPASS",
  };
  return ruleMap[ruleId] || "OTHER";
}

/**
 * 🦊 Map ESLint severity to standard severity
 */
function mapESLintSeverity(severity: number): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" {
  switch (severity) {
    case 2:
      return "HIGH";
    case 1:
      return "MEDIUM";
    default:
      return "LOW";
  }
}

/**
 * 🦊 Get ESLint security remediation
 */
function getESLintSecurityRemediation(ruleId: string): string {
  const remediations: Record<string, string> = {
    "security/detect-object-injection": "Use parameterized queries or input validation",
    "security/detect-non-literal-regexp": "Use literal regex patterns or validate input",
    "security/detect-unsafe-regex": "Use safe regex patterns to prevent ReDoS",
    "security/detect-child-process": "Validate and sanitize command inputs",
    "security/detect-eval-with-expression": "Avoid eval() with user input",
    "security/detect-non-literal-fs-filename": "Validate file paths to prevent directory traversal",
    "security/detect-possible-timing-attacks": "Use constant-time comparison for sensitive operations",
  };
  return remediations[ruleId] || "Review and fix the security issue";
}
