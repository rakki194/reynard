import { JSX } from "solid-js";
import type { FeatureContext, FeatureConfig } from "../core/types";
/**
 * Feature provider component props
 */
export interface FeatureProviderProps {
    config: FeatureConfig;
    children: JSX.Element;
}
/**
 * Feature provider component
 */
export declare function FeatureProvider(props: FeatureProviderProps): any;
/**
 * Hook to use the feature context
 */
export declare function useFeatures(): FeatureContext;
/**
 * Hook to check if a feature is available
 */
export declare function useFeatureAvailable(featureId: string): import("solid-js").Accessor<boolean>;
/**
 * Hook to check if a feature is degraded
 */
export declare function useFeatureDegraded(featureId: string): import("solid-js").Accessor<boolean>;
/**
 * Hook to get feature status
 */
export declare function useFeatureStatus(featureId: string): import("solid-js").Accessor<import("..").FeatureStatus | null>;
/**
 * Hook to get feature configuration
 */
export declare function useFeatureConfig(featureId: string): import("solid-js").Accessor<Record<string, any> | undefined>;
/**
 * Hook to get available features by category
 */
export declare function useFeaturesByCategory(category: string): import("solid-js").Accessor<import("..").FeatureDefinition[]>;
/**
 * Hook to get features by priority
 */
export declare function useFeaturesByPriority(priority: string): import("solid-js").Accessor<import("..").FeatureDefinition[]>;
/**
 * Hook to get critical features status
 */
export declare function useCriticalFeatures(): import("solid-js").Accessor<{
    available: boolean;
    unavailable: import("..").FeatureDefinition[];
}>;
/**
 * Hook to get features dependent on a service
 */
export declare function useFeaturesByService(serviceName: string): import("solid-js").Accessor<import("..").FeatureDefinition[]>;
/**
 * Hook to create a feature-aware component
 */
export declare function useFeatureAware(featureId: string, fallback?: unknown): {
    isAvailable: import("solid-js").Accessor<boolean>;
    isDegraded: import("solid-js").Accessor<boolean>;
    status: import("solid-js").Accessor<import("..").FeatureStatus | null>;
    shouldRender: import("solid-js").Accessor<boolean>;
    fallback: unknown;
};
/**
 * Hook to manage feature configuration
 */
export declare function useFeatureConfiguration(featureId: string): {
    config: import("solid-js").Accessor<Record<string, any> | undefined>;
    updateConfig: (newConfig: Record<string, unknown>) => void;
    setConfigValue: (key: string, value: unknown) => void;
};
