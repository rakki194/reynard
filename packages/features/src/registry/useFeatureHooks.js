/**
 * Feature Hooks
 *
 * Base hook implementations for feature management functionality.
 */
import { createMemo } from "solid-js";
/**
 * Hook to check if a feature is available
 */
export function useFeatureAvailable(featureId, context) {
    return createMemo(() => context.isFeatureAvailable(featureId));
}
/**
 * Hook to check if a feature is degraded
 */
export function useFeatureDegraded(featureId, context) {
    return createMemo(() => context.isFeatureDegraded(featureId));
}
/**
 * Hook to get feature status
 */
export function useFeatureStatus(featureId, context) {
    return createMemo(() => context.getFeatureStatus(featureId));
}
/**
 * Hook to get feature configuration
 */
export function useFeatureConfig(featureId, context) {
    return createMemo(() => context.getFeatureConfig(featureId));
}
/**
 * Hook to get available features by category
 */
export function useFeaturesByCategory(category, context) {
    return createMemo(() => {
        const available = context.availableFeatures();
        return available.filter((feature) => feature.category === category);
    });
}
/**
 * Hook to get features by priority
 */
export function useFeaturesByPriority(priority, context) {
    return createMemo(() => {
        const available = context.availableFeatures();
        return available.filter((feature) => feature.priority === priority);
    });
}
/**
 * Hook to get critical features status
 */
export function useCriticalFeatures(context) {
    return createMemo(() => {
        const available = context.availableFeatures();
        const critical = available.filter((feature) => feature.priority === "critical");
        const unavailable = context
            .degradedFeatures()
            .filter((feature) => feature.priority === "critical");
        return {
            available: critical.length > 0,
            unavailable: unavailable,
        };
    });
}
/**
 * Hook to get features dependent on a service
 */
export function useFeaturesByService(serviceName, context) {
    return createMemo(() => {
        const available = context.availableFeatures();
        return available.filter((feature) => feature.dependencies.some((dep) => dep.services.includes(serviceName)));
    });
}
