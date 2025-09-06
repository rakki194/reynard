import { createContext, useContext, createMemo, JSX } from 'solid-js';
import type { FeatureContext, FeatureConfig } from '../core/types';
import { FeatureManager } from '../core/FeatureManager';

// Create feature context
const FeatureContext = createContext<FeatureContext>();

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
export function FeatureProvider(props: FeatureProviderProps) {
  const manager = new FeatureManager(props.config);

  const context: FeatureContext = {
    manager,
    featureStatuses: manager.getFeatureStatusesSignal(),
    availableFeatures: createMemo(() => manager.getAvailableFeatures()),
    degradedFeatures: createMemo(() => manager.getDegradedFeatures()),
    featureSummary: createMemo(() => manager.getFeatureSummary()),
    isFeatureAvailable: (featureId: string) => manager.isFeatureAvailable(featureId),
    isFeatureDegraded: (featureId: string) => manager.isFeatureDegraded(featureId),
    getFeatureStatus: (featureId: string) => manager.getFeatureStatus(featureId),
    configureFeature: (featureId: string, config: Record<string, any>) => manager.configureFeature(featureId, config),
    getFeatureConfig: (featureId: string) => manager.getFeatureConfig(featureId),
    refreshFeatureStatuses: () => manager.refreshFeatureStatuses()
  };

  return (
    <FeatureContext.Provider value={context}>
      {props.children}
    </FeatureContext.Provider>
  );
}

/**
 * Hook to use the feature context
 */
export function useFeatures(): FeatureContext {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
}

/**
 * Hook to check if a feature is available
 */
export function useFeatureAvailable(featureId: string) {
  const { isFeatureAvailable } = useFeatures();
  return createMemo(() => isFeatureAvailable(featureId));
}

/**
 * Hook to check if a feature is degraded
 */
export function useFeatureDegraded(featureId: string) {
  const { isFeatureDegraded } = useFeatures();
  return createMemo(() => isFeatureDegraded(featureId));
}

/**
 * Hook to get feature status
 */
export function useFeatureStatus(featureId: string) {
  const { getFeatureStatus } = useFeatures();
  return createMemo(() => getFeatureStatus(featureId));
}

/**
 * Hook to get feature configuration
 */
export function useFeatureConfig(featureId: string) {
  const { getFeatureConfig } = useFeatures();
  return createMemo(() => getFeatureConfig(featureId));
}

/**
 * Hook to get available features by category
 */
export function useFeaturesByCategory(category: string) {
  const { manager } = useFeatures();
  return createMemo(() => manager.getFeaturesByCategory(category));
}

/**
 * Hook to get features by priority
 */
export function useFeaturesByPriority(priority: string) {
  const { manager } = useFeatures();
  return createMemo(() => manager.getFeaturesByPriority(priority));
}

/**
 * Hook to get critical features status
 */
export function useCriticalFeatures() {
  const { manager } = useFeatures();
  return createMemo(() => ({
    available: manager.areCriticalFeaturesAvailable(),
    unavailable: manager.getUnavailableCriticalFeatures()
  }));
}

/**
 * Hook to get features dependent on a service
 */
export function useFeaturesByService(serviceName: string) {
  const { manager } = useFeatures();
  return createMemo(() => manager.getFeaturesDependentOnService(serviceName));
}

/**
 * Hook to create a feature-aware component
 */
export function useFeatureAware(featureId: string, fallback?: any) {
  const isAvailable = useFeatureAvailable(featureId);
  const isDegraded = useFeatureDegraded(featureId);
  const status = useFeatureStatus(featureId);

  return {
    isAvailable,
    isDegraded,
    status,
    shouldRender: createMemo(() => isAvailable() || isDegraded()),
    fallback
  };
}

/**
 * Hook to manage feature configuration
 */
export function useFeatureConfiguration(featureId: string) {
  const { configureFeature } = useFeatures();
  const config = useFeatureConfig(featureId);

  const updateConfig = (newConfig: Record<string, any>) => {
    configureFeature(featureId, newConfig);
  };

  const setConfigValue = (key: string, value: any) => {
    const currentConfig = config() || {};
    updateConfig({
      ...currentConfig,
      [key]: value
    });
  };

  return {
    config,
    updateConfig,
    setConfigValue
  };
}
