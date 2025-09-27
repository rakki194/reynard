/**
 * Reynard Code Quality Package
 *
 * Main entry point for the Reynard code quality analysis system. Provides SonarQube-like functionality
 * with comprehensive security integration.
 */

// Main analyzer and types
export { CodeQualityAnalyzer } from "./CodeQualityAnalyzer";
export type {
  AnalysisResult,
  CodeQualityMetrics,
  FileAnalysis,
  IssueSeverity,
  IssueType,
  LanguageAnalysis,
  QualityGate,
  QualityGateCondition,
  QualityGateResult,
  QualityGateStatus,
  QualityIssue,
  EmojiRoleplayMetrics,
  EmojiRoleplayIssue,
  EmojiRoleplayScanResult,
} from "./types";

// Component services
export { FileAnalyzer } from "./FileAnalyzer";
export { FileDiscoveryService } from "./FileDiscoveryService";
export { IssueDetector } from "./IssueDetector";

// Validation services
export * from "./validation/index";

// Incremental linting services
export * from "./incremental-linting/index";

// Git workflow services
export * from "./git-workflow/index";
export { LanguageAnalyzer } from "./LanguageAnalyzer";
export { MetricsCalculator } from "./MetricsCalculator";
export { QualityGateEvaluator } from "./QualityGateEvaluator";
export { DocstringAnalyzer } from "./DocstringAnalyzer";
export { EmojiRoleplayScanner } from "./EmojiRoleplayScanner";
export { JunkFileDetector } from "./JunkFileDetector";
export { NamingViolationScanner } from "./NamingViolationScanner";
export type { JunkFileAnalysis, JunkFileResult } from "./JunkFileDetector";
export type {
  DocstringAnalysis,
  DocstringMetrics,
  FunctionDocstring,
  ClassDocstring,
  ModuleDocstring,
} from "./DocstringAnalyzer";
export type { NamingViolation, NamingRule, ScanResult } from "./NamingViolationScanner";
import { AIAnalysisEngine } from "./AIAnalysisEngine";
import { AnalysisOrchestrator } from "./AnalysisOrchestrator";
import { BehavioralAnalysisEngine } from "./BehavioralAnalysisEngine";
import { CodeQualityAnalyzer } from "./CodeQualityAnalyzer";
import { EnhancedSecurityEngine } from "./EnhancedSecurityEngine";
import { DatabaseQualityGateManager } from "./DatabaseQualityGateManager";
import { QualityGateResult } from "./types";
import { SecurityAnalysisIntegration } from "./SecurityAnalysisIntegration";
import { FileAnalysis } from "./types";

export { QualityGateManager } from "./QualityGateManager";
export type { QualityGateConditionResult, QualityGateConfiguration } from "./QualityGateManager";

export { SecurityAnalysisIntegration } from "./SecurityAnalysisIntegration";
export type {
  SecurityAnalysisResult as LegacySecurityAnalysisResult,
  SecurityHotspot as LegacySecurityHotspot,
  SecurityVulnerability as LegacySecurityVulnerability,
  SecurityToolConfig,
} from "./SecurityAnalysisIntegration";

export { AIAnalysisEngine, createAIAnalysisEngine } from "./AIAnalysisEngine";
export type { AIAnalysisResult, AICodeContext, AISuggestion } from "./AIAnalysisEngine";
export { AnalysisOrchestrator } from "./AnalysisOrchestrator";
export type { AnalysisSystem, CompleteAnalysisResult, EnhancedAnalysisResult } from "./AnalysisOrchestrator";
export { BehavioralAnalysisEngine, createBehavioralAnalysisEngine } from "./BehavioralAnalysisEngine";
export type { BehavioralAnalysisResult, BehavioralInsight, CodeHotspot } from "./BehavioralAnalysisEngine";
export { CodeQualityDashboard, createCodeQualityDashboard } from "./CodeQualityDashboard";
export { EnhancedSecurityEngine, createEnhancedSecurityEngine } from "./EnhancedSecurityEngine";
export type { SecurityAnalysisResult, SecurityHotspot, SecurityVulnerability } from "./EnhancedSecurityEngine";

// Quality gates
export {
  DOCSTRING_QUALITY_GATES,
  STRICT_DOCSTRING_QUALITY_GATES,
  RELAXED_DOCSTRING_QUALITY_GATES,
  getDocstringQualityGates,
  createCustomDocstringGate,
} from "./quality-gates/docstring-gates";

/**
 * Create a complete code quality analysis system
 *
 * Factory function to create a fully configured code quality analysis system with all components.
 */
export function createCodeQualitySystem(projectRoot: string) {
  const analyzer = new CodeQualityAnalyzer(projectRoot);
  const qualityGateManager = new QualityGateManager(projectRoot);
  const securityIntegration = new SecurityAnalysisIntegration(projectRoot);
  const aiEngine = new AIAnalysisEngine();
  const behavioralEngine = new BehavioralAnalysisEngine(projectRoot);
  const enhancedSecurityEngine = new EnhancedSecurityEngine(projectRoot);

  const system = {
    analyzer,
    qualityGateManager,
    securityIntegration,
    aiEngine,
    behavioralEngine,
    enhancedSecurityEngine,
  };

  const orchestrator = new AnalysisOrchestrator(system);

  return {
    ...system,
    orchestrator,
    runCompleteAnalysis: (environment: string = "development") => orchestrator.runCompleteAnalysis(environment),
    runEnhancedAnalysis: (environment: string = "development") => orchestrator.runEnhancedAnalysis(environment),
    initialize: () => orchestrator.initialize(),
  };
}

/**
 * Quick analysis function for simple use cases
 *
 * Provides a simple interface for running code quality analysis without managing individual components.
 */
export async function quickAnalysis(
  projectRoot: string,
  options: {
    environment?: string;
    includeSecurity?: boolean;
    includeQualityGates?: boolean;
  } = {}
) {
  const { environment = "development", includeSecurity = true, includeQualityGates = true } = options;

  const system = createCodeQualitySystem(projectRoot);
  await system.initialize();

  const analyzer = system.analyzer;
  const analysisResult = await analyzer.analyzeProject();

  let securityResult = null;
  if (includeSecurity) {
    const files = analysisResult.files.map((f: FileAnalysis) => f.path);
    securityResult = await system.securityIntegration.runSecurityAnalysis(files);
  }

  let qualityGateResults: QualityGateResult[] = [];
  if (includeQualityGates) {
    qualityGateResults = system.qualityGateManager.evaluateQualityGates(analysisResult.metrics, environment);
  }

  return {
    analysis: analysisResult,
    security: securityResult,
    qualityGates: qualityGateResults,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Default export for convenience
 */
export default {
  createCodeQualitySystem,
  quickAnalysis,
};
