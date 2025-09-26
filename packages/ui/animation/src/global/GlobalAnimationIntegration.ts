/**
 * 🦊 Global Animation Integration
 *
 * Integration system for global animation control with automatic CSS class management
 * and performance monitoring. Connects the global context with CSS control.
 */

import { log } from "reynard-error-boundaries";
import { createSignal, createMemo, onCleanup, createEffect } from "solid-js";
import type {
  GlobalAnimationConfig,
  GlobalAnimationState,
  SystemPreferences,
  GlobalAnimationControls,
} from "./GlobalAnimationTypes.js";
import {
  GlobalAnimationDisableUtils,
  getGlobalAnimationDisableUtils,
  GlobalAnimationDisableFunctions,
} from "./GlobalAnimationDisableUtils.js";

export interface AnimationIntegrationOptions {
  /** Whether to automatically manage CSS classes */
  autoManageClasses?: boolean;
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Whether to enable accessibility monitoring */
  enableAccessibilityMonitoring?: boolean;
  /** Whether to persist state changes */
  persistStateChanges?: boolean;
  /** Custom CSS selector for targeting */
  customSelector?: string;
  /** Whether to use CSS injection for testing */
  useCSSInjection?: boolean;
}

export interface PerformanceMetrics {
  /** Number of animations currently running */
  activeAnimations: number;
  /** Average animation duration */
  averageDuration: number;
  /** Total animation time */
  totalAnimationTime: number;
  /** Performance mode enabled */
  performanceMode: boolean;
  /** Last performance check timestamp */
  lastCheck: number;
}

export interface AccessibilityMetrics {
  /** Reduced motion preference detected */
  reducedMotion: boolean;
  /** High contrast preference detected */
  highContrast: boolean;
  /** Forced colors preference detected */
  forcedColors: boolean;
  /** Accessibility mode enabled */
  accessibilityMode: boolean;
  /** Last accessibility check timestamp */
  lastCheck: number;
}

/**
 * Global animation integration system
 */
export class GlobalAnimationIntegration {
  private disableUtils: GlobalAnimationDisableUtils;
  private performanceMetrics: PerformanceMetrics;
  private accessibilityMetrics: AccessibilityMetrics;
  private options: AnimationIntegrationOptions;
  private observers: Set<Function> = new Set();
  private performanceObserver: PerformanceObserver | null = null;
  private mediaQueryObservers: Map<string, MediaQueryList> = new Map();

  constructor(options: AnimationIntegrationOptions = {}) {
    this.options = {
      autoManageClasses: true,
      enablePerformanceMonitoring: true,
      enableAccessibilityMonitoring: true,
      persistStateChanges: true,
      customSelector: "*",
      useCSSInjection: true,
      ...options,
    };

    this.disableUtils = getGlobalAnimationDisableUtils();

    this.performanceMetrics = {
      activeAnimations: 0,
      averageDuration: 0,
      totalAnimationTime: 0,
      performanceMode: false,
      lastCheck: Date.now(),
    };

    this.accessibilityMetrics = {
      reducedMotion: false,
      highContrast: false,
      forcedColors: false,
      accessibilityMode: false,
      lastCheck: Date.now(),
    };

    this.initializeIntegration();
  }

  /**
   * Initialize the integration system
   */
  private initializeIntegration(): void {
    if (this.options.enablePerformanceMonitoring) {
      this.setupPerformanceMonitoring();
    }

    if (this.options.enableAccessibilityMonitoring) {
      this.setupAccessibilityMonitoring();
    }

    if (this.options.autoManageClasses) {
      this.setupAutomaticClassManagement();
    }
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (typeof window === "undefined" || !window.PerformanceObserver) {
      return;
    }

    try {
      this.performanceObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        this.updatePerformanceMetrics(entries);
      });

      this.performanceObserver.observe({ entryTypes: ["measure", "navigation"] });
    } catch (error) {
      log.warn("Performance monitoring not available", error, undefined, {
        component: "GlobalAnimationIntegration",
        function: "initializePerformanceMonitoring",
      });
    }
  }

  /**
   * Setup accessibility monitoring
   */
  private setupAccessibilityMonitoring(): void {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueries = {
      prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)"),
      prefersHighContrast: window.matchMedia("(prefers-contrast: high)"),
      forcedColors: window.matchMedia("(forced-colors: active)"),
    };

    Object.entries(mediaQueries).forEach(([key, mediaQuery]) => {
      this.mediaQueryObservers.set(key, mediaQuery);

      const updateAccessibility = () => {
        this.updateAccessibilityMetrics();
      };

      mediaQuery.addEventListener("change", updateAccessibility);
      updateAccessibility(); // Initial check
    });
  }

  /**
   * Setup automatic class management
   */
  private setupAutomaticClassManagement(): void {
    // This will be called when the global context state changes
    // The actual implementation will be in the SolidJS integration
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(entries: PerformanceEntry[]): void {
    const animationEntries = entries.filter(entry => entry.entryType === "measure" && entry.name.includes("animation"));

    this.performanceMetrics.activeAnimations = animationEntries.length;
    this.performanceMetrics.totalAnimationTime = animationEntries.reduce((total, entry) => total + entry.duration, 0);
    this.performanceMetrics.averageDuration =
      animationEntries.length > 0 ? this.performanceMetrics.totalAnimationTime / animationEntries.length : 0;
    this.performanceMetrics.lastCheck = Date.now();

    this.notifyObservers("performanceUpdate", this.performanceMetrics);
  }

  /**
   * Update accessibility metrics
   */
  private updateAccessibilityMetrics(): void {
    if (typeof window === "undefined") {
      return;
    }

    this.accessibilityMetrics.reducedMotion = this.mediaQueryObservers.get("prefersReducedMotion")?.matches || false;
    this.accessibilityMetrics.highContrast = this.mediaQueryObservers.get("prefersHighContrast")?.matches || false;
    this.accessibilityMetrics.forcedColors = this.mediaQueryObservers.get("forcedColors")?.matches || false;
    this.accessibilityMetrics.lastCheck = Date.now();

    this.notifyObservers("accessibilityUpdate", this.accessibilityMetrics);
  }

  /**
   * Integrate with global animation context
   */
  integrateWithContext(state: () => GlobalAnimationState, controls: GlobalAnimationControls): void {
    // Watch for state changes and apply them
    createEffect(() => {
      const currentState = state();
      this.applyStateChanges(currentState);
    });

    // Override controls to include integration
    this.enhanceControls(controls);
  }

  /**
   * Apply state changes to the integration system
   */
  private applyStateChanges(state: GlobalAnimationState): void {
    const { config, isDisabled, performanceMode, accessibilityMode, systemPreferences } = state;

    // Apply configuration to disable utils
    this.disableUtils.applyConfiguration(config, systemPreferences);

    // Update internal metrics
    this.performanceMetrics.performanceMode = performanceMode;
    this.accessibilityMetrics.accessibilityMode = accessibilityMode;

    // Notify observers
    this.notifyObservers("stateChange", state);
  }

  /**
   * Enhance controls with integration features
   */
  private enhanceControls(controls: GlobalAnimationControls): void {
    const originalSetEnabled = controls.setEnabled;
    const originalTogglePerformanceMode = controls.togglePerformanceMode;
    const originalToggleAccessibilityMode = controls.toggleAccessibilityMode;

    controls.setEnabled = (enabled: boolean) => {
      originalSetEnabled(enabled);
      this.notifyObservers("enabledChange", enabled);
    };

    controls.togglePerformanceMode = () => {
      originalTogglePerformanceMode();
      this.performanceMetrics.performanceMode = !this.performanceMetrics.performanceMode;
      this.notifyObservers("performanceModeToggle", this.performanceMetrics.performanceMode);
    };

    controls.toggleAccessibilityMode = () => {
      originalToggleAccessibilityMode();
      this.accessibilityMetrics.accessibilityMode = !this.accessibilityMetrics.accessibilityMode;
      this.notifyObservers("accessibilityModeToggle", this.accessibilityMetrics.accessibilityMode);
    };
  }

  /**
   * Add observer for state changes
   */
  addObserver(callback: Function): void {
    this.observers.add(callback);
  }

  /**
   * Remove observer
   */
  removeObserver(callback: Function): void {
    this.observers.delete(callback);
  }

  /**
   * Notify all observers
   */
  private notifyObservers(event: string, data: any): void {
    this.observers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        log.warn("Error in observer", error, undefined, {
          component: "GlobalAnimationIntegration",
          function: "observe",
        });
      }
    });
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get current accessibility metrics
   */
  getAccessibilityMetrics(): AccessibilityMetrics {
    return { ...this.accessibilityMetrics };
  }

  /**
   * Get integration state
   */
  getIntegrationState(): {
    performanceMetrics: PerformanceMetrics;
    accessibilityMetrics: AccessibilityMetrics;
    options: AnimationIntegrationOptions;
    isActive: boolean;
  } {
    return {
      performanceMetrics: this.getPerformanceMetrics(),
      accessibilityMetrics: this.getAccessibilityMetrics(),
      options: { ...this.options },
      isActive: this.observers.size > 0,
    };
  }

  /**
   * Update integration options
   */
  updateOptions(newOptions: Partial<AnimationIntegrationOptions>): void {
    this.options = { ...this.options, ...newOptions };

    // Reinitialize if needed
    if (newOptions.enablePerformanceMonitoring !== undefined) {
      if (newOptions.enablePerformanceMonitoring) {
        this.setupPerformanceMonitoring();
      } else {
        this.cleanupPerformanceMonitoring();
      }
    }

    if (newOptions.enableAccessibilityMonitoring !== undefined) {
      if (newOptions.enableAccessibilityMonitoring) {
        this.setupAccessibilityMonitoring();
      } else {
        this.cleanupAccessibilityMonitoring();
      }
    }
  }

  /**
   * Cleanup performance monitoring
   */
  private cleanupPerformanceMonitoring(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }

  /**
   * Cleanup accessibility monitoring
   */
  private cleanupAccessibilityMonitoring(): void {
    this.mediaQueryObservers.forEach(mediaQuery => {
      // Remove event listeners
      mediaQuery.removeEventListener("change", () => {});
    });
    this.mediaQueryObservers.clear();
  }

  /**
   * Cleanup all resources
   */
  destroy(): void {
    this.cleanupPerformanceMonitoring();
    this.cleanupAccessibilityMonitoring();
    this.observers.clear();
    this.disableUtils.destroy();
  }
}

/**
 * Global animation integration utilities
 */
export const GlobalAnimationIntegrationUtils = {
  /**
   * Create integration system
   */
  createIntegration: (options?: AnimationIntegrationOptions) => new GlobalAnimationIntegration(options),

  /**
   * Get current integration state
   */
  getCurrentIntegrationState: () => {
    const disableUtils = getGlobalAnimationDisableUtils();
    return {
      disableState: disableUtils.getCurrentState(),
      integrationActive: true,
    };
  },

  /**
   * Apply global animation settings
   */
  applyGlobalSettings: (config: GlobalAnimationConfig, preferences: SystemPreferences) => {
    GlobalAnimationDisableFunctions.applyConfiguration(config, preferences);
  },

  /**
   * Check if integration is available
   */
  isIntegrationAvailable: (): boolean => {
    return typeof window !== "undefined" && typeof document !== "undefined";
  },

  /**
   * Get browser capabilities
   */
  getBrowserCapabilities: () => {
    if (typeof window === "undefined") {
      return {
        performanceObserver: false,
        matchMedia: false,
        cssCustomProperties: false,
      };
    }

    return {
      performanceObserver: typeof PerformanceObserver !== "undefined",
      matchMedia: typeof window.matchMedia === "function",
      cssCustomProperties: CSS.supports("--custom-property", "value"),
    };
  },
};

/**
 * SolidJS integration hook
 */
export function useGlobalAnimationIntegration(options?: AnimationIntegrationOptions) {
  const [integration] = createSignal(new GlobalAnimationIntegration(options));
  const [performanceMetrics, setPerformanceMetrics] = createSignal<PerformanceMetrics>({
    activeAnimations: 0,
    averageDuration: 0,
    totalAnimationTime: 0,
    performanceMode: false,
    lastCheck: Date.now(),
  });
  const [accessibilityMetrics, setAccessibilityMetrics] = createSignal<AccessibilityMetrics>({
    reducedMotion: false,
    highContrast: false,
    forcedColors: false,
    accessibilityMode: false,
    lastCheck: Date.now(),
  });

  // Update metrics when integration changes
  createEffect(() => {
    const currentIntegration = integration();

    const updateMetrics = () => {
      setPerformanceMetrics(currentIntegration.getPerformanceMetrics());
      setAccessibilityMetrics(currentIntegration.getAccessibilityMetrics());
    };

    currentIntegration.addObserver((event: string, data: any) => {
      if (event === "performanceUpdate") {
        setPerformanceMetrics(data);
      } else if (event === "accessibilityUpdate") {
        setAccessibilityMetrics(data);
      }
    });

    updateMetrics();
  });

  // Cleanup on unmount
  onCleanup(() => {
    integration().destroy();
  });

  return {
    integration: integration(),
    performanceMetrics,
    accessibilityMetrics,
    getIntegrationState: () => integration().getIntegrationState(),
    updateOptions: (newOptions: Partial<AnimationIntegrationOptions>) => integration().updateOptions(newOptions),
  };
}
