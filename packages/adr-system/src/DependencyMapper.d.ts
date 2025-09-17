/**
 * Dependency Impact Mapping - Advanced Dependency Analysis and Impact Propagation
 *
 * This module provides comprehensive analysis of how changes propagate through
 * the dependency graph and their impact on the system architecture.
 */
import { CodeChange, DependencyImpact } from "./ImpactAnalyzer";
export interface DependencyNode {
    id: string;
    path: string;
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
export interface DependencyEdge {
    id: string;
    source: string;
    target: string;
    type: "import" | "export" | "inheritance" | "composition" | "service-call";
    strength: number;
    metadata: {
        lineNumber?: number;
        isOptional: boolean;
        isDynamic: boolean;
        version?: string;
    };
}
export interface ImpactPropagation {
    sourceChange: CodeChange;
    propagationPath: string[][];
    affectedNodes: string[];
    impactLevels: Map<string, "low" | "medium" | "high" | "critical">;
    breakingChanges: string[];
    migrationPaths: string[][];
    estimatedEffort: Map<string, number>;
}
export interface DependencyGraph {
    nodes: Map<string, DependencyNode>;
    edges: Map<string, DependencyEdge>;
    metrics: {
        totalNodes: number;
        totalEdges: number;
        averageDegree: number;
        maxDepth: number;
        circularDependencies: string[][];
        criticalPaths: string[][];
    };
}
export declare class DependencyMapper {
    private readonly codebasePath;
    private readonly dependencyGraph;
    private readonly changeHistory;
    constructor(codebasePath: string);
    /**
     * Build the complete dependency graph
     */
    buildDependencyGraph(): Promise<DependencyGraph>;
    /**
     * Analyze impact propagation for a change
     */
    analyzeImpactPropagation(change: CodeChange): Promise<ImpactPropagation>;
    /**
     * Get dependency impact for multiple changes
     */
    getDependencyImpact(changes: CodeChange[]): Promise<DependencyImpact[]>;
    /**
     * Find critical dependencies
     */
    findCriticalDependencies(): DependencyNode[];
    /**
     * Detect circular dependencies
     */
    detectCircularDependencies(): string[][];
    /**
     * Find critical paths in the dependency graph
     */
    findCriticalPaths(): string[][];
    /**
     * Generate dependency report
     */
    generateDependencyReport(): string;
    private discoverFiles;
    private buildNode;
    private buildEdges;
    private extractDependencies;
    private resolveImportPath;
    private calculatePropagationPath;
    private getAffectedNodes;
    private calculateImpactLevels;
    private identifyBreakingChanges;
    private calculateMigrationPaths;
    private estimateEffort;
    private getDependents;
    private calculateNodeImportance;
    private findAllPathsFromNode;
    private calculateDistance;
    private calculateComplexity;
    private calculateInitialImportance;
    private calculateStability;
    private calculateGraphMetrics;
    private calculateMaxDepth;
    private calculateNodeDepth;
}
