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
export function createDependencyResolverCore(): DependencyResolverCore {
  return {
    features: new Map(),
    serviceAvailability: new Map(),
  };
}

/**
 * Add a feature to the resolver
 */
export function addFeature(core: DependencyResolverCore, feature: FeatureDefinition): void {
  core.features.set(feature.id, feature);
}

/**
 * Remove a feature from the resolver
 */
export function removeFeature(core: DependencyResolverCore, featureId: string): void {
  core.features.delete(featureId);
}

/**
 * Get a feature by ID
 */
export function getFeature(core: DependencyResolverCore, featureId: string): FeatureDefinition | undefined {
  return core.features.get(featureId);
}

/**
 * Get all features
 */
export function getAllFeatures(core: DependencyResolverCore): FeatureDefinition[] {
  return Array.from(core.features.values());
}

/**
 * Set service availability
 */
export function setServiceAvailability(core: DependencyResolverCore, serviceId: string, available: boolean): void {
  core.serviceAvailability.set(serviceId, available);
}

/**
 * Check if a service is available
 */
export function isServiceAvailable(core: DependencyResolverCore, serviceId: string): boolean {
  return core.serviceAvailability.get(serviceId) ?? false;
}
