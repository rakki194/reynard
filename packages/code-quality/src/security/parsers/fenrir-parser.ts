/**
 * 🐺 Fenrir Fuzzing Parser
 *
 * *snarls with predatory intelligence* Parses Fenrir fuzzing analysis output
 * and converts it to standardized vulnerability format.
 */

import type { SecurityVulnerability } from "../types";

/**
 * 🦊 Parse Fenrir fuzzing output
 */
export function parseFenrirOutput(output: string): SecurityVulnerability[] {
  const vulnerabilities: SecurityVulnerability[] = [];
  const lines = output.split("\n");
  let currentVulnerability: Partial<SecurityVulnerability> | null = null;

  for (const line of lines) {
    if (line.includes("🚨 VULNERABILITY DETECTED")) {
      currentVulnerability = finalizeVulnerability(currentVulnerability, vulnerabilities);
    } else if (currentVulnerability) {
      parseVulnerabilityField(line, currentVulnerability);
    }
  }

  finalizeVulnerability(currentVulnerability, vulnerabilities);
  return vulnerabilities;
}

/**
 * 🦊 Finalize and add vulnerability to results
 */
function finalizeVulnerability(
  currentVulnerability: Partial<SecurityVulnerability> | null,
  vulnerabilities: SecurityVulnerability[]
): Partial<SecurityVulnerability> {
  if (currentVulnerability) {
    vulnerabilities.push(currentVulnerability as SecurityVulnerability);
  }
  return {
    tool: "fenrir-fuzzing",
    createdAt: new Date(),
  };
}

/**
 * 🦊 Parse individual vulnerability field
 */
function parseVulnerabilityField(line: string, vulnerability: Partial<SecurityVulnerability>): void {
  if (line.includes("Type:")) {
    vulnerability.type = mapFenrirVulnerabilityType(line.split("Type:")[1].trim());
  } else if (line.includes("Severity:")) {
    vulnerability.severity = mapFenrirSeverity(line.split("Severity:")[1].trim());
  } else if (line.includes("File:")) {
    vulnerability.file = line.split("File:")[1].trim();
  } else if (line.includes("Line:")) {
    vulnerability.line = parseInt(line.split("Line:")[1].trim());
  } else if (line.includes("Description:")) {
    vulnerability.description = line.split("Description:")[1].trim();
  }
}

/**
 * 🦊 Map Fenrir vulnerability type to standard type
 */
function mapFenrirVulnerabilityType(type: string): SecurityVulnerability["type"] {
  const typeMap: Record<string, SecurityVulnerability["type"]> = {
    SQL_INJECTION: "SQL_INJECTION",
    XSS: "XSS",
    PATH_TRAVERSAL: "PATH_TRAVERSAL",
    COMMAND_INJECTION: "COMMAND_INJECTION",
    AUTH_BYPASS: "AUTHENTICATION_BYPASS",
    INFO_DISCLOSURE: "INFORMATION_DISCLOSURE",
    CSRF: "CSRF",
  };
  return typeMap[type] || "OTHER";
}

/**
 * 🦊 Map Fenrir severity to standard severity
 */
function mapFenrirSeverity(severity: string): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" {
  const severityMap: Record<string, "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"> = {
    CRITICAL: "CRITICAL",
    HIGH: "HIGH",
    MEDIUM: "MEDIUM",
    LOW: "LOW",
    INFO: "INFO",
  };
  return severityMap[severity] || "MEDIUM";
}
