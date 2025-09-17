/**
 * Feature Registry Operations
 *
 * Operations for the feature registry.
 */
import type { FeatureDefinition } from "./types.js";
import type { FeatureRegistryCore } from "./FeatureRegistryCore.js";
/**
 * Register a new feature
 */
export declare function registerFeature(core: FeatureRegistryCore, feature: FeatureDefinition): void;
/**
 * Unregister a feature
 */
export declare function unregisterFeature(core: FeatureRegistryCore, featureId: string): void;
/**
 * Get a feature by ID
 */
export declare function getFeature(core: FeatureRegistryCore, featureId: string): FeatureDefinition | undefined;
/**
 * Get all features
 */
export declare function getAllFeatures(core: FeatureRegistryCore): FeatureDefinition[];
/**
 * Check if a feature is registered
 */
export declare function isFeatureRegistered(core: FeatureRegistryCore, featureId: string): boolean;
/**
 * Get features by category
 */
export declare function getFeaturesByCategory(core: FeatureRegistryCore, category: string): FeatureDefinition[];
/**
 * Get features by status
 */
export declare function getFeaturesByStatus(core: FeatureRegistryCore, status: string): FeatureDefinition[];
