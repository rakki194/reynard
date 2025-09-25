/**
 * 🦊 Global Animation Configuration
 *
 * Configuration management for the global animation system.
 * Provides default settings, persistence, and validation.
 */

import { log } from "reynard-error-boundaries";
import type { GlobalAnimationConfig, SystemPreferences, GlobalAnimationPersistence } from "./GlobalAnimationTypes.js";

/**
 * Default global animation configuration
 */
export const DEFAULT_GLOBAL_ANIMATION_CONFIG: GlobalAnimationConfig = {
  enabled: true,
  performance: {
    enabled: false,
    maxFPS: 60,
    reducedQuality: false,
    disableComplex: false,
  },
  accessibility: {
    respectReducedMotion: true,
    respectHighContrast: true,
    respectColorScheme: true,
    highContrast: false,
  },
  fallback: {
    useCSSFallbacks: true,
    immediateCompletion: true,
    reducedMotionFallback: true,
  },
  packages: {
    useSmartImports: true,
    checkAvailability: true,
    gracefulDegradation: true,
  },
};

/**
 * Performance-optimized configuration
 */
export const PERFORMANCE_ANIMATION_CONFIG: GlobalAnimationConfig = {
  ...DEFAULT_GLOBAL_ANIMATION_CONFIG,
  performance: {
    enabled: true,
    maxFPS: 30,
    reducedQuality: true,
    disableComplex: true,
  },
  fallback: {
    useCSSFallbacks: true,
    immediateCompletion: true,
    reducedMotionFallback: true,
  },
};

/**
 * Accessibility-optimized configuration
 */
export const ACCESSIBILITY_ANIMATION_CONFIG: GlobalAnimationConfig = {
  ...DEFAULT_GLOBAL_ANIMATION_CONFIG,
  accessibility: {
    respectReducedMotion: true,
    respectHighContrast: true,
    respectColorScheme: true,
    highContrast: true,
  },
  fallback: {
    useCSSFallbacks: true,
    immediateCompletion: true,
    reducedMotionFallback: true,
  },
};

/**
 * Disabled animations configuration
 */
export const DISABLED_ANIMATION_CONFIG: GlobalAnimationConfig = {
  ...DEFAULT_GLOBAL_ANIMATION_CONFIG,
  enabled: false,
  fallback: {
    useCSSFallbacks: false,
    immediateCompletion: true,
    reducedMotionFallback: true,
  },
};

/**
 * Detect system preferences
 */
export function detectSystemPreferences(): SystemPreferences {
  if (typeof window === "undefined") {
    return {
      prefersReducedMotion: false,
      prefersHighContrast: false,
      prefersColorScheme: "no-preference",
      prefersContrast: "no-preference",
      forcedColors: "none",
    };
  }

  const mediaQueries = {
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)"),
    prefersHighContrast: window.matchMedia("(prefers-contrast: high)"),
    prefersColorScheme: window.matchMedia("(prefers-color-scheme: dark)"),
    prefersContrast: window.matchMedia("(prefers-contrast: low)"),
    forcedColors: window.matchMedia("(forced-colors: active)"),
  };

  return {
    prefersReducedMotion: mediaQueries.prefersReducedMotion.matches,
    prefersHighContrast: mediaQueries.prefersHighContrast.matches,
    prefersColorScheme: mediaQueries.prefersColorScheme.matches ? "dark" : "light",
    prefersContrast: mediaQueries.prefersContrast.matches ? "low" : "no-preference",
    forcedColors: mediaQueries.forcedColors.matches ? "active" : "none",
  };
}

/**
 * Create configuration based on system preferences
 */
export function createConfigFromPreferences(
  preferences: SystemPreferences,
  baseConfig: GlobalAnimationConfig = DEFAULT_GLOBAL_ANIMATION_CONFIG
): GlobalAnimationConfig {
  const config = { ...baseConfig };

  // Adjust for reduced motion preference
  if (preferences.prefersReducedMotion) {
    config.enabled = false;
    config.fallback.immediateCompletion = true;
    config.fallback.reducedMotionFallback = true;
  }

  // Adjust for high contrast preference
  if (preferences.prefersHighContrast) {
    config.accessibility.highContrast = true;
    config.performance.disableComplex = true;
  }

  // Adjust for forced colors
  if (preferences.forcedColors === "active") {
    config.accessibility.highContrast = true;
    config.performance.disableComplex = true;
  }

  return config;
}

/**
 * Validate configuration
 */
export function validateConfig(config: Partial<GlobalAnimationConfig>): GlobalAnimationConfig {
  const validated = { ...DEFAULT_GLOBAL_ANIMATION_CONFIG, ...config };

  // Validate performance settings
  if (validated.performance.maxFPS < 1 || validated.performance.maxFPS > 120) {
    validated.performance.maxFPS = 60;
  }

  // Validate boolean values
  validated.enabled = Boolean(validated.enabled);
  validated.performance.enabled = Boolean(validated.performance.enabled);
  validated.performance.reducedQuality = Boolean(validated.performance.reducedQuality);
  validated.performance.disableComplex = Boolean(validated.performance.disableComplex);
  validated.accessibility.respectReducedMotion = Boolean(validated.accessibility.respectReducedMotion);
  validated.accessibility.respectHighContrast = Boolean(validated.accessibility.respectHighContrast);
  validated.accessibility.respectColorScheme = Boolean(validated.accessibility.respectColorScheme);
  validated.accessibility.highContrast = Boolean(validated.accessibility.highContrast);
  validated.fallback.useCSSFallbacks = Boolean(validated.fallback.useCSSFallbacks);
  validated.fallback.immediateCompletion = Boolean(validated.fallback.immediateCompletion);
  validated.fallback.reducedMotionFallback = Boolean(validated.fallback.reducedMotionFallback);
  validated.packages.useSmartImports = Boolean(validated.packages.useSmartImports);
  validated.packages.checkAvailability = Boolean(validated.packages.checkAvailability);
  validated.packages.gracefulDegradation = Boolean(validated.packages.gracefulDegradation);

  return validated;
}

/**
 * Merge configurations
 */
export function mergeConfigs(
  base: GlobalAnimationConfig,
  override: Partial<GlobalAnimationConfig>
): GlobalAnimationConfig {
  return {
    ...base,
    ...override,
    performance: {
      ...base.performance,
      ...override.performance,
    },
    accessibility: {
      ...base.accessibility,
      ...override.accessibility,
    },
    fallback: {
      ...base.fallback,
      ...override.fallback,
    },
    packages: {
      ...base.packages,
      ...override.packages,
    },
  };
}

/**
 * Create persistence utilities
 */
export function createPersistence(storageKey: string = "reynard-animation-config"): GlobalAnimationPersistence {
  return {
    saveToLocalStorage: (config: GlobalAnimationConfig) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(config));
      } catch (error) {
        log.warn("Failed to save to localStorage", error, undefined, {
          component: "GlobalAnimationConfig",
          function: "saveToLocalStorage",
        });
      }
    },

    loadFromLocalStorage: (): GlobalAnimationConfig | null => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        return validateConfig(parsed);
      } catch (error) {
        log.warn("Failed to load from localStorage", error, undefined, {
          component: "GlobalAnimationConfig",
          function: "loadFromLocalStorage",
        });
        return null;
      }
    },

    saveToSessionStorage: (config: GlobalAnimationConfig) => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(config));
      } catch (error) {
        log.warn("Failed to save to sessionStorage", error, undefined, {
          component: "GlobalAnimationConfig",
          function: "saveToSessionStorage",
        });
      }
    },

    loadFromSessionStorage: (): GlobalAnimationConfig | null => {
      try {
        const stored = sessionStorage.getItem(storageKey);
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        return validateConfig(parsed);
      } catch (error) {
        log.warn("Failed to load from sessionStorage", error, undefined, {
          component: "GlobalAnimationConfig",
          function: "loadFromSessionStorage",
        });
        return null;
      }
    },

    clearStorage: () => {
      try {
        localStorage.removeItem(storageKey);
        sessionStorage.removeItem(storageKey);
      } catch (error) {
        log.warn("Failed to clear storage", error, undefined, {
          component: "GlobalAnimationConfig",
          function: "clearStorage",
        });
      }
    },

    exportConfig: (config: GlobalAnimationConfig): string => {
      return JSON.stringify(config, null, 2);
    },

    importConfig: (configString: string): GlobalAnimationConfig | null => {
      try {
        const parsed = JSON.parse(configString);
        return validateConfig(parsed);
      } catch (error) {
        log.warn("Failed to import config", error, undefined, {
          component: "GlobalAnimationConfig",
          function: "importConfig",
        });
        return null;
      }
    },
  };
}

/**
 * Create configuration presets
 */
export const CONFIG_PRESETS = {
  default: DEFAULT_GLOBAL_ANIMATION_CONFIG,
  performance: PERFORMANCE_ANIMATION_CONFIG,
  accessibility: ACCESSIBILITY_ANIMATION_CONFIG,
  disabled: DISABLED_ANIMATION_CONFIG,
  auto: () => createConfigFromPreferences(detectSystemPreferences()),
} as const;

export type ConfigPreset = keyof typeof CONFIG_PRESETS;

/**
 * Get configuration preset
 */
export function getConfigPreset(preset: ConfigPreset): GlobalAnimationConfig {
  if (preset === "auto") {
    return CONFIG_PRESETS.auto();
  }
  return CONFIG_PRESETS[preset];
}

/**
 * Check if configuration should disable animations
 */
export function shouldDisableAnimations(config: GlobalAnimationConfig, preferences: SystemPreferences): boolean {
  // Check if animations are globally disabled
  if (!config.enabled) {
    return true;
  }

  // Check accessibility preferences
  if (config.accessibility.respectReducedMotion && preferences.prefersReducedMotion) {
    return true;
  }

  // Check performance mode
  if (config.performance.enabled && config.performance.disableComplex) {
    return true;
  }

  return false;
}

/**
 * Get animation engine based on configuration
 */
export function getAnimationEngine(
  config: GlobalAnimationConfig,
  preferences: SystemPreferences,
  packageAvailable: boolean = true
): "full" | "fallback" | "disabled" {
  if (shouldDisableAnimations(config, preferences)) {
    return "disabled";
  }

  if (!packageAvailable && config.fallback.useCSSFallbacks) {
    return "fallback";
  }

  return "full";
}
