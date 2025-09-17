/**
 * Dependency Health Analyzer - Comprehensive Dependency Quality and Health Assessment
 *
 * This module provides advanced analysis of dependency health, including
 * security vulnerabilities, version conflicts, and architectural compliance.
 */
export interface DependencyInfo {
    name: string;
    version: string;
    type: "production" | "development" | "peer" | "optional";
    source: "npm" | "yarn" | "pnpm" | "local" | "git";
    path?: string;
    metadata: {
        description?: string;
        homepage?: string;
        repository?: string;
        license?: string;
        author?: string;
        maintainers?: string[];
        lastModified?: string;
        size?: number;
    };
}
export interface DependencyHealthIssue {
    id: string;
    type: "security" | "version" | "license" | "maintenance" | "performance" | "compatibility";
    severity: "low" | "medium" | "high" | "critical";
    dependency: string;
    description: string;
    impact: string;
    remediation: string;
    references?: string[];
    detectedAt: string;
}
export interface DependencyHealthScore {
    dependency: string;
    overallScore: number;
    categoryScores: {
        security: number;
        maintenance: number;
        performance: number;
        compatibility: number;
        license: number;
    };
    issues: DependencyHealthIssue[];
    recommendations: string[];
    lastUpdated: string;
}
export interface DependencyHealthReport {
    overallHealth: number;
    totalDependencies: number;
    healthyDependencies: number;
    criticalIssues: number;
    securityVulnerabilities: number;
    outdatedDependencies: number;
    licenseConflicts: number;
    healthByCategory: {
        security: number;
        maintenance: number;
        performance: number;
        compatibility: number;
        license: number;
    };
    topIssues: DependencyHealthIssue[];
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    dependencyScores: DependencyHealthScore[];
}
export declare class DependencyHealthAnalyzer {
    private readonly codebasePath;
    private readonly dependencyCache;
    private readonly healthCache;
    private readonly vulnerabilityDatabase;
    constructor(codebasePath: string);
    /**
     * Perform comprehensive dependency health analysis
     */
    analyzeDependencyHealth(): Promise<DependencyHealthReport>;
    /**
     * Get health score for a specific dependency
     */
    getDependencyHealth(dependencyName: string): DependencyHealthScore | null;
    /**
     * Get all critical issues
     */
    getCriticalIssues(): DependencyHealthIssue[];
    /**
     * Get outdated dependencies
     */
    getOutdatedDependencies(): Array<{
        dependency: string;
        current: string;
        latest: string;
    }>;
    /**
     * Get security vulnerabilities
     */
    getSecurityVulnerabilities(): DependencyHealthIssue[];
    /**
     * Generate dependency update recommendations
     */
    generateUpdateRecommendations(): Array<{
        dependency: string;
        currentVersion: string;
        recommendedVersion: string;
        reason: string;
        priority: "high" | "medium" | "low";
    }>;
    private discoverDependencies;
    private findPackageJsonFiles;
    private getDependencyType;
    private analyzeSecurityHealth;
    private analyzeMaintenanceHealth;
    private analyzePerformanceHealth;
    private analyzeCompatibilityHealth;
    private analyzeLicenseHealth;
    private calculateCategoryScores;
    private calculateOverallScore;
    private generateRecommendations;
    private generateHealthReport;
    private generateGlobalRecommendations;
    private initializeVulnerabilityDatabase;
    private mapSeverity;
    private isDeprecated;
    private isOutdated;
    private isUnmaintained;
    private getPackageSize;
    private isPerformanceHeavy;
    private checkNodeCompatibility;
    private checkPeerDependencyConflicts;
    private getPackageLicense;
    private isProblematicLicense;
    private checkLicenseConflicts;
    private generateIssueId;
}
