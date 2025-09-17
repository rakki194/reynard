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
export declare function removeDuplicateVulnerabilities(vulnerabilities: SecurityVulnerability[]): SecurityVulnerability[];
/**
 * 🦊 Remove duplicate hotspots
 */
export declare function removeDuplicateHotspots(hotspots: SecurityHotspot[]): SecurityHotspot[];
/**
 * 🐺 Calculate security summary
 */
export declare function calculateSecuritySummary(vulnerabilities: SecurityVulnerability[], hotspots: SecurityHotspot[]): SecurityAnalysisResult["summary"];
/**
 * 🦊 Extract security hotspots from tool output
 */
export declare function extractHotspotsFromOutput(_output: string, _toolName: string): SecurityHotspot[];
