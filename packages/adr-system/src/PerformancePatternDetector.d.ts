/**
 * Performance Pattern Detector - Advanced Performance Analysis and Anti-Pattern Detection
 *
 * This module provides comprehensive detection of performance patterns and anti-patterns,
 * identifying optimization opportunities and performance bottlenecks.
 */
export interface PerformanceIssue {
    id: string;
    type: "synchronous-io" | "memory-leak" | "inefficient-loop" | "blocking-operation" | "large-object" | "unnecessary-computation" | "inefficient-algorithm" | "resource-exhaustion";
    severity: "low" | "medium" | "high" | "critical";
    filePath: string;
    lineNumber: number;
    description: string;
    codeSnippet: string;
    impact: {
        performance: number;
        memory: number;
        scalability: number;
        userExperience: number;
    };
    suggestion: string;
    examples: string[];
    estimatedImprovement: string;
}
export interface PerformancePattern {
    name: string;
    type: "anti-pattern" | "optimization" | "best-practice";
    description: string;
    detection: {
        patterns: string[];
        conditions: string[];
    };
    impact: {
        performance: number;
        memory: number;
        maintainability: number;
    };
    remediation: {
        description: string;
        examples: string[];
        effort: "low" | "medium" | "high";
    };
}
export interface PerformanceReport {
    overallPerformance: number;
    totalIssues: number;
    criticalIssues: number;
    issuesByType: Record<string, number>;
    issuesBySeverity: Record<string, number>;
    performanceScore: {
        overall: number;
        memory: number;
        cpu: number;
        io: number;
        scalability: number;
    };
    topIssues: PerformanceIssue[];
    detectedPatterns: {
        antiPatterns: PerformancePattern[];
        optimizations: PerformancePattern[];
        bestPractices: PerformancePattern[];
    };
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    metrics: {
        averageFileSize: number;
        averageComplexity: number;
        synchronousOperations: number;
        asyncOperations: number;
        memoryIntensiveOperations: number;
    };
}
export declare class PerformancePatternDetector {
    private readonly codebasePath;
    private readonly issueCache;
    private readonly patterns;
    constructor(codebasePath: string);
    /**
     * Perform comprehensive performance pattern analysis
     */
    analyzePerformancePatterns(): Promise<PerformanceReport>;
    /**
     * Analyze performance issues for a specific file
     */
    analyzeFilePerformance(filePath: string): Promise<PerformanceIssue[]>;
    /**
     * Get performance issues for a specific file
     */
    getFilePerformanceIssues(filePath: string): PerformanceIssue[];
    /**
     * Get performance score for a specific file
     */
    getFilePerformanceScore(filePath: string): number;
    /**
     * Check if a file has good performance
     */
    isFilePerformant(filePath: string): boolean;
    /**
     * Get files with critical performance issues
     */
    getCriticalPerformanceFiles(): Array<{
        filePath: string;
        issues: PerformanceIssue[];
    }>;
    /**
     * Generate performance optimization suggestions
     */
    generatePerformanceSuggestions(filePath: string): string[];
    private discoverFiles;
    private detectSynchronousIO;
    private detectMemoryLeaks;
    private detectInefficientLoops;
    private detectBlockingOperations;
    private detectLargeObjects;
    private detectUnnecessaryComputation;
    private detectInefficientAlgorithms;
    private detectResourceExhaustion;
    private detectPatterns;
    private generatePerformanceReport;
    private generateGlobalRecommendations;
    private calculateMemoryScore;
    private calculateCPUScore;
    private calculateIOScore;
    private calculateScalabilityScore;
    private calculateMetrics;
    private initializePerformancePatterns;
    private hasNestedLoop;
    private hasArrayOperationsInLoop;
    private isLargeObjectLiteral;
    private isLargeArray;
    private hasRepeatedCalculations;
    private hasUnnecessaryStringOperations;
    private hasQuadraticAlgorithm;
    private hasUnlimitedRecursion;
    private hasFileHandleLeak;
    private getMemoryLeakSeverity;
    private generateIssueId;
}
