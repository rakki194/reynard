// Core feature system
export { FeatureRegistry, FeatureManager } from "./core";
export type {
  FeatureDefinition,
  FeatureStatus,
  FeatureDependency,
  FeatureCapability,
  FeatureGroup,
  FeatureConfig,
  FeatureRegistry as IFeatureRegistry,
  FeatureManager as IFeatureManager,
  FeatureContext,
} from "./core";

// Registry and hooks
export {
  FeatureProvider,
  useFeatures,
  useFeatureAvailable,
  useFeatureDegraded,
  useFeatureStatus,
  useFeatureConfig,
  useFeaturesByCategory,
  useFeaturesByPriority,
  useCriticalFeatures,
  useFeaturesByService,
  useFeatureAware,
  useFeatureConfiguration,
} from "./registry";
export type { FeatureProviderProps } from "./registry";

// Dependency management
export { DependencyResolver } from "./dependencies";
export type { DependencyResolutionResult } from "./dependencies";

// Presets
export {
  COMMON_FEATURES,
  FEATURE_CATEGORIES,
  FEATURE_PRIORITIES,
  SERVICE_MAPPINGS,
  REVERSE_SERVICE_MAPPINGS,
  getActualServiceName,
  getFeatureServiceName,
  getAllServiceMappings,
  getAllReverseServiceMappings,
} from "./presets";
