/**
 * Dependency Resolver Stats
 *
 * Statistics for the dependency resolver.
 */
import type { DependencyResolverCore } from "./DependencyResolverCore.js";
/**
 * Get dependency statistics
 */
export declare function getDependencyStats(core: DependencyResolverCore): {
    totalFeatures: number;
    featuresWithDependencies: number;
    featuresWithoutDependencies: number;
    totalDependencies: number;
    averageDependencies: number;
    maxDependencies: number;
    minDependencies: number;
    dependencyCounts: {
        [k: string]: number;
    };
};
