/**
 * 🐺 Security Analysis Utilities
 *
 * *snarls with predatory intelligence* Utility functions for security analysis
 * result processing and summary calculation.
 */

import type { SecurityAnalysisResult, SecurityHotspot, SecurityVulnerability } from "../types";

/**
 * 🦊 Remove duplicate vulnerabilities
 */
export function removeDuplicateVulnerabilities(vulnerabilities: SecurityVulnerability[]): SecurityVulnerability[] {
  const seen = new Set<string>();
  return vulnerabilities.filter(vuln => {
    const key = `${vuln.type}-${vuln.file}-${vuln.line}-${vuln.title}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * 🦊 Remove duplicate hotspots
 */
export function removeDuplicateHotspots(hotspots: SecurityHotspot[]): SecurityHotspot[] {
  const seen = new Set<string>();
  return hotspots.filter(hotspot => {
    const key = `${hotspot.type}-${hotspot.file}-${hotspot.line}-${hotspot.title}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * 🐺 Calculate security summary
 */
export function calculateSecuritySummary(
  vulnerabilities: SecurityVulnerability[],
  hotspots: SecurityHotspot[]
): SecurityAnalysisResult["summary"] {
  const vulnCounts = {
    critical: vulnerabilities.filter(v => v.severity === "CRITICAL").length,
    high: vulnerabilities.filter(v => v.severity === "HIGH").length,
    medium: vulnerabilities.filter(v => v.severity === "MEDIUM").length,
    low: vulnerabilities.filter(v => v.severity === "LOW").length,
  };

  const hotspotCounts = {
    high: hotspots.filter(h => h.severity === "HIGH").length,
    medium: hotspots.filter(h => h.severity === "MEDIUM").length,
    low: hotspots.filter(h => h.severity === "LOW").length,
  };

  // Calculate security rating
  let securityRating: "A" | "B" | "C" | "D" | "E" = "A";
  if (vulnCounts.critical > 0 || vulnCounts.high > 5) {
    securityRating = "E";
  } else if (vulnCounts.high > 2 || vulnCounts.medium > 10) {
    securityRating = "D";
  } else if (vulnCounts.high > 0 || vulnCounts.medium > 5) {
    securityRating = "C";
  } else if (vulnCounts.medium > 0 || vulnCounts.low > 10) {
    securityRating = "B";
  }

  return {
    totalVulnerabilities: vulnerabilities.length,
    criticalVulnerabilities: vulnCounts.critical,
    highVulnerabilities: vulnCounts.high,
    mediumVulnerabilities: vulnCounts.medium,
    lowVulnerabilities: vulnCounts.low,
    totalHotspots: hotspots.length,
    highHotspots: hotspotCounts.high,
    mediumHotspots: hotspotCounts.medium,
    lowHotspots: hotspotCounts.low,
    securityRating,
  };
}

/**
 * 🦊 Extract security hotspots from tool output
 */
export function extractHotspotsFromOutput(_output: string, _toolName: string): SecurityHotspot[] {
  const hotspots: SecurityHotspot[] = [];

  // This would be implemented based on specific tool outputs
  // For now, return empty array
  return hotspots;
}
