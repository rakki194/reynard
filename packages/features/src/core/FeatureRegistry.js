/**
 * Feature Registry
 *
 * Main feature registry implementation.
 */
import { createFeatureRegistryCore, } from "./FeatureRegistryCore.js";
import { registerFeature, unregisterFeature, getFeature, getAllFeatures, isFeatureRegistered, getFeaturesByCategory, getFeaturesByStatus, } from "./FeatureRegistryOperations.js";
/**
 * Feature registry implementation
 */
export class FeatureRegistry {
    constructor() {
        Object.defineProperty(this, "core", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.core = createFeatureRegistryCore();
    }
    /**
     * Register a new feature
     */
    register(feature) {
        registerFeature(this.core, feature);
    }
    /**
     * Unregister a feature
     */
    unregister(featureId) {
        unregisterFeature(this.core, featureId);
    }
    /**
     * Get a feature by ID
     */
    get(featureId) {
        return getFeature(this.core, featureId);
    }
    /**
     * Get all features
     */
    getAll() {
        return getAllFeatures(this.core);
    }
    /**
     * Check if a feature is registered
     */
    has(featureId) {
        return isFeatureRegistered(this.core, featureId);
    }
    /**
     * Get features by category
     */
    getByCategory(category) {
        return getFeaturesByCategory(this.core, category);
    }
    /**
     * Get features by status
     */
    getByStatus(status) {
        return getFeaturesByStatus(this.core, status);
    }
    /**
     * Get features by priority
     */
    getByPriority(priority) {
        const allFeatures = this.getAll();
        return allFeatures.filter((feature) => feature.priority === priority);
    }
    /**
     * Get features by tag
     */
    getByTag(tag) {
        const allFeatures = this.getAll();
        return allFeatures.filter((feature) => feature.tags?.includes(tag) ?? false);
    }
    /**
     * Get feature count
     */
    getCount() {
        return this.core.getFunctionalities().size;
    }
    /**
     * Get registry size
     */
    get size() {
        return this.getCount();
    }
    /**
     * Clear all features
     */
    clear() {
        const allFeatures = this.getAll();
        for (const feature of allFeatures) {
            this.unregister(feature.id);
        }
    }
    /**
     * Check if a feature is enabled
     */
    isEnabled(featureId) {
        const feature = this.get(featureId);
        return feature?.enabled ?? false;
    }
    /**
     * Get feature statistics
     */
    getStats() {
        const features = this.getAll();
        const enabled = features.filter((f) => f.enabled).length;
        const disabled = features.filter((f) => !f.enabled).length;
        const categories = new Set(features.map((f) => f.category)).size;
        return {
            total: features.length,
            enabled,
            disabled,
            categories,
        };
    }
}
