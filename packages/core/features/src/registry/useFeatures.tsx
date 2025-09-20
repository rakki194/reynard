import { createContext, useContext } from "solid-js";
import { createFeatureContext } from "./createFeatureContext";
import {
  useFeatureAvailable as useFeatureAvailableBase,
  useFeatureDegraded as useFeatureDegradedBase,
  useFeatureStatus as useFeatureStatusBase,
  useFeatureConfig as useFeatureConfigBase,
  useFeaturesByCategory as useFeaturesByCategoryBase,
  useFeaturesByPriority as useFeaturesByPriorityBase,
  useCriticalFeatures as useCriticalFeaturesBase,
  useFeaturesByService as useFeaturesByServiceBase,
} from "./useFeatureHooks";
import {
  useFeatureAware as useFeatureAwareBase,
  useFeatureConfiguration as useFeatureConfigurationBase,
} from "./useFeatureAware";
// Create feature context
const FeatureContextProvider = createContext();
/**
 * Feature provider component
 */
export function FeatureProvider(props) {
  // eslint-disable-next-line solid/reactivity
  const context = createFeatureContext(props.config);
  return <FeatureContextProvider.Provider value={context}>{props.children}</FeatureContextProvider.Provider>;
}
/**
 * Hook to use the feature context
 */
export function useFeatures() {
  const context = useContext(FeatureContextProvider);
  if (!context) {
    throw new Error("useFeatures must be used within a FeatureProvider");
  }
  return context;
}
/**
 * Hook to check if a feature is available
 */
export function useFeatureAvailable(featureId) {
  const context = useFeatures();
  return useFeatureAvailableBase(featureId, context);
}
/**
 * Hook to check if a feature is degraded
 */
export function useFeatureDegraded(featureId) {
  const context = useFeatures();
  return useFeatureDegradedBase(featureId, context);
}
/**
 * Hook to get feature status
 */
export function useFeatureStatus(featureId) {
  const context = useFeatures();
  return useFeatureStatusBase(featureId, context);
}
/**
 * Hook to get feature configuration
 */
export function useFeatureConfig(featureId) {
  const context = useFeatures();
  return useFeatureConfigBase(featureId, context);
}
/**
 * Hook to get available features by category
 */
export function useFeaturesByCategory(category) {
  const context = useFeatures();
  return useFeaturesByCategoryBase(category, context);
}
/**
 * Hook to get features by priority
 */
export function useFeaturesByPriority(priority) {
  const context = useFeatures();
  return useFeaturesByPriorityBase(priority, context);
}
/**
 * Hook to get critical features status
 */
export function useCriticalFeatures() {
  const context = useFeatures();
  return useCriticalFeaturesBase(context);
}
/**
 * Hook to get features dependent on a service
 */
export function useFeaturesByService(serviceName) {
  const context = useFeatures();
  return useFeaturesByServiceBase(serviceName, context);
}
/**
 * Hook to create a feature-aware component
 */
export function useFeatureAware(featureId, fallback) {
  const context = useFeatures();
  return useFeatureAwareBase(featureId, context, fallback);
}
/**
 * Hook to manage feature configuration
 */
export function useFeatureConfiguration(featureId) {
  const context = useFeatures();
  return useFeatureConfigurationBase(featureId, context);
}
