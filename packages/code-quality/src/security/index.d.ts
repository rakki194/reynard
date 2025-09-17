/**
 * 🐺 Security Analysis Module
 *
 * *snarls with predatory intelligence* Unified security analysis system
 * for comprehensive vulnerability detection and analysis.
 */
export { SecurityAnalysisIntegration } from "./security-analysis-integration";
export type { SecurityAnalysisResult, SecurityHotspot, SecurityToolConfig, SecurityVulnerability } from "./types";
export { configureSecurityTool, createSecurityTools, getEnabledSecurityTools, getSecurityTool } from "./tool-config";
export { detectLanguage, getRelevantFiles, groupFilesByLanguage } from "./utils/file-processor";
export { calculateSecuritySummary, extractHotspotsFromOutput, removeDuplicateHotspots, removeDuplicateVulnerabilities, } from "./utils/analysis-utils";
export { runSecurityTool } from "./utils/tool-executor";
export { parseBanditOutput } from "./parsers/bandit-parser";
export { parseESLintSecurityOutput } from "./parsers/eslint-parser";
export { parseFenrirLLMOutput } from "./parsers/fenrir-llm-parser";
export { parseFenrirOutput } from "./parsers/fenrir-parser";
