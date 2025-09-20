/**
 * 🐺 Bandit Security Parser
 *
 * *snarls with predatory intelligence* Parses Bandit security analysis output
 * and converts it to standardized vulnerability format.
 */

import type { SecurityVulnerability } from "../types";

/**
 * 🦊 Parse Bandit output
 */
export function parseBanditOutput(output: string): SecurityVulnerability[] {
  const vulnerabilities: SecurityVulnerability[] = [];

  try {
    const result = JSON.parse(output);

    for (const issue of result.results || []) {
      vulnerabilities.push({
        id: `bandit-${issue.test_id}-${issue.filename}-${issue.line_number}`,
        type: "OTHER" as SecurityVulnerability["type"],
        severity: mapBanditSeverity(issue.severity),
        title: issue.test_name,
        description: issue.issue_text,
        file: issue.filename,
        line: issue.line_number,
        cwe: issue.cwe,
        remediation: issue.more_info,
        confidence: mapBanditConfidence(issue.confidence),
        tool: "bandit",
        createdAt: new Date(),
      });
    }
  } catch (error) {
    console.warn("⚠️ Failed to parse Bandit output:", error);
  }

  return vulnerabilities;
}

/**
 * 🦊 Map Bandit severity to standard severity
 */
function mapBanditSeverity(severity: string): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" {
  const severityMap: Record<string, "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"> = {
    HIGH: "HIGH",
    MEDIUM: "MEDIUM",
    LOW: "LOW",
  };
  return severityMap[severity] || "INFO";
}

/**
 * 🦊 Map Bandit confidence to standard confidence
 */
function mapBanditConfidence(confidence: string): "HIGH" | "MEDIUM" | "LOW" {
  const confidenceMap: Record<string, "HIGH" | "MEDIUM" | "LOW"> = {
    HIGH: "HIGH",
    MEDIUM: "MEDIUM",
    LOW: "LOW",
  };
  return confidenceMap[confidence] || "MEDIUM";
}
