/**
 * Feature Aware Hooks
 *
 * Advanced hooks for feature-aware components and configuration management.
 */
import { createMemo } from "solid-js";
/**
 * Hook to create a feature-aware component
 */
export function useFeatureAware(featureId, context, fallback) {
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
export function useFeatureConfiguration(featureId, context) {
    const config = createMemo(() => context.getFeatureConfig(featureId));
    const updateConfig = (newConfig) => {
        context.configureFeature(featureId, newConfig);
    };
    const setConfigValue = (key, value) => {
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
