/**
 * Modularity Compliance Checker - Advanced Architectural Modularity Analysis
 *
 * This module provides comprehensive analysis of code modularity compliance,
 * enforcing the Reynard 140-line axiom and modular architecture patterns.
 */
export interface ModularityViolation {
    id: string;
    type: "file-size" | "function-length" | "module-cohesion" | "coupling" | "separation-of-concerns" | "circular-dependency";
    severity: "low" | "medium" | "high" | "critical";
    filePath: string;
    lineNumber?: number;
    description: string;
    currentValue: number;
    threshold: number;
    suggestion: string;
    impact: {
        maintainability: number;
        testability: number;
        reusability: number;
        readability: number;
    };
}
export interface ModuleAnalysis {
    filePath: string;
    metrics: {
        linesOfCode: number;
        functions: number;
        classes: number;
        exports: number;
        imports: number;
        complexity: number;
        cohesion: number;
        coupling: number;
    };
    violations: ModularityViolation[];
    recommendations: string[];
    complianceScore: number;
}
export interface ModularityReport {
    overallCompliance: number;
    totalViolations: number;
    violationsByType: Record<string, number>;
    violationsBySeverity: Record<string, number>;
    topViolatingFiles: Array<{
        filePath: string;
        violationCount: number;
        complianceScore: number;
    }>;
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    metrics: {
        averageFileSize: number;
        averageFunctionLength: number;
        averageComplexity: number;
        modularityIndex: number;
    };
}
export declare class ModularityComplianceChecker {
    private readonly codebasePath;
    private readonly thresholds;
    private readonly fileCache;
    private readonly analysisCache;
    constructor(codebasePath: string);
    /**
     * Perform comprehensive modularity compliance check
     */
    checkModularityCompliance(): Promise<ModularityReport>;
    /**
     * Analyze a single module for compliance
     */
    analyzeModule(filePath: string): Promise<ModuleAnalysis>;
    /**
     * Get modularity violations for a specific file
     */
    getViolationsForFile(filePath: string): ModularityViolation[];
    /**
     * Get compliance score for a specific file
     */
    getComplianceScore(filePath: string): number;
    /**
     * Check if a file is compliant
     */
    isFileCompliant(filePath: string): boolean;
    /**
     * Get files that need immediate attention
     */
    getCriticalFiles(): Array<{
        filePath: string;
        violations: ModularityViolation[];
    }>;
    /**
     * Generate refactoring suggestions for a file
     */
    generateRefactoringSuggestions(filePath: string): string[];
    private discoverFiles;
    private getFileContent;
    private calculateMetrics;
    private detectViolations;
    private generateRecommendations;
    private calculateComplianceScore;
    private generateModularityReport;
    private generateGlobalRecommendations;
    private countFunctions;
    private countClasses;
    private countExports;
    private countImports;
    private calculateComplexity;
    private calculateCohesion;
    private calculateCoupling;
    private findLongFunctions;
    private findRelatedFunctions;
    private findFunctions;
    private extractFunctionName;
    private calculateAverageFunctionLength;
    private calculateModularityIndex;
    private getDefaultMetrics;
    private getFileSizeSeverity;
    private getFunctionLengthSeverity;
    private getComplexitySeverity;
    private getCouplingSeverity;
    private getCohesionSeverity;
    private generateViolationId;
}
