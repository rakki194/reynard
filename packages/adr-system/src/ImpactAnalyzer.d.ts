/**
 * Automated Impact Analysis - Code Change Detection and Impact Assessment
 *
 * This module provides comprehensive analysis of code changes and their
 * impact on architectural decisions and system compliance.
 */
export interface CodeChange {
    id: string;
    filePath: string;
    changeType: "added" | "modified" | "deleted" | "renamed";
    timestamp: string;
    hash: string;
    size: number;
    linesAdded: number;
    linesDeleted: number;
    linesModified: number;
    content?: string;
    metadata: {
        author?: string;
        commit?: string;
        branch?: string;
        message?: string;
    };
}
export interface ImpactAssessment {
    changeId: string;
    affectedADRs: string[];
    impactLevel: "low" | "medium" | "high" | "critical";
    impactAreas: string[];
    complianceViolations: ComplianceViolation[];
    recommendations: string[];
    estimatedEffort: number;
    riskScore: number;
}
export interface ComplianceViolation {
    type: "architectural" | "security" | "performance" | "maintainability";
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    location: string;
    rule: string;
    suggestion: string;
}
export interface DependencyImpact {
    sourceFile: string;
    affectedFiles: string[];
    impactChain: string[][];
    breakingChanges: string[];
    migrationRequired: boolean;
    estimatedMigrationEffort: number;
}
export declare class ImpactAnalyzer {
    private readonly codebasePath;
    private readonly adrPath;
    private readonly changeHistory;
    private readonly fileHashes;
    private readonly adrCache;
    private watchers;
    constructor(codebasePath: string, adrPath: string);
    /**
     * Initialize the impact analyzer
     */
    initialize(): Promise<void>;
    /**
     * Start monitoring code changes
     */
    startMonitoring(): Promise<void>;
    /**
     * Stop monitoring code changes
     */
    stopMonitoring(): Promise<void>;
    /**
     * Analyze impact of a specific change
     */
    analyzeChangeImpact(change: CodeChange): Promise<ImpactAssessment>;
    /**
     * Analyze dependency impact of changes
     */
    analyzeDependencyImpact(changes: CodeChange[]): Promise<DependencyImpact[]>;
    /**
     * Get change history for a file
     */
    getChangeHistory(filePath: string): CodeChange[];
    /**
     * Get all changes in a time range
     */
    getChangesInRange(startDate: Date, endDate: Date): CodeChange[];
    /**
     * Generate impact report
     */
    generateImpactReport(changes: CodeChange[], assessments: ImpactAssessment[]): string;
    private scanCodebase;
    private loadADRs;
    private establishBaseline;
    private watchFile;
    private handleFileChange;
    private getAllFiles;
    private findAffectedADRs;
    private identifyImpactAreas;
    private checkComplianceViolations;
    private generateRecommendations;
    private calculateImpactLevel;
    private estimateEffort;
    private calculateRiskScore;
    private findAffectedFiles;
    private buildImpactChain;
    private identifyBreakingChanges;
    private estimateMigrationEffort;
    private isFileRelevantToADR;
    private isContentRelevantToADR;
    private findLongFunctions;
    private findSecurityIssues;
    private findPerformanceIssues;
    private parseADR;
    private calculateHash;
    private generateChangeId;
}
