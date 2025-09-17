import { Component } from "solid-js";
/**
 * Feature dependency definition
 */
export interface FeatureDependency {
    /** Services required for this dependency */
    services: string[];
    /** Whether this dependency is required (default: true) */
    required?: boolean;
    /** Custom message when dependency is unavailable */
    message?: string;
    /** Minimum version requirement */
    minVersion?: string;
    /** Maximum version requirement */
    maxVersion?: string;
    /** Additional configuration for the dependency */
    config?: Record<string, any>;
}
/**
 * Feature definition interface
 */
export interface FeatureDefinition {
    /** Unique identifier for the feature */
    id: string;
    /** Human-readable name */
    name: string;
    /** Description of the feature */
    description: string;
    /** Dependencies required for this feature */
    dependencies: FeatureDependency[];
    /** Feature category */
    category: "core" | "ml" | "integration" | "utility" | "ui" | "data";
    /** Feature priority level */
    priority: "critical" | "high" | "medium" | "low";
    /** Feature version */
    version?: string;
    /** Whether the feature is enabled by default */
    enabled?: boolean;
    /** Feature tags for categorization */
    tags?: string[];
    /** Feature configuration schema */
    configSchema?: Record<string, any>;
    /** Default configuration values */
    defaultConfig?: Record<string, any>;
    /** Component to render for this feature (optional) */
    component?: Component<any>;
    /** Icon identifier for the feature */
    icon?: string;
    /** Feature author */
    author?: string;
    /** License information */
    license?: string;
    /** Documentation URL */
    documentation?: string;
    /** Repository URL */
    repository?: string;
}
/**
 * Feature status information
 */
export interface FeatureStatus {
    /** Feature ID */
    id: string;
    /** Feature name */
    name: string;
    /** Whether the feature is available */
    available: boolean;
    /** Whether the feature is degraded */
    degraded: boolean;
    /** Status message */
    message?: string;
    /** Missing required services */
    missingServices: string[];
    /** Degraded optional services */
    degradedServices: string[];
    /** Feature configuration */
    config?: Record<string, any>;
    /** Last status update timestamp */
    lastUpdated?: number;
    /** Feature health score (0-100) */
    healthScore?: number;
}
/**
 * Feature capability definition
 */
export interface FeatureCapability {
    /** Capability ID */
    id: string;
    /** Capability name */
    name: string;
    /** Capability description */
    description: string;
    /** Features that provide this capability */
    providers: string[];
    /** Whether this capability is available */
    available: boolean;
    /** Capability priority */
    priority: "critical" | "high" | "medium" | "low";
}
/**
 * Feature group definition
 */
export interface FeatureGroup {
    /** Group ID */
    id: string;
    /** Group name */
    name: string;
    /** Group description */
    description: string;
    /** Features in this group */
    features: string[];
    /** Group category */
    category: string;
    /** Whether the group is enabled */
    enabled: boolean;
}
/**
 * Feature configuration options
 */
export interface FeatureConfig {
    /** Features to register */
    features: FeatureDefinition[];
    /** Feature groups */
    groups?: FeatureGroup[];
    /** Capabilities to register */
    capabilities?: FeatureCapability[];
    /** Auto-refresh feature status */
    autoRefresh?: boolean;
    /** Refresh interval in milliseconds */
    refreshInterval?: number;
    /** Service availability checker */
    serviceChecker?: (serviceName: string) => boolean;
    /** Feature status change handler */
    onStatusChange?: (featureId: string, status: FeatureStatus) => void;
    /** Feature availability change handler */
    onAvailabilityChange?: (featureId: string, available: boolean) => void;
    /** Global feature configuration */
    globalConfig?: Record<string, any>;
}
/**
 * Feature registry interface
 */
export interface FeatureRegistry {
    /** Register a feature */
    register(feature: FeatureDefinition): void;
    /** Unregister a feature */
    unregister(featureId: string): void;
    /** Get a feature by ID */
    get(featureId: string): FeatureDefinition | undefined;
    /** Get all registered features */
    getAll(): FeatureDefinition[];
    /** Get features by category */
    getByCategory(category: string): FeatureDefinition[];
    /** Get features by priority */
    getByPriority(priority: string): FeatureDefinition[];
    /** Get features by tag */
    getByTag(tag: string): FeatureDefinition[];
    /** Check if feature is registered */
    has(featureId: string): boolean;
    /** Check if feature is enabled */
    isEnabled(featureId: string): boolean;
    /** Clear all features */
    clear(): void;
    /** Get registry size */
    get size(): number;
}
/**
 * Feature manager interface
 */
export interface FeatureManager {
    /** Feature registry */
    registry: FeatureRegistry;
    /** Get feature status */
    getFeatureStatus(featureId: string): FeatureStatus | null;
    /** Check if feature is available */
    isFeatureAvailable(featureId: string): boolean;
    /** Check if feature is degraded */
    isFeatureDegraded(featureId: string): boolean;
    /** Get available features */
    getAvailableFeatures(): FeatureDefinition[];
    /** Get degraded features */
    getDegradedFeatures(): FeatureDefinition[];
    /** Get features by category */
    getFeaturesByCategory(category: string): FeatureDefinition[];
    /** Get features by priority */
    getFeaturesByPriority(priority: string): FeatureDefinition[];
    /** Get unavailable critical features */
    getUnavailableCriticalFeatures(): FeatureDefinition[];
    /** Get features dependent on service */
    getFeaturesDependentOnService(serviceName: string): FeatureDefinition[];
    /** Get critical services */
    getCriticalServices(): string[];
    /** Check if critical features are available */
    areCriticalFeaturesAvailable(): boolean;
    /** Get feature summary */
    getFeatureSummary(): {
        total: number;
        available: number;
        degraded: number;
        unavailable: number;
        criticalUnavailable: number;
        successRate: number;
    };
    /** Update feature statuses */
    updateFeatureStatuses(): void;
    /** Refresh feature statuses */
    refreshFeatureStatuses(): void;
    /** Configure feature */
    configureFeature(featureId: string, config: Record<string, any>): void;
    /** Get feature configuration */
    getFeatureConfig(featureId: string): Record<string, any> | undefined;
}
/**
 * Feature context interface for SolidJS
 */
export interface FeatureContext {
    /** Feature manager instance */
    manager: FeatureManager;
    /** Feature statuses signal */
    featureStatuses: () => Record<string, FeatureStatus>;
    /** Available features signal */
    availableFeatures: () => FeatureDefinition[];
    /** Degraded features signal */
    degradedFeatures: () => FeatureDefinition[];
    /** Feature summary signal */
    featureSummary: () => {
        total: number;
        available: number;
        degraded: number;
        unavailable: number;
        criticalUnavailable: number;
        successRate: number;
    };
    /** Check if feature is available */
    isFeatureAvailable: (featureId: string) => boolean;
    /** Check if feature is degraded */
    isFeatureDegraded: (featureId: string) => boolean;
    /** Get feature status */
    getFeatureStatus: (featureId: string) => FeatureStatus | null;
    /** Configure feature */
    configureFeature: (featureId: string, config: Record<string, any>) => void;
    /** Get feature configuration */
    getFeatureConfig: (featureId: string) => Record<string, any> | undefined;
    /** Refresh feature statuses */
    refreshFeatureStatuses: () => void;
}
