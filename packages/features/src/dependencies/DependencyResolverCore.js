/**
 * Dependency Resolver Core
 *
 * Core functionality for the dependency resolver.
 */
/**
 * Create dependency resolver core
 */
export function createDependencyResolverCore() {
    return {
        features: new Map(),
        serviceAvailability: new Map(),
    };
}
/**
 * Add a feature to the resolver
 */
export function addFeature(core, feature) {
    core.features.set(feature.id, feature);
}
/**
 * Remove a feature from the resolver
 */
export function removeFeature(core, featureId) {
    core.features.delete(featureId);
}
/**
 * Get a feature by ID
 */
export function getFeature(core, featureId) {
    return core.features.get(featureId);
}
/**
 * Get all features
 */
export function getAllFeatures(core) {
    return Array.from(core.features.values());
}
/**
 * Set service availability
 */
export function setServiceAvailability(core, serviceId, available) {
    core.serviceAvailability.set(serviceId, available);
}
/**
 * Check if a service is available
 */
export function isServiceAvailable(core, serviceId) {
    return core.serviceAvailability.get(serviceId) ?? false;
}
