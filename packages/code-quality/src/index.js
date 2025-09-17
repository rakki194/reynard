/**
 * 🦊 Reynard Code Quality Package
 *
 * *red fur gleams with intelligence* Main entry point for the Reynard
 * code quality analysis system. Provides SonarQube-like functionality
 * with comprehensive security integration.
 */
// Main analyzer and types
export { CodeQualityAnalyzer } from "./CodeQualityAnalyzer";
// Component services
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
import { QualityGateManager } from "./QualityGateManager";
import { SecurityAnalysisIntegration } from "./SecurityAnalysisIntegration";
export { QualityGateManager } from "./QualityGateManager";
export { SecurityAnalysisIntegration } from "./SecurityAnalysisIntegration";
export { AIAnalysisEngine, createAIAnalysisEngine } from "./AIAnalysisEngine";
export { AnalysisOrchestrator } from "./AnalysisOrchestrator";
export { BehavioralAnalysisEngine, createBehavioralAnalysisEngine } from "./BehavioralAnalysisEngine";
export { CodeQualityDashboard, createCodeQualityDashboard } from "./CodeQualityDashboard";
export { EnhancedSecurityEngine, createEnhancedSecurityEngine } from "./EnhancedSecurityEngine";
/**
 * 🦊 Create a complete code quality analysis system
 *
 * *whiskers twitch with anticipation* Factory function to create
 * a fully configured code quality analysis system with all components.
 */
export function createCodeQualitySystem(projectRoot) {
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
        runCompleteAnalysis: (environment = "development") => orchestrator.runCompleteAnalysis(environment),
        runEnhancedAnalysis: (environment = "development") => orchestrator.runEnhancedAnalysis(environment),
        initialize: () => orchestrator.initialize(),
    };
}
/**
 * 🐺 Quick analysis function for simple use cases
 *
 * *snarls with efficiency* Provides a simple interface for running
 * code quality analysis without managing individual components.
 */
export async function quickAnalysis(projectRoot, options = {}) {
    const { environment = "development", includeSecurity = true, includeQualityGates = true } = options;
    const system = createCodeQualitySystem(projectRoot);
    await system.initialize();
    const analyzer = system.analyzer;
    const analysisResult = await analyzer.analyzeProject();
    let securityResult = null;
    if (includeSecurity) {
        const files = analysisResult.files.map((f) => f.path);
        securityResult = await system.securityIntegration.runSecurityAnalysis(files);
    }
    let qualityGateResults = [];
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
 * 🦊 Default export for convenience
 */
export default {
    createCodeQualitySystem,
    quickAnalysis,
};
