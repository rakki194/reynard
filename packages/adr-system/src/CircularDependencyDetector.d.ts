/**
 * Circular Dependency Detector - Advanced Circular Dependency Analysis and Resolution
 *
 * This module provides sophisticated detection and analysis of circular dependencies
 * in the codebase, with intelligent resolution suggestions and impact assessment.
 */
export interface DependencyNode {
    id: string;
    path: string;
    name: string;
    type: "file" | "module" | "package" | "service";
    dependencies: string[];
    dependents: string[];
    metadata: {
        size: number;
        complexity: number;
        lastModified: string;
        importance: number;
        stability: number;
    };
}
export interface CircularDependency {
    id: string;
    cycle: string[];
    severity: "low" | "medium" | "high" | "critical";
    impact: {
        buildTime: number;
        runtime: number;
        maintainability: number;
        testability: number;
    };
    description: string;
    resolution: {
        strategy: "extract-interface" | "dependency-injection" | "event-driven" | "facade" | "restructure";
        description: string;
        effort: "low" | "medium" | "high";
        risk: "low" | "medium" | "high";
        steps: string[];
        examples: string[];
    };
    detectedAt: string;
    metadata: {
        cycleLength: number;
        involvedTypes: string[];
        affectedFiles: string[];
    };
}
export interface DependencyGraph {
    nodes: Map<string, DependencyNode>;
    edges: Map<string, {
        source: string;
        target: string;
        type: string;
        weight: number;
    }>;
    cycles: CircularDependency[];
    metrics: {
        totalNodes: number;
        totalEdges: number;
        totalCycles: number;
        averageCycleLength: number;
        maxCycleLength: number;
        criticalCycles: number;
    };
}
export interface CircularDependencyReport {
    overallHealth: number;
    totalCycles: number;
    criticalCycles: number;
    cyclesBySeverity: Record<string, number>;
    topCycles: CircularDependency[];
    resolutionPlan: {
        immediate: CircularDependency[];
        shortTerm: CircularDependency[];
        longTerm: CircularDependency[];
    };
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    metrics: {
        buildTimeImpact: number;
        runtimeImpact: number;
        maintainabilityImpact: number;
        testabilityImpact: number;
    };
}
export declare class CircularDependencyDetector {
    private readonly codebasePath;
    private readonly dependencyGraph;
    private readonly nodeCache;
    private readonly cycleCache;
    constructor(codebasePath: string);
    /**
     * Perform comprehensive circular dependency analysis
     */
    analyzeCircularDependencies(): Promise<CircularDependencyReport>;
    /**
     * Get circular dependencies for a specific file
     */
    getCircularDependenciesForFile(filePath: string): CircularDependency[];
    /**
     * Get all circular dependencies
     */
    getAllCircularDependencies(): CircularDependency[];
    /**
     * Get critical circular dependencies
     */
    getCriticalCircularDependencies(): CircularDependency[];
    /**
     * Generate resolution suggestions for a specific cycle
     */
    generateResolutionSuggestions(cycleId: string): CircularDependency["resolution"] | null;
    /**
     * Check if a file is part of any circular dependency
     */
    isFileInCycle(filePath: string): boolean;
    /**
     * Get dependency graph visualization data
     */
    getDependencyGraphData(): {
        nodes: Array<{
            id: string;
            label: string;
            type: string;
            inCycle: boolean;
        }>;
        edges: Array<{
            source: string;
            target: string;
            inCycle: boolean;
        }>;
        cycles: string[][];
    };
    private buildDependencyGraph;
    private detectCircularDependencies;
    private discoverFiles;
    private createDependencyNode;
    private createDependencyEdges;
    private extractDependencies;
    private resolveImportPath;
    private createCircularDependency;
    private calculateCycleSeverity;
    private calculateCycleImportance;
    private calculateCycleImpact;
    private generateResolutionStrategy;
    private generateTwoNodeResolution;
    private generateInterfaceExtractionResolution;
    private generateDependencyInjectionResolution;
    private generateRestructureResolution;
    private generateCycleDescription;
    private getInvolvedTypes;
    private isEdgeInCycle;
    private updateCycleMetrics;
    private generateCircularDependencyReport;
    private generateRecommendations;
    private calculateOverallHealth;
    private calculateImpactMetrics;
    private calculateComplexity;
    private calculateImportance;
    private calculateStability;
    private generateNodeId;
    private generateCycleId;
}
