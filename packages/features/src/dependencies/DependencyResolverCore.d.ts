/**
 * Dependency Resolver Core
 *
 * Core functionality for the dependency resolver.
 */
import type { FeatureDefinition } from "../core/types.js";
export interface DependencyResolverCore {
    features: Map<string, FeatureDefinition>;
    serviceAvailability: Map<string, boolean>;
}
/**
 * Create dependency resolver core
 */
export declare function createDependencyResolverCore(): DependencyResolverCore;
/**
 * Add a feature to the resolver
 */
export declare function addFeature(core: DependencyResolverCore, feature: FeatureDefinition): void;
/**
 * Remove a feature from the resolver
 */
export declare function removeFeature(core: DependencyResolverCore, featureId: string): void;
/**
 * Get a feature by ID
 */
export declare function getFeature(core: DependencyResolverCore, featureId: string): FeatureDefinition | undefined;
/**
 * Get all features
 */
export declare function getAllFeatures(core: DependencyResolverCore): FeatureDefinition[];
/**
 * Set service availability
 */
export declare function setServiceAvailability(core: DependencyResolverCore, serviceId: string, available: boolean): void;
/**
 * Check if a service is available
 */
export declare function isServiceAvailable(core: DependencyResolverCore, serviceId: string): boolean;
