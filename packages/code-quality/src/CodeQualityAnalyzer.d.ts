/**
 * 🦊 Reynard Code Quality Analyzer
 *
 * *red fur gleams with intelligence* A comprehensive code quality analysis engine
 * that unifies all Reynard's existing tools into a SonarQube-like system.
 *
 * Features:
 * - Multi-language static analysis
 * - Security vulnerability detection
 * - Code complexity metrics
 * - Technical debt tracking
 * - Quality gates enforcement
 * - Trend analysis and reporting
 */
import { EventEmitter } from "events";
import { AnalysisResult, QualityGate } from "./types";
export declare class CodeQualityAnalyzer extends EventEmitter {
    private readonly projectRoot;
    private readonly analysisHistory;
    private readonly fileDiscovery;
    private readonly languageAnalyzer;
    private readonly metricsCalculator;
    private readonly issueDetector;
    private readonly qualityGateEvaluator;
    private readonly fileAnalyzer;
    constructor(projectRoot: string);
    /**
     * 🦊 Perform comprehensive code quality analysis
     */
    analyzeProject(): Promise<AnalysisResult>;
    getAnalysisHistory(): AnalysisResult[];
    getLatestAnalysis(): AnalysisResult | null;
    addQualityGate(gate: QualityGate): void;
    removeQualityGate(gateId: string): void;
    getQualityGates(): QualityGate[];
}
