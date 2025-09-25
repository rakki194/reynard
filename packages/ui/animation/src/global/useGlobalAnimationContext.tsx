/**
 * 🦊 Global Animation Context
 *
 * SolidJS composable for global animation control and state management.
 * Provides centralized animation configuration and controls.
 */

import { createSignal, createMemo, onCleanup, createContext, useContext } from "solid-js";
import type {
  GlobalAnimationConfig,
  GlobalAnimationState,
  GlobalAnimationControls,
  UseGlobalAnimationContextReturn,
  GlobalAnimationContextOptions,
  SystemPreferences,
  AnimationPackageInfo,
  GlobalAnimationEvents,
  GlobalAnimationTesting,
} from "./GlobalAnimationTypes.js";
import {
  DEFAULT_GLOBAL_ANIMATION_CONFIG,
  detectSystemPreferences,
  createConfigFromPreferences,
  validateConfig,
  mergeConfigs,
  createPersistence,
  shouldDisableAnimations,
  getAnimationEngine,
} from "./GlobalAnimationConfig.js";

// Global animation context
const GlobalAnimationContext = createContext<UseGlobalAnimationContextReturn>();

/**
 * Global animation context provider
 */
export function GlobalAnimationProvider(props: { children: any; options?: GlobalAnimationContextOptions }) {
  const {
    initialConfig = {},
    persistConfig = true,
    storageKey = "reynard-animation-config",
    autoDetectPreferences = true,
    debug = false,
  } = props.options || {};

  // Create persistence utilities
  const persistence = createPersistence(storageKey);

  // System preferences
  const [systemPreferences, setSystemPreferences] = createSignal<SystemPreferences>(
    autoDetectPreferences
      ? detectSystemPreferences()
      : {
          prefersReducedMotion: false,
          prefersHighContrast: false,
          prefersColorScheme: "no-preference",
          prefersContrast: "no-preference",
          forcedColors: "none",
        }
  );

  // Configuration state
  const [config, setConfig] = createSignal<GlobalAnimationConfig>(() => {
    // Try to load from storage first
    if (persistConfig) {
      const stored = persistence.loadFromLocalStorage();
      if (stored) {
        return stored;
      }
    }

    // Create from system preferences
    const baseConfig = mergeConfigs(DEFAULT_GLOBAL_ANIMATION_CONFIG, initialConfig);
    return createConfigFromPreferences(systemPreferences(), baseConfig);
  });

  // Available packages
  const [availablePackages, setAvailablePackages] = createSignal<string[]>([]);

  // Testing mocks
  const [mocks, setMocks] = createSignal<{
    systemPreferences: Partial<SystemPreferences>;
    packageAvailability: Record<string, boolean>;
  }>({
    systemPreferences: {},
    packageAvailability: {},
  });

  // Event handlers
  const [eventHandlers, setEventHandlers] = createSignal<Partial<GlobalAnimationEvents>>({});

  // Computed state
  const state = createMemo((): GlobalAnimationState => {
    const currentConfig = config();
    const currentPreferences = systemPreferences();
    const currentPackages = availablePackages();
    const currentMocks = mocks();

    // Apply mocks to preferences
    const effectivePreferences = {
      ...currentPreferences,
      ...currentMocks.systemPreferences,
    };

    // Check if animations should be disabled
    const isDisabled = shouldDisableAnimations(currentConfig, effectivePreferences);

    // Determine animation engine
    const animationEngine = getAnimationEngine(currentConfig, effectivePreferences, currentPackages.length > 0);

    return {
      config: currentConfig,
      isDisabled,
      performanceMode: currentConfig.performance.enabled,
      accessibilityMode: currentConfig.accessibility.highContrast,
      availablePackages: currentPackages,
      animationEngine,
      systemPreferences: effectivePreferences,
    };
  });

  // Global animation controls
  const controls: GlobalAnimationControls = {
    setEnabled: (enabled: boolean) => {
      const newConfig = { ...config(), enabled };
      setConfig(validateConfig(newConfig));

      if (persistConfig) {
        persistence.saveToLocalStorage(newConfig);
      }

      eventHandlers().onStateChange?.(state());
    },

    togglePerformanceMode: () => {
      const currentConfig = config();
      const newConfig = {
        ...currentConfig,
        performance: {
          ...currentConfig.performance,
          enabled: !currentConfig.performance.enabled,
        },
      };
      setConfig(validateConfig(newConfig));

      if (persistConfig) {
        persistence.saveToLocalStorage(newConfig);
      }

      eventHandlers().onPerformanceModeToggle?.(newConfig.performance.enabled);
      eventHandlers().onStateChange?.(state());
    },

    toggleAccessibilityMode: () => {
      const currentConfig = config();
      const newConfig = {
        ...currentConfig,
        accessibility: {
          ...currentConfig.accessibility,
          highContrast: !currentConfig.accessibility.highContrast,
        },
      };
      setConfig(validateConfig(newConfig));

      if (persistConfig) {
        persistence.saveToLocalStorage(newConfig);
      }

      eventHandlers().onAccessibilityModeToggle?.(newConfig.accessibility.highContrast);
      eventHandlers().onStateChange?.(state());
    },

    updateConfig: (newConfig: Partial<GlobalAnimationConfig>) => {
      const mergedConfig = mergeConfigs(config(), newConfig);
      const validatedConfig = validateConfig(mergedConfig);
      setConfig(validatedConfig);

      if (persistConfig) {
        persistence.saveToLocalStorage(validatedConfig);
      }

      eventHandlers().onConfigUpdate?.(validatedConfig);
      eventHandlers().onStateChange?.(state());
    },

    resetConfig: () => {
      const defaultConfig = createConfigFromPreferences(systemPreferences());
      setConfig(defaultConfig);

      if (persistConfig) {
        persistence.saveToLocalStorage(defaultConfig);
      }

      eventHandlers().onConfigUpdate?.(defaultConfig);
      eventHandlers().onStateChange?.(state());
    },

    saveConfig: () => {
      if (persistConfig) {
        persistence.saveToLocalStorage(config());
      }
    },

    loadConfig: () => {
      if (persistConfig) {
        const stored = persistence.loadFromLocalStorage();
        if (stored) {
          setConfig(stored);
          eventHandlers().onConfigUpdate?.(stored);
          eventHandlers().onStateChange?.(state());
        }
      }
    },

    shouldDisableAnimations: () => {
      return shouldDisableAnimations(config(), systemPreferences());
    },

    getAnimationEngine: () => {
      return getAnimationEngine(config(), systemPreferences(), availablePackages().length > 0);
    },

    checkPackageAvailability: (packageName: string) => {
      const currentMocks = mocks();
      if (packageName in currentMocks.packageAvailability) {
        return currentMocks.packageAvailability[packageName];
      }
      return availablePackages().includes(packageName);
    },
  };

  // Testing utilities
  const testing: GlobalAnimationTesting = {
    mockSystemPreferences: (preferences: Partial<SystemPreferences>) => {
      setMocks(prev => ({
        ...prev,
        systemPreferences: { ...prev.systemPreferences, ...preferences },
      }));
    },

    mockPackageAvailability: (packageName: string, available: boolean) => {
      setMocks(prev => ({
        ...prev,
        packageAvailability: { ...prev.packageAvailability, [packageName]: available },
      }));
    },

    resetMocks: () => {
      setMocks({
        systemPreferences: {},
        packageAvailability: {},
      });
    },

    getMocks: () => mocks(),
  };

  // Set up system preference listeners
  if (autoDetectPreferences && typeof window !== "undefined") {
    const mediaQueries = {
      prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)"),
      prefersHighContrast: window.matchMedia("(prefers-contrast: high)"),
      prefersColorScheme: window.matchMedia("(prefers-color-scheme: dark)"),
      prefersContrast: window.matchMedia("(prefers-contrast: low)"),
      forcedColors: window.matchMedia("(forced-colors: active)"),
    };

    const updatePreferences = () => {
      setSystemPreferences(detectSystemPreferences());
    };

    Object.values(mediaQueries).forEach(mediaQuery => {
      mediaQuery.addEventListener("change", updatePreferences);
    });

    onCleanup(() => {
      Object.values(mediaQueries).forEach(mediaQuery => {
        mediaQuery.removeEventListener("change", updatePreferences);
      });
    });
  }

  // Debug logging
  if (debug) {
    createMemo(() => {
      console.log("🦊 GlobalAnimation: State updated", state());
    });
  }

  const contextValue: UseGlobalAnimationContextReturn = {
    state,
    controls,
    isAvailable: () => true,
  };

  return <GlobalAnimationContext.Provider value={contextValue}>{props.children}</GlobalAnimationContext.Provider>;
}

/**
 * Hook to use global animation context
 */
export function useGlobalAnimationContext(): UseGlobalAnimationContextReturn {
  const context = useContext(GlobalAnimationContext);

  if (!context) {
    throw new Error("useGlobalAnimationContext must be used within a GlobalAnimationProvider");
  }

  return context;
}

/**
 * Hook to use global animation state
 */
export function useGlobalAnimationState() {
  const { state } = useGlobalAnimationContext();
  return state;
}

/**
 * Hook to use global animation controls
 */
export function useGlobalAnimationControls() {
  const { controls } = useGlobalAnimationContext();
  return controls;
}

/**
 * Hook to check if animations should be disabled
 */
export function useShouldDisableAnimations() {
  const { state } = useGlobalAnimationContext();
  return createMemo(() => state().isDisabled);
}

/**
 * Hook to get current animation engine
 */
export function useAnimationEngine() {
  const { state } = useGlobalAnimationContext();
  return createMemo(() => state().animationEngine);
}

/**
 * Hook to check package availability
 */
export function usePackageAvailability(packageName: string) {
  const { controls } = useGlobalAnimationContext();
  return createMemo(() => controls.checkPackageAvailability(packageName));
}
