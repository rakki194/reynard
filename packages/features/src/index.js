// Core feature system
export { FeatureRegistry, FeatureManager } from "./core";
// Registry and hooks
export { FeatureProvider, useFeatures, useFeatureAvailable, useFeatureDegraded, useFeatureStatus, useFeatureConfig, useFeaturesByCategory, useFeaturesByPriority, useCriticalFeatures, useFeaturesByService, useFeatureAware, useFeatureConfiguration, } from "./registry";
// Dependency management
export { DependencyResolver } from "./dependencies";
// Presets
export { COMMON_FEATURES, FEATURE_CATEGORIES, FEATURE_PRIORITIES, SERVICE_MAPPINGS, REVERSE_SERVICE_MAPPINGS, getActualServiceName, getFeatureServiceName, getAllServiceMappings, getAllReverseServiceMappings, } from "./presets";
