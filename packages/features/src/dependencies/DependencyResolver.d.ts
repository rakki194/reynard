/**
 * Dependency Resolver
 *
 * Main dependency resolver implementation.
 */
import type { FeatureDefinition } from "../core/types.js";
/**
 * Dependency resolution result
 */
export interface DependencyResolutionResult {
    /** Features that can be resolved */
    resolvable: FeatureDefinition[];
    /** Features that cannot be resolved due to missing dependencies */
    unresolvable: {
        feature: FeatureDefinition;
        missingDependencies: string[];
    }[];
    /** Dependency graph */
    dependencyGraph: Map<string, string[]>;
    /** Resolution order */
    resolutionOrder: string[];
}
/**
 * Dependency resolver for managing feature dependencies
 */
export declare class DependencyResolver {
    private core;
    constructor();
    /**
     * Add a feature to the resolver
     */
    addFeature(feature: FeatureDefinition): void;
    /**
     * Remove a feature from the resolver
     */
    removeFeature(featureId: string): void;
    /**
     * Get a feature by ID
     */
    getFeature(featureId: string): FeatureDefinition | undefined;
    /**
     * Get all features
     */
    getAllFeatures(): FeatureDefinition[];
    /**
     * Set service availability
     */
    setServiceAvailability(serviceId: string, available: boolean): void;
    /**
     * Check if a service is available
     */
    isServiceAvailable(serviceId: string): boolean;
    /**
     * Resolve dependencies for all features
     */
    resolveDependencies(): DependencyResolutionResult;
    /**
     * Get missing dependencies for a feature
     */
    private getMissingDependencies;
    /**
     * Get dependency statistics
     */
    getDependencyStats(): {
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
}
