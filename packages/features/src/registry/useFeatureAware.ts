/**
 * Feature Aware Hooks
 *
 * Advanced hooks for feature-aware components and configuration management.
 */

import { createMemo } from "solid-js";
import type { FeatureContext } from "../core/types";

/**
 * Hook to create a feature-aware component
 */
export function useFeatureAware(
  featureId: string, 
  context: FeatureContext, 
  fallback?: unknown
) {
  const isAvailable = createMemo(() => context.isFeatureAvailable(featureId));
  const isDegraded = createMemo(() => context.isFeatureDegraded(featureId));
  const status = createMemo(() => context.getFeatureStatus(featureId));

  return {
    isAvailable,
    isDegraded,
    status,
    shouldRender: createMemo(() => isAvailable() || isDegraded()),
    fallback,
  };
}

/**
 * Hook to manage feature configuration
 */
export function useFeatureConfiguration(featureId: string, context: FeatureContext) {
  const config = createMemo(() => context.getFeatureConfig(featureId));

  const updateConfig = (newConfig: Record<string, unknown>) => {
    context.configureFeature(featureId, newConfig);
  };

  const setConfigValue = (key: string, value: unknown) => {
    const currentConfig = config() || {};
    updateConfig({
      ...currentConfig,
      [key]: value,
    });
  };

  return {
    config,
    updateConfig,
    setConfigValue,
  };
}