/**
 * 🐺 Security Analysis Module
 *
 * *snarls with predatory intelligence* Unified security analysis system
 * for comprehensive vulnerability detection and analysis.
 */

// Main classes and interfaces
export { SecurityAnalysisIntegration } from "./security-analysis-integration";
export type { SecurityAnalysisResult, SecurityHotspot, SecurityToolConfig, SecurityVulnerability } from "./types";

// Tool configuration utilities
export { configureSecurityTool, createSecurityTools, getEnabledSecurityTools, getSecurityTool } from "./tool-config";

// File processing utilities
export { detectLanguage, getRelevantFiles, groupFilesByLanguage } from "./utils/file-processor";

// Analysis utilities
export {
  calculateSecuritySummary,
  extractHotspotsFromOutput,
  removeDuplicateHotspots,
  removeDuplicateVulnerabilities,
} from "./utils/analysis-utils";

// Tool execution utilities
export { runSecurityTool } from "./utils/tool-executor";

// Parsers
export { parseBanditOutput } from "./parsers/bandit-parser";
export { parseESLintSecurityOutput } from "./parsers/eslint-parser";
export { parseFenrirLLMOutput } from "./parsers/fenrir-llm-parser";
export { parseFenrirOutput } from "./parsers/fenrir-parser";
