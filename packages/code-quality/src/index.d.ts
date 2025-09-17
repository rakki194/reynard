/**
 * 🦊 Reynard Code Quality Package
 *
 * *red fur gleams with intelligence* Main entry point for the Reynard
 * code quality analysis system. Provides SonarQube-like functionality
 * with comprehensive security integration.
 */
export { CodeQualityAnalyzer } from "./CodeQualityAnalyzer";
export type { AnalysisResult, CodeQualityMetrics, FileAnalysis, IssueSeverity, IssueType, LanguageAnalysis, QualityGate, QualityGateCondition, QualityGateResult, QualityGateStatus, QualityIssue, } from "./types";
export { FileAnalyzer } from "./FileAnalyzer";
export { FileDiscoveryService } from "./FileDiscoveryService";
export { IssueDetector } from "./IssueDetector";
export { LanguageAnalyzer } from "./LanguageAnalyzer";
export { MetricsCalculator } from "./MetricsCalculator";
export { QualityGateEvaluator } from "./QualityGateEvaluator";
import { AIAnalysisEngine } from "./AIAnalysisEngine";
import { AnalysisOrchestrator } from "./AnalysisOrchestrator";
import { BehavioralAnalysisEngine } from "./BehavioralAnalysisEngine";
import { CodeQualityAnalyzer } from "./CodeQualityAnalyzer";
import { EnhancedSecurityEngine } from "./EnhancedSecurityEngine";
import { QualityGateManager, QualityGateResult } from "./QualityGateManager";
import { SecurityAnalysisIntegration } from "./SecurityAnalysisIntegration";
export { QualityGateManager } from "./QualityGateManager";
export type { QualityGateConditionResult, QualityGateConfiguration } from "./QualityGateManager";
export { SecurityAnalysisIntegration } from "./SecurityAnalysisIntegration";
export type { SecurityAnalysisResult as LegacySecurityAnalysisResult, SecurityHotspot as LegacySecurityHotspot, SecurityVulnerability as LegacySecurityVulnerability, SecurityToolConfig, } from "./SecurityAnalysisIntegration";
export { AIAnalysisEngine, createAIAnalysisEngine } from "./AIAnalysisEngine";
export type { AIAnalysisResult, AICodeContext, AISuggestion } from "./AIAnalysisEngine";
export { AnalysisOrchestrator } from "./AnalysisOrchestrator";
export type { AnalysisSystem, CompleteAnalysisResult, EnhancedAnalysisResult } from "./AnalysisOrchestrator";
export { BehavioralAnalysisEngine, createBehavioralAnalysisEngine } from "./BehavioralAnalysisEngine";
export type { BehavioralAnalysisResult, BehavioralInsight, CodeHotspot } from "./BehavioralAnalysisEngine";
export { CodeQualityDashboard, createCodeQualityDashboard } from "./CodeQualityDashboard";
export { EnhancedSecurityEngine, createEnhancedSecurityEngine } from "./EnhancedSecurityEngine";
export type { SecurityAnalysisResult, SecurityHotspot, SecurityVulnerability } from "./EnhancedSecurityEngine";
/**
 * 🦊 Create a complete code quality analysis system
 *
 * *whiskers twitch with anticipation* Factory function to create
 * a fully configured code quality analysis system with all components.
 */
export declare function createCodeQualitySystem(projectRoot: string): {
    orchestrator: AnalysisOrchestrator;
    runCompleteAnalysis: (environment?: string) => Promise<import("./AnalysisOrchestrator").CompleteAnalysisResult>;
    runEnhancedAnalysis: (environment?: string) => Promise<import("./AnalysisOrchestrator").EnhancedAnalysisResult>;
    initialize: () => Promise<void>;
    analyzer: CodeQualityAnalyzer;
    qualityGateManager: QualityGateManager;
    securityIntegration: SecurityAnalysisIntegration;
    aiEngine: AIAnalysisEngine;
    behavioralEngine: BehavioralAnalysisEngine;
    enhancedSecurityEngine: EnhancedSecurityEngine;
};
/**
 * 🐺 Quick analysis function for simple use cases
 *
 * *snarls with efficiency* Provides a simple interface for running
 * code quality analysis without managing individual components.
 */
export declare function quickAnalysis(projectRoot: string, options?: {
    environment?: string;
    includeSecurity?: boolean;
    includeQualityGates?: boolean;
}): Promise<{
    analysis: import("./types").AnalysisResult;
    security: import("./security").SecurityAnalysisResult | null;
    qualityGates: QualityGateResult[];
    timestamp: string;
}>;
/**
 * 🦊 Default export for convenience
 */
declare const _default: {
    createCodeQualitySystem: typeof createCodeQualitySystem;
    quickAnalysis: typeof quickAnalysis;
};
export default _default;
