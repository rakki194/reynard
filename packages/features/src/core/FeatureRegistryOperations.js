/**
 * Feature Registry Operations
 *
 * Operations for the feature registry.
 */
/**
 * Register a new feature
 */
export function registerFeature(core, feature) {
    const current = core.getFunctionalities();
    const updated = new Map(current);
    updated.set(feature.id, feature);
    core.setFunctionalities(updated);
}
/**
 * Unregister a feature
 */
export function unregisterFeature(core, featureId) {
    const current = core.getFunctionalities();
    const updated = new Map(current);
    updated.delete(featureId);
    core.setFunctionalities(updated);
}
/**
 * Get a feature by ID
 */
export function getFeature(core, featureId) {
    const functionalities = core.getFunctionalities();
    return functionalities.get(featureId);
}
/**
 * Get all features
 */
export function getAllFeatures(core) {
    const functionalities = core.getFunctionalities();
    return Array.from(functionalities.values());
}
/**
 * Check if a feature is registered
 */
export function isFeatureRegistered(core, featureId) {
    const functionalities = core.getFunctionalities();
    return functionalities.has(featureId);
}
/**
 * Get features by category
 */
export function getFeaturesByCategory(core, category) {
    const functionalities = core.getFunctionalities();
    return Array.from(functionalities.values()).filter((feature) => feature.category === category);
}
/**
 * Get features by status
 */
export function getFeaturesByStatus(core, status) {
    const functionalities = core.getFunctionalities();
    return Array.from(functionalities.values()).filter((feature) => {
        if (status === "enabled")
            return feature.enabled === true;
        if (status === "disabled")
            return feature.enabled === false;
        return false;
    });
}
