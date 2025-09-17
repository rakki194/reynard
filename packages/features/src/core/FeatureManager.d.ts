/**
 * Feature Manager
 *
 * Main feature manager implementation.
 */
import type { FeatureStatus, FeatureConfig, FeatureManager as IFeatureManager } from "./types.js";
/**
 * Feature manager implementation
 */
export declare class FeatureManager implements IFeatureManager {
    private core;
    constructor(config: FeatureConfig);
    /**
     * Get feature status
     */
    getFeatureStatus(featureId: string): FeatureStatus;
    /**
     * Set feature status
     */
    setFeatureStatus(featureId: string, status: FeatureStatus): void;
    /**
     * Get all feature statuses
     */
    getAllFeatureStatuses(): Record<string, FeatureStatus>;
    /**
     * Get feature config
     */
    getFeatureConfig(featureId: string): Record<string, unknown>;
    /**
     * Set feature config
     */
    setFeatureConfig(featureId: string, config: Record<string, unknown>): void;
    /**
     * Get all feature configs
     */
    getAllFeatureConfigs(): Record<string, Record<string, unknown>>;
    /**
     * Refresh feature statuses
     */
    refreshFeatureStatuses(): void;
    /**
     * Start refresh timer
     */
    private startRefreshTimer;
    /**
     * Stop refresh timer
     */
    private stopRefreshTimer;
    /**
     * Get registry
     */
    get registry(): import("./types.js").FeatureRegistry;
    /**
     * Check if feature is available
     */
    isFeatureAvailable(featureId: string): boolean;
    /**
     * Check if feature is degraded
     */
    isFeatureDegraded(featureId: string): boolean;
    /**
     * Get available features
     */
    getAvailableFeatures(): import("./types.js").FeatureDefinition[];
    /**
     * Get degraded features
     */
    getDegradedFeatures(): import("./types.js").FeatureDefinition[];
    /**
     * Get features by category
     */
    getFeaturesByCategory(category: string): import("./types.js").FeatureDefinition[];
    /**
     * Get features by priority
     */
    getFeaturesByPriority(priority: string): import("./types.js").FeatureDefinition[];
    /**
     * Get unavailable critical features
     */
    getUnavailableCriticalFeatures(): import("./types.js").FeatureDefinition[];
    /**
     * Get features dependent on service
     */
    getFeaturesDependentOnService(serviceName: string): import("./types.js").FeatureDefinition[];
    /**
     * Get critical services
     */
    getCriticalServices(): string[];
    /**
     * Check if critical features are available
     */
    areCriticalFeaturesAvailable(): boolean;
    /**
     * Get feature summary
     */
    getFeatureSummary(): {
        total: number;
        available: number;
        degraded: number;
        unavailable: number;
        criticalUnavailable: number;
        successRate: number;
    };
    /**
     * Update feature statuses (alias for refresh)
     */
    updateFeatureStatuses(): void;
    /**
     * Configure feature
     */
    configureFeature(featureId: string, config: Record<string, any>): void;
    /**
     * Get feature statuses signal
     */
    getFeatureStatusesSignal(): import("solid-js").Accessor<Record<string, FeatureStatus>>;
    /**
     * Cleanup
     */
    onCleanup(): void;
}
