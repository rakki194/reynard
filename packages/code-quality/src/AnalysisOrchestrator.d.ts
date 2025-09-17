/**
 * 🦦 Reynard Analysis Orchestrator
 *
 * *splashes with coordination* Orchestrates complex analysis workflows
 * across multiple engines and components.
 */
import { AIAnalysisEngine } from "./AIAnalysisEngine";
import { BehavioralAnalysisEngine } from "./BehavioralAnalysisEngine";
import { CodeQualityAnalyzer } from "./CodeQualityAnalyzer";
import { EnhancedSecurityEngine } from "./EnhancedSecurityEngine";
import { QualityGateManager } from "./QualityGateManager";
import { SecurityAnalysisIntegration } from "./SecurityAnalysisIntegration";
export interface AnalysisSystem {
    analyzer: CodeQualityAnalyzer;
    qualityGateManager: QualityGateManager;
    securityIntegration: SecurityAnalysisIntegration;
    aiEngine: AIAnalysisEngine;
    behavioralEngine: BehavioralAnalysisEngine;
    enhancedSecurityEngine: EnhancedSecurityEngine;
}
export interface CompleteAnalysisResult {
    analysis: any;
    security: any;
    qualityGates: any[];
    timestamp: string;
}
export interface EnhancedAnalysisResult extends CompleteAnalysisResult {
    ai: any[];
    behavioral: any;
    enhancedSecurity: any;
}
/**
 * 🦦 Analysis Orchestrator
 *
 * *webbed paws coordinate perfectly* Manages complex analysis workflows
 * with the precision of an otter navigating through crystal-clear streams.
 */
export declare class AnalysisOrchestrator {
    private readonly system;
    constructor(system: AnalysisSystem);
    /**
     * 🦦 Run complete analysis
     *
     * *dives deep into the analysis pool* Coordinates all analysis engines
     * to provide comprehensive code quality insights.
     */
    runCompleteAnalysis(environment?: string): Promise<CompleteAnalysisResult>;
    /**
     * 🦦 Run enhanced analysis with AI and behavioral insights
     *
     * *swims through advanced analysis streams* Combines traditional analysis
     * with cutting-edge AI and behavioral insights for maximum coverage.
     */
    runEnhancedAnalysis(environment?: string): Promise<EnhancedAnalysisResult>;
    /**
     * 🦦 Run AI analysis on key files
     *
     * *whiskers quiver with AI excitement* Analyzes the most important files
     * with AI-powered insights.
     */
    private runAIAnalysis;
    /**
     * 🦦 Initialize the analysis system
     *
     * *sleek fur glistens with preparation* Sets up the analysis system
     * with default configurations and quality gates.
     */
    initialize(): Promise<void>;
}
