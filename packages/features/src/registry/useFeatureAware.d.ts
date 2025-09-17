/**
 * Feature Aware Hooks
 *
 * Advanced hooks for feature-aware components and configuration management.
 */
import type { FeatureContext } from "../core/types";
/**
 * Hook to create a feature-aware component
 */
export declare function useFeatureAware(featureId: string, context: FeatureContext, fallback?: unknown): {
    isAvailable: import("solid-js").Accessor<boolean>;
    isDegraded: import("solid-js").Accessor<boolean>;
    status: import("solid-js").Accessor<import("..").FeatureStatus | null>;
    shouldRender: import("solid-js").Accessor<boolean>;
    fallback: unknown;
};
/**
 * Hook to manage feature configuration
 */
export declare function useFeatureConfiguration(featureId: string, context: FeatureContext): {
    config: import("solid-js").Accessor<Record<string, any> | undefined>;
    updateConfig: (newConfig: Record<string, unknown>) => void;
    setConfigValue: (key: string, value: unknown) => void;
};
