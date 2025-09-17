/**
 * Workload Analysis Utilities
 *
 * Analyzes collision detection workloads to determine optimal algorithm selection.
 * Provides insights into spatial distribution, overlap patterns, and query characteristics.
 *
 * @module algorithms/optimization/workloadAnalyzer
 */
import type { AABB } from "../../geometry/collision/aabb-types";
import type { WorkloadCharacteristics } from "../core/algorithm-selector";
export interface WorkloadAnalysisResult {
    characteristics: WorkloadCharacteristics;
    recommendations: {
        preferredAlgorithm: string;
        confidence: number;
        reasoning: string;
    };
}
/**
 * Analyze workload characteristics for algorithm selection
 */
export declare function analyzeWorkload(aabbs: AABB[]): WorkloadCharacteristics;
/**
 * Calculate spatial density of objects
 */
export declare function calculateSpatialDensity(aabbs: AABB[]): number;
/**
 * Calculate overlap ratio between objects
 */
export declare function calculateOverlapRatio(aabbs: AABB[]): number;
/**
 * Analyze query pattern based on spatial distribution
 */
export declare function analyzeQueryPattern(aabbs: AABB[]): "random" | "clustered" | "sequential";
/**
 * Get algorithm recommendation based on workload analysis
 */
export declare function getAlgorithmRecommendation(characteristics: WorkloadCharacteristics): WorkloadAnalysisResult["recommendations"];
