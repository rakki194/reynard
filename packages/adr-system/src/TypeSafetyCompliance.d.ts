/**
 * Type Safety Compliance - Advanced TypeScript Type Safety Analysis and Enforcement
 *
 * This module provides comprehensive analysis of type safety compliance,
 * ensuring strict TypeScript usage and preventing type-related issues.
 */
export interface TypeSafetyViolation {
    id: string;
    type: "any-usage" | "unknown-usage" | "type-assertion" | "non-null-assertion" | "implicit-any" | "type-coverage" | "strict-mode";
    severity: "low" | "medium" | "high" | "critical";
    filePath: string;
    lineNumber: number;
    description: string;
    codeSnippet: string;
    suggestion: string;
    impact: {
        typeSafety: number;
        maintainability: number;
        reliability: number;
        performance: number;
    };
}
export interface TypeCoverage {
    filePath: string;
    totalExpressions: number;
    typedExpressions: number;
    anyExpressions: number;
    unknownExpressions: number;
    coveragePercentage: number;
    untypedLocations: Array<{
        line: number;
        column: number;
        expression: string;
        type: string;
    }>;
}
export interface TypeSafetyReport {
    overallTypeSafety: number;
    totalFiles: number;
    typeSafeFiles: number;
    violationsByType: Record<string, number>;
    violationsBySeverity: Record<string, number>;
    typeCoverage: {
        overall: number;
        byFile: Map<string, TypeCoverage>;
        average: number;
    };
    strictModeCompliance: {
        enabled: boolean;
        violations: number;
        recommendations: string[];
    };
    topViolations: TypeSafetyViolation[];
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
}
export declare class TypeSafetyCompliance {
    private readonly codebasePath;
    private readonly violationCache;
    private readonly coverageCache;
    private readonly strictModeRules;
    constructor(codebasePath: string);
    /**
     * Perform comprehensive type safety compliance analysis
     */
    analyzeTypeSafety(): Promise<TypeSafetyReport>;
    /**
     * Analyze type safety for a specific file
     */
    analyzeFileTypeSafety(filePath: string): Promise<TypeSafetyViolation[]>;
    /**
     * Analyze type coverage for a specific file
     */
    analyzeTypeCoverage(filePath: string): Promise<TypeCoverage>;
    /**
     * Get type safety score for a specific file
     */
    getFileTypeSafetyScore(filePath: string): number;
    /**
     * Get type coverage for a specific file
     */
    getFileTypeCoverage(filePath: string): TypeCoverage | null;
    /**
     * Check if a file is type safe
     */
    isFileTypeSafe(filePath: string): boolean;
    /**
     * Get files with critical type safety issues
     */
    getCriticalTypeSafetyFiles(): Array<{
        filePath: string;
        violations: TypeSafetyViolation[];
    }>;
    /**
     * Generate type safety improvement suggestions
     */
    generateTypeSafetySuggestions(filePath: string): string[];
    private discoverTypeScriptFiles;
    private detectAnyUsage;
    private detectUnknownUsage;
    private detectTypeAssertions;
    private detectNonNullAssertions;
    private detectImplicitAny;
    private detectStrictModeViolations;
    private checkStrictModeCompliance;
    private generateTypeSafetyReport;
    private generateGlobalRecommendations;
    private extractExpressions;
    private hasTypeGuard;
    private hasExplicitTypes;
    private hasUnusedVariable;
    private hasMissingReturn;
    private getAnyUsageSeverity;
    private getTypeAssertionSeverity;
    private getNonNullAssertionSeverity;
    private generateViolationId;
}
