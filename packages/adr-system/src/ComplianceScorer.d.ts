/**
 * Compliance Scoring System - Comprehensive Architectural Compliance Assessment
 *
 * This module provides sophisticated scoring and monitoring of architectural
 * compliance across the codebase, with detailed metrics and recommendations.
 */
import { ComplianceViolation } from "./types";
export interface ComplianceRule {
    id: string;
    name: string;
    category: "architectural" | "security" | "performance" | "maintainability" | "scalability";
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    weight: number;
    enabled: boolean;
    conditions: ComplianceCondition[];
    remediation: string;
}
export interface ComplianceCondition {
    type: "file-size" | "function-length" | "complexity" | "dependency-count" | "naming-convention" | "security-pattern" | "performance-pattern";
    operator: "lt" | "lte" | "gt" | "gte" | "eq" | "ne" | "contains" | "regex";
    value: any;
    description: string;
}
export interface ComplianceScore {
    overall: number;
    categories: {
        architectural: number;
        security: number;
        performance: number;
        maintainability: number;
        scalability: number;
    };
    violations: ComplianceViolation[];
    recommendations: string[];
    trends: {
        current: number;
        previous: number;
        change: number;
        trend: "improving" | "declining" | "stable";
    };
    metadata: {
        evaluatedAt: string;
        totalFiles: number;
        totalRules: number;
        violationsCount: number;
    };
}
export interface ComplianceReport {
    summary: ComplianceScore;
    detailedScores: Map<string, number>;
    categoryBreakdown: Map<string, ComplianceScore>;
    violationAnalysis: {
        bySeverity: Record<string, number>;
        byCategory: Record<string, number>;
        byFile: Map<string, ComplianceViolation[]>;
        topViolations: ComplianceViolation[];
    };
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    actionPlan: {
        priority: "high" | "medium" | "low";
        action: string;
        effort: number;
        impact: number;
    }[];
}
export declare class ComplianceScorer {
    private readonly codebasePath;
    private readonly adrPath;
    private readonly rules;
    private readonly adrCache;
    private readonly scoreHistory;
    constructor(codebasePath: string, adrPath: string);
    /**
     * Calculate comprehensive compliance score
     */
    calculateComplianceScore(): Promise<ComplianceScore>;
    /**
     * Generate comprehensive compliance report
     */
    generateComplianceReport(): Promise<ComplianceReport>;
    /**
     * Monitor compliance over time
     */
    monitorCompliance(): Promise<{
        current: ComplianceScore;
        history: ComplianceScore[];
        alerts: string[];
    }>;
    /**
     * Add custom compliance rule
     */
    addRule(rule: ComplianceRule): void;
    /**
     * Update existing rule
     */
    updateRule(ruleId: string, updates: Partial<ComplianceRule>): void;
    /**
     * Remove rule
     */
    removeRule(ruleId: string): void;
    /**
     * Get all rules
     */
    getRules(): ComplianceRule[];
    /**
     * Export compliance data
     */
    exportComplianceData(): string;
    /**
     * Import compliance data
     */
    importComplianceData(json: string): void;
    private discoverFiles;
    private evaluateRule;
    private evaluateCondition;
    private compareValues;
    private calculateCategoryScore;
    private calculateRuleScore;
    private calculateFileScore;
    private generateRecommendations;
    private generateCategoryRecommendations;
    private analyzeViolations;
    private generateDetailedRecommendations;
    private createActionPlan;
    private calculateTrends;
    private initializeDefaultRules;
    private findFunctions;
    private calculateComplexity;
    private countDependencies;
    private checkNamingConvention;
    private findSecurityPatterns;
    private findPerformancePatterns;
}
