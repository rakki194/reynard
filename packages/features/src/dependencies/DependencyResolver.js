/**
 * Dependency Resolver
 *
 * Main dependency resolver implementation.
 */
import { createDependencyResolverCore, } from "./DependencyResolverCore.js";
import { getDependencyStats } from "./DependencyResolverStats.js";
/**
 * Dependency resolver for managing feature dependencies
 */
export class DependencyResolver {
    constructor() {
        Object.defineProperty(this, "core", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.core = createDependencyResolverCore();
    }
    /**
     * Add a feature to the resolver
     */
    addFeature(feature) {
        this.core.features.set(feature.id, feature);
    }
    /**
     * Remove a feature from the resolver
     */
    removeFeature(featureId) {
        this.core.features.delete(featureId);
    }
    /**
     * Get a feature by ID
     */
    getFeature(featureId) {
        return this.core.features.get(featureId);
    }
    /**
     * Get all features
     */
    getAllFeatures() {
        return Array.from(this.core.features.values());
    }
    /**
     * Set service availability
     */
    setServiceAvailability(serviceId, available) {
        this.core.serviceAvailability.set(serviceId, available);
    }
    /**
     * Check if a service is available
     */
    isServiceAvailable(serviceId) {
        return this.core.serviceAvailability.get(serviceId) ?? false;
    }
    /**
     * Resolve dependencies for all features
     */
    resolveDependencies() {
        const features = this.getAllFeatures();
        const resolvable = [];
        const unresolvable = [];
        const dependencyGraph = new Map();
        const resolutionOrder = [];
        // Build dependency graph
        features.forEach((feature) => {
            dependencyGraph.set(feature.id, (feature.dependencies || []).map((dep) => dep.services).flat());
        });
        // Resolve dependencies
        features.forEach((feature) => {
            const missingDependencies = this.getMissingDependencies(feature);
            if (missingDependencies.length === 0) {
                resolvable.push(feature);
                resolutionOrder.push(feature.id);
            }
            else {
                unresolvable.push({
                    feature,
                    missingDependencies,
                });
            }
        });
        return {
            resolvable,
            unresolvable,
            dependencyGraph,
            resolutionOrder,
        };
    }
    /**
     * Get missing dependencies for a feature
     */
    getMissingDependencies(feature) {
        const missing = [];
        if (feature.dependencies) {
            feature.dependencies.forEach((dep) => {
                dep.services.forEach((service) => {
                    if (!this.isServiceAvailable(service)) {
                        missing.push(service);
                    }
                });
            });
        }
        return missing;
    }
    /**
     * Get dependency statistics
     */
    getDependencyStats() {
        return getDependencyStats(this.core);
    }
}
