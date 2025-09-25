/**
 * 🦊 Global Animation Types
 *
 * Type definitions for the global animation control system.
 * Provides comprehensive type safety for global animation management.
 */

export interface GlobalAnimationConfig {
  /** Whether animations are globally enabled */
  enabled: boolean;
  /** Performance mode settings */
  performance: {
    /** Whether performance mode is enabled */
    enabled: boolean;
    /** Maximum FPS for animations */
    maxFPS: number;
    /** Whether to use reduced quality animations */
    reducedQuality: boolean;
    /** Whether to disable complex animations */
    disableComplex: boolean;
  };
  /** Accessibility settings */
  accessibility: {
    /** Whether to respect prefers-reduced-motion */
    respectReducedMotion: boolean;
    /** Whether to respect high contrast mode */
    respectHighContrast: boolean;
    /** Whether to respect color scheme preferences */
    respectColorScheme: boolean;
    /** Whether to use high contrast animations */
    highContrast: boolean;
  };
  /** Fallback configuration */
  fallback: {
    /** Whether to use CSS fallbacks when package unavailable */
    useCSSFallbacks: boolean;
    /** Whether to use immediate completion for disabled animations */
    immediateCompletion: boolean;
    /** Whether to use reduced motion fallbacks */
    reducedMotionFallback: boolean;
  };
  /** Animation package settings */
  packages: {
    /** Whether to use smart imports */
    useSmartImports: boolean;
    /** Whether to check package availability */
    checkAvailability: boolean;
    /** Whether to use graceful degradation */
    gracefulDegradation: boolean;
  };
}

export interface GlobalAnimationState {
  /** Current configuration */
  config: GlobalAnimationConfig;
  /** Whether animations are currently disabled */
  isDisabled: boolean;
  /** Current performance mode */
  performanceMode: boolean;
  /** Current accessibility mode */
  accessibilityMode: boolean;
  /** Available animation packages */
  availablePackages: string[];
  /** Current animation engine */
  animationEngine: "full" | "fallback" | "disabled";
  /** System preferences */
  systemPreferences: {
    prefersReducedMotion: boolean;
    prefersHighContrast: boolean;
    prefersColorScheme: "light" | "dark" | "no-preference";
  };
}

export interface GlobalAnimationControls {
  /** Enable/disable animations globally */
  setEnabled: (enabled: boolean) => void;
  /** Toggle performance mode */
  togglePerformanceMode: () => void;
  /** Toggle accessibility mode */
  toggleAccessibilityMode: () => void;
  /** Update configuration */
  updateConfig: (config: Partial<GlobalAnimationConfig>) => void;
  /** Reset to default configuration */
  resetConfig: () => void;
  /** Save configuration to storage */
  saveConfig: () => void;
  /** Load configuration from storage */
  loadConfig: () => void;
  /** Check if animations should be disabled */
  shouldDisableAnimations: () => boolean;
  /** Get current animation engine */
  getAnimationEngine: () => "full" | "fallback" | "disabled";
  /** Check package availability */
  checkPackageAvailability: (packageName: string) => boolean;
}

export interface UseGlobalAnimationContextReturn {
  /** Current global animation state */
  state: () => GlobalAnimationState;
  /** Global animation controls */
  controls: GlobalAnimationControls;
  /** Whether the context is available */
  isAvailable: () => boolean;
}

export interface GlobalAnimationContextOptions {
  /** Initial configuration */
  initialConfig?: Partial<GlobalAnimationConfig>;
  /** Whether to persist configuration */
  persistConfig?: boolean;
  /** Storage key for configuration */
  storageKey?: string;
  /** Whether to auto-detect system preferences */
  autoDetectPreferences?: boolean;
  /** Whether to enable debug logging */
  debug?: boolean;
}

export interface AnimationPackageInfo {
  /** Package name */
  name: string;
  /** Whether package is available */
  available: boolean;
  /** Package version */
  version?: string;
  /** Whether package is optional */
  optional: boolean;
  /** Fallback available */
  fallbackAvailable: boolean;
}

export interface SystemPreferences {
  /** User prefers reduced motion */
  prefersReducedMotion: boolean;
  /** User prefers high contrast */
  prefersHighContrast: boolean;
  /** User's color scheme preference */
  prefersColorScheme: "light" | "dark" | "no-preference";
  /** User's contrast preference */
  prefersContrast: "no-preference" | "high" | "low";
  /** User's forced colors preference */
  forcedColors: "none" | "active";
}

export interface GlobalAnimationEvents {
  /** Animation state changed */
  onStateChange: (state: GlobalAnimationState) => void;
  /** Configuration updated */
  onConfigUpdate: (config: GlobalAnimationConfig) => void;
  /** Performance mode toggled */
  onPerformanceModeToggle: (enabled: boolean) => void;
  /** Accessibility mode toggled */
  onAccessibilityModeToggle: (enabled: boolean) => void;
  /** Package availability changed */
  onPackageAvailabilityChange: (packageInfo: AnimationPackageInfo) => void;
}

export interface GlobalAnimationTesting {
  /** Mock system preferences for testing */
  mockSystemPreferences: (preferences: Partial<SystemPreferences>) => void;
  /** Mock package availability for testing */
  mockPackageAvailability: (packageName: string, available: boolean) => void;
  /** Reset all mocks */
  resetMocks: () => void;
  /** Get current mocks */
  getMocks: () => {
    systemPreferences: Partial<SystemPreferences>;
    packageAvailability: Record<string, boolean>;
  };
}

export interface GlobalAnimationPersistence {
  /** Save configuration to localStorage */
  saveToLocalStorage: (config: GlobalAnimationConfig) => void;
  /** Load configuration from localStorage */
  loadFromLocalStorage: () => GlobalAnimationConfig | null;
  /** Save configuration to sessionStorage */
  saveToSessionStorage: (config: GlobalAnimationConfig) => void;
  /** Load configuration from sessionStorage */
  loadFromSessionStorage: () => GlobalAnimationConfig | null;
  /** Clear all stored configuration */
  clearStorage: () => void;
  /** Export configuration */
  exportConfig: (config: GlobalAnimationConfig) => string;
  /** Import configuration */
  importConfig: (configString: string) => GlobalAnimationConfig | null;
}
