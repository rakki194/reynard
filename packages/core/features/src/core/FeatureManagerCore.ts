/**
 * Feature Manager Core
 *
 * Core functionality for the feature manager.
 */

import { createSignal } from "solid-js";
import type { FeatureStatus, FeatureConfig, FeatureRegistry } from "./types.js";
import { FeatureRegistry as FeatureRegistryImpl } from "./FeatureRegistry.js";

export interface FeatureManagerCore {
  registry: FeatureRegistry;
  config: FeatureConfig;
  featureStatusesSignal: ReturnType<typeof createSignal<Record<string, FeatureStatus>>>;
  featureConfigsSignal: ReturnType<typeof createSignal<Record<string, Record<string, unknown>>>>;
  refreshTimer: ReturnType<typeof setInterval> | undefined;
}

/**
 * Create feature manager core
 */
export function createFeatureManagerCore(config: FeatureConfig): FeatureManagerCore {
  const featureStatusesSignal = createSignal<Record<string, FeatureStatus>>({});
  const featureConfigsSignal = createSignal<Record<string, Record<string, unknown>>>({});

  const registry = new FeatureRegistryImpl();

  // Register features from config
  if (config.features) {
    for (const feature of config.features) {
      registry.register(feature);
    }
  }

  return {
    registry,
    config,
    featureStatusesSignal,
    featureConfigsSignal,
    refreshTimer: undefined,
  };
}
