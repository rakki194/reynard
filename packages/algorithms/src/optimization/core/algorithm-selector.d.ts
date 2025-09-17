/**
 * Intelligent Algorithm Selector
 *
 * Based on PAW optimization findings, this module automatically selects
 * optimal algorithms based on workload characteristics and performance history.
 *
 * @module algorithms/optimization/algorithmSelector
 */
export interface WorkloadCharacteristics {
    objectCount: number;
    spatialDensity: number;
    overlapRatio: number;
    updateFrequency: number;
    queryPattern: "random" | "clustered" | "sequential";
    memoryConstraints?: {
        maxMemoryUsage: number;
        gcPressure: number;
    };
}
export interface PerformanceRecord {
    algorithm: string;
    workload: WorkloadCharacteristics;
    performance: {
        executionTime: number;
        memoryUsage: number;
        allocationCount: number;
        cacheHitRate: number;
    };
    timestamp: number;
}
export interface AlgorithmSelection {
    algorithm: string;
    confidence: number;
    expectedPerformance: {
        executionTime: number;
        memoryUsage: number;
    };
    reasoning: string[];
}
export interface SelectionStats {
    totalSelections: number;
    correctSelections: number;
    averageConfidence: number;
    performanceImprovement: number;
}
/**
 * Intelligent algorithm selector based on PAW optimization research
 */
export declare class AlgorithmSelector {
    private performanceHistory;
    private selectionStats;
    private thresholds;
    /**
     * Select optimal collision detection algorithm
     */
    selectCollisionAlgorithm(workload: WorkloadCharacteristics): AlgorithmSelection;
    /**
     * Select optimal spatial algorithm
     */
    selectSpatialAlgorithm(workload: WorkloadCharacteristics): AlgorithmSelection;
    /**
     * Select optimal Union-Find algorithm
     */
    selectUnionFindAlgorithm(workload: WorkloadCharacteristics): AlgorithmSelection;
    /**
     * Analyze workload characteristics
     */
    private analyzeWorkload;
    /**
     * Calculate workload complexity based on PAW findings
     */
    private calculateComplexity;
    /**
     * Calculate memory pressure based on workload
     */
    private calculateMemoryPressure;
    /**
     * Get performance profile from historical data
     */
    private getPerformanceProfile;
    /**
     * Select optimal collision detection algorithm
     */
    private selectOptimalCollisionAlgorithm;
    /**
     * Select optimal spatial algorithm
     */
    private selectOptimalSpatialAlgorithm;
    /**
     * Select optimal Union-Find algorithm
     */
    private selectOptimalUnionFindAlgorithm;
    /**
     * Find crossover point between algorithms
     */
    private findCrossoverPoint;
    /**
     * Get complexity-based recommendation
     */
    private getComplexityRecommendation;
    /**
     * Generate optimization recommendations
     */
    private generateRecommendations;
    /**
     * Find similar workloads in performance history
     */
    private findSimilarWorkloads;
    /**
     * Calculate similarity between workloads
     */
    private calculateWorkloadSimilarity;
    /**
     * Calculate average performance from historical data
     */
    private calculateAveragePerformance;
    /**
     * Get default performance estimates
     */
    private getDefaultPerformance;
    /**
     * Record algorithm selection for learning
     */
    private recordSelection;
    /**
     * Update performance model with new results
     */
    updatePerformanceModel(result: PerformanceRecord): void;
    /**
     * Update selection statistics
     */
    private updateSelectionStats;
    /**
     * Get selection statistics
     */
    getSelectionStats(): SelectionStats;
    /**
     * Get performance history
     */
    getPerformanceHistory(): PerformanceRecord[];
    /**
     * Clear performance history
     */
    clearPerformanceHistory(): void;
}
