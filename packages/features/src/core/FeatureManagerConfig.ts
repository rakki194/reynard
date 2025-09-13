/**
 * Feature Manager Config
 *
 * Configuration management for the feature manager.
 */

import type { FeatureManagerCore } from "./FeatureManagerCore.js";

/**
 * Get feature config
 */
export function getFeatureConfig(
  core: FeatureManagerCore,
  featureId: string,
): Record<string, unknown> {
  const [configs] = core.featureConfigsSignal;
  return configs()[featureId] || {};
}

/**
 * Set feature config
 */
export function setFeatureConfig(
  core: FeatureManagerCore,
  featureId: string,
  config: Record<string, unknown>,
): void {
  const [, setConfigs] = core.featureConfigsSignal;
  setConfigs((prev) => ({
    ...prev,
    [featureId]: config,
  }));
}

/**
 * Get all feature configs
 */
export function getAllFeatureConfigs(
  core: FeatureManagerCore,
): Record<string, Record<string, unknown>> {
  const [configs] = core.featureConfigsSignal;
  return configs();
}
