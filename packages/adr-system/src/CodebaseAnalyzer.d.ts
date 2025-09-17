/**
 * Codebase Analysis Engine for Intelligent ADR Generation
 *
 * This module provides comprehensive codebase analysis capabilities to identify
 * architectural patterns, dependencies, and potential decision points that
 * warrant ADR documentation.
 */
export interface CodebaseMetrics {
    totalFiles: number;
    totalLines: number;
    fileTypes: Record<string, number>;
    averageFileSize: number;
    largestFiles: Array<{
        path: string;
        lines: number;
    }>;
    complexityScore: number;
}
export interface DependencyAnalysis {
    internalDependencies: Map<string, string[]>;
    externalDependencies: Map<string, string[]>;
    circularDependencies: string[][];
    dependencyDepth: Map<string, number>;
    criticalDependencies: string[];
}
export interface ArchitecturePattern {
    type: "microservice" | "monolith" | "modular" | "layered" | "event-driven";
    confidence: number;
    evidence: string[];
    recommendations: string[];
}
export interface CodeQualityMetrics {
    testCoverage: number;
    documentationCoverage: number;
    complexityMetrics: {
        cyclomaticComplexity: number;
        cognitiveComplexity: number;
        maintainabilityIndex: number;
    };
    codeSmells: Array<{
        type: string;
        severity: "low" | "medium" | "high";
        location: string;
        description: string;
    }>;
}
export interface ADRSuggestion {
    id: string;
    title: string;
    priority: "low" | "medium" | "high" | "critical";
    category: "security" | "performance" | "scalability" | "integration" | "maintainability";
    reasoning: string[];
    evidence: string[];
    template: string;
    estimatedImpact: "low" | "medium" | "high";
    stakeholders: string[];
}
export declare class CodebaseAnalyzer {
    private readonly rootPath;
    private readonly supportedExtensions;
    private readonly testPatterns;
    private readonly configFiles;
    constructor(rootPath: string);
    /**
     * Perform comprehensive codebase analysis
     */
    analyzeCodebase(): Promise<{
        metrics: CodebaseMetrics;
        dependencies: DependencyAnalysis;
        patterns: ArchitecturePattern[];
        quality: CodeQualityMetrics;
        suggestions: ADRSuggestion[];
    }>;
    /**
     * Discover all relevant files in the codebase
     */
    private discoverFiles;
    /**
     * Calculate basic codebase metrics
     */
    private calculateMetrics;
    /**
     * Analyze dependencies between modules
     */
    private analyzeDependencies;
    /**
     * Identify architecture patterns in the codebase
     */
    private identifyArchitecturePatterns;
    /**
     * Assess code quality metrics
     */
    private assessCodeQuality;
    /**
     * Generate ADR suggestions based on analysis
     */
    private generateADRSuggestions;
    private calculateComplexityScore;
    private extractImports;
    private detectCircularDependencies;
    private calculateDependencyDepth;
    private calculateFileDepth;
    private identifyCriticalDependencies;
    private detectMicroservicePattern;
    private detectModularPattern;
    private detectLayeredPattern;
    private countDocumentedFiles;
    private calculateComplexityMetrics;
    private detectCodeSmells;
}
