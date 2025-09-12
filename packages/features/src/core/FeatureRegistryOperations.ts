/**
 * Feature Registry Operations
 *
 * Operations for the feature registry.
 */

import type { FeatureDefinition, FeatureRegistryCore } from "./FeatureRegistryCore.js";

/**
 * Register a new feature
 */
export function registerFeature(
  core: FeatureRegistryCore,
  feature: FeatureDefinition,
): void {
  const current = core.getFunctionalities();
  const updated = new Map(current);
  updated.set(feature.id, feature);
  core.setFunctionalities(updated);
}

/**
 * Unregister a feature
 */
export function unregisterFeature(
  core: FeatureRegistryCore,
  featureId: string,
): void {
  const current = core.getFunctionalities();
  const updated = new Map(current);
  updated.delete(featureId);
  core.setFunctionalities(updated);
}

/**
 * Get a feature by ID
 */
export function getFeature(
  core: FeatureRegistryCore,
  featureId: string,
): FeatureDefinition | undefined {
  const functionalities = core.getFunctionalities();
  return functionalities.get(featureId);
}

/**
 * Get all features
 */
export function getAllFeatures(
  core: FeatureRegistryCore,
): FeatureDefinition[] {
  const functionalities = core.getFunctionalities();
  return Array.from(functionalities.values());
}

/**
 * Check if a feature is registered
 */
export function isFeatureRegistered(
  core: FeatureRegistryCore,
  featureId: string,
): boolean {
  const functionalities = core.getFunctionalities();
  return functionalities.has(featureId);
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(
  core: FeatureRegistryCore,
  category: string,
): FeatureDefinition[] {
  const functionalities = core.getFunctionalities();
  return Array.from(functionalities.values()).filter(
    (feature) => feature.category === category,
  );
}

/**
 * Get features by status
 */
export function getFeaturesByStatus(
  core: FeatureRegistryCore,
  status: string,
): FeatureDefinition[] {
  const functionalities = core.getFunctionalities();
  return Array.from(functionalities.values()).filter(
    (feature) => feature.status === status,
  );
}

