/**
 * Feature Registry
 *
 * Main feature registry implementation.
 */
import type { FeatureDefinition, FeatureRegistry as IFeatureRegistry } from "./types.js";
/**
 * Feature registry implementation
 */
export declare class FeatureRegistry implements IFeatureRegistry {
    private core;
    constructor();
    /**
     * Register a new feature
     */
    register(feature: FeatureDefinition): void;
    /**
     * Unregister a feature
     */
    unregister(featureId: string): void;
    /**
     * Get a feature by ID
     */
    get(featureId: string): FeatureDefinition | undefined;
    /**
     * Get all features
     */
    getAll(): FeatureDefinition[];
    /**
     * Check if a feature is registered
     */
    has(featureId: string): boolean;
    /**
     * Get features by category
     */
    getByCategory(category: string): FeatureDefinition[];
    /**
     * Get features by status
     */
    getByStatus(status: string): FeatureDefinition[];
    /**
     * Get features by priority
     */
    getByPriority(priority: string): FeatureDefinition[];
    /**
     * Get features by tag
     */
    getByTag(tag: string): FeatureDefinition[];
    /**
     * Get feature count
     */
    getCount(): number;
    /**
     * Get registry size
     */
    get size(): number;
    /**
     * Clear all features
     */
    clear(): void;
    /**
     * Check if a feature is enabled
     */
    isEnabled(featureId: string): boolean;
    /**
     * Get feature statistics
     */
    getStats(): {
        total: number;
        enabled: number;
        disabled: number;
        categories: number;
    };
}
