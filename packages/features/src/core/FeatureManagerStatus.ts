/**
 * Feature Manager Status
 *
 * Status management for the feature manager.
 */

import type { FeatureStatus } from "./types.js";
import type { FeatureManagerCore } from "./FeatureManagerCore.js";

/**
 * Get feature status
 */
export function getFeatureStatus(
  core: FeatureManagerCore,
  featureId: string,
): FeatureStatus {
  const [statuses] = core.featureStatusesSignal;
  return statuses()[featureId] || "unknown";
}

/**
 * Set feature status
 */
export function setFeatureStatus(
  core: FeatureManagerCore,
  featureId: string,
  status: FeatureStatus,
): void {
  const [, setStatuses] = core.featureStatusesSignal;
  setStatuses((prev) => ({
    ...prev,
    [featureId]: status,
  }));
}

/**
 * Get all feature statuses
 */
export function getAllFeatureStatuses(
  core: FeatureManagerCore,
): Record<string, FeatureStatus> {
  const [statuses] = core.featureStatusesSignal;
  return statuses();
}

/**
 * Refresh feature statuses
 */
export function refreshFeatureStatuses(core: FeatureManagerCore): void {
  const features = core.registry.getAll();

  for (const feature of features) {
    const isEnabled = core.registry.isEnabled(feature.id);
    const status: FeatureStatus = {
      id: feature.id,
      name: feature.name,
      available: isEnabled,
      degraded: false,
      message: isEnabled ? "Feature is available" : "Feature is disabled",
      missingServices: [],
      degradedServices: [],
      config: {},
      lastUpdated: Date.now(),
      healthScore: isEnabled ? 100 : 0,
    };
    setFeatureStatus(core, feature.id, status);
  }
}
