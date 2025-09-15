/**
 * 🐺 Fenrir LLM Exploits Parser
 *
 * *snarls with predatory intelligence* Parses Fenrir LLM exploits analysis output
 * and converts it to standardized vulnerability format.
 */

import type { SecurityVulnerability } from "../types";

/**
 * 🦊 Parse Fenrir LLM exploits output
 */
export function parseFenrirLLMOutput(output: string): SecurityVulnerability[] {
  const vulnerabilities: SecurityVulnerability[] = [];

  // Similar parsing logic for LLM-specific exploits
  const lines = output.split("\n");

  for (const line of lines) {
    if (line.includes("LLM_EXPLOIT_DETECTED")) {
      const parts = line.split("|");
      if (parts.length >= 4) {
        vulnerabilities.push({
          id: `fenrir-llm-${Date.now()}-${Math.random()}`,
          type: "OTHER" as SecurityVulnerability["type"],
          severity: "HIGH" as SecurityVulnerability["severity"],
          title: "LLM Exploit Detected",
          description: parts[1]?.trim() || "LLM-specific vulnerability detected",
          file: parts[2]?.trim() || "unknown",
          line: parseInt(parts[3]?.trim()) || undefined,
          remediation: "Review LLM input validation and output filtering",
          confidence: "HIGH",
          tool: "fenrir-llm",
          createdAt: new Date(),
        });
      }
    }
  }

  return vulnerabilities;
}
