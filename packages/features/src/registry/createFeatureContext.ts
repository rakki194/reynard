/**
 * Create Feature Context
 *
 * Creates a feature context with proper manager integration and reactive signals.
 */

import { createMemo } from "solid-js";
import type { FeatureContext, FeatureConfig } from "../core/types";
import { FeatureManager } from "../core/FeatureManager";

/**
 * Create available features memo
 */
function createAvailableFeaturesMemo(manager: FeatureManager) {
  return createMemo(() => {
    const statuses = manager.getAllFeatureStatuses();
    const allFeatures = manager.registry.getAll();
    return allFeatures.filter(feature => {
      const status = statuses[feature.id];
      return status?.available ?? false;
    });
  });
}

/**
 * Create degraded features memo
 */
function createDegradedFeaturesMemo(manager: FeatureManager) {
  return createMemo(() => {
    const statuses = manager.getAllFeatureStatuses();
    const allFeatures = manager.registry.getAll();
    return allFeatures.filter(feature => {
      const status = statuses[feature.id];
      return status?.degraded ?? false;
    });
  });
}

/**
 * Create feature summary memo
 */
function createFeatureSummaryMemo(manager: FeatureManager) {
  return createMemo(() => {
    const statuses = manager.getAllFeatureStatuses();
    const total = Object.keys(statuses).length;
    const available = Object.values(statuses).filter(s => s.available).length;
    const degraded = Object.values(statuses).filter(s => s.degraded).length;
    const unavailable = total - available - degraded;
    return {
      total,
      available,
      degraded,
      unavailable,
      criticalUnavailable: 0, // TODO: implement critical feature detection
      successRate: total > 0 ? (available / total) * 100 : 0
    };
  });
}

/**
 * Create a feature context from configuration
 */
export function createFeatureContext(config: FeatureConfig): FeatureContext {
  const manager = new FeatureManager(config);

  return {
    manager,
    featureStatuses: () => manager.getAllFeatureStatuses(),
    availableFeatures: createAvailableFeaturesMemo(manager),
    degradedFeatures: createDegradedFeaturesMemo(manager),
    featureSummary: createFeatureSummaryMemo(manager),
    isFeatureAvailable: (featureId: string) => {
      const status = manager.getFeatureStatus(featureId);
      return status?.available ?? false;
    },
    isFeatureDegraded: (featureId: string) => {
      const status = manager.getFeatureStatus(featureId);
      return status?.degraded ?? false;
    },
    getFeatureStatus: (featureId: string) =>
      manager.getFeatureStatus(featureId),
    configureFeature: (featureId: string, config: Record<string, unknown>) =>
      manager.setFeatureConfig(featureId, config),
    getFeatureConfig: (featureId: string) =>
      manager.getFeatureConfig(featureId),
    refreshFeatureStatuses: () => manager.refreshFeatureStatuses(),
  };
}