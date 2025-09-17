/**
 * Feature Hooks
 *
 * Base hook implementations for feature management functionality.
 */
import type { FeatureContext } from "../core/types";
/**
 * Hook to check if a feature is available
 */
export declare function useFeatureAvailable(featureId: string, context: FeatureContext): import("solid-js").Accessor<boolean>;
/**
 * Hook to check if a feature is degraded
 */
export declare function useFeatureDegraded(featureId: string, context: FeatureContext): import("solid-js").Accessor<boolean>;
/**
 * Hook to get feature status
 */
export declare function useFeatureStatus(featureId: string, context: FeatureContext): import("solid-js").Accessor<import("..").FeatureStatus | null>;
/**
 * Hook to get feature configuration
 */
export declare function useFeatureConfig(featureId: string, context: FeatureContext): import("solid-js").Accessor<Record<string, any> | undefined>;
/**
 * Hook to get available features by category
 */
export declare function useFeaturesByCategory(category: string, context: FeatureContext): import("solid-js").Accessor<import("..").FeatureDefinition[]>;
/**
 * Hook to get features by priority
 */
export declare function useFeaturesByPriority(priority: string, context: FeatureContext): import("solid-js").Accessor<import("..").FeatureDefinition[]>;
/**
 * Hook to get critical features status
 */
export declare function useCriticalFeatures(context: FeatureContext): import("solid-js").Accessor<{
    available: boolean;
    unavailable: import("..").FeatureDefinition[];
}>;
/**
 * Hook to get features dependent on a service
 */
export declare function useFeaturesByService(serviceName: string, context: FeatureContext): import("solid-js").Accessor<import("..").FeatureDefinition[]>;
