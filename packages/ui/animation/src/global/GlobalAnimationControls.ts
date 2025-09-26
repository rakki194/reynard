/**
 * 🦊 Global Animation Controls
 *
 * Global animation control system with enable/disable functions and testing utilities.
 * Provides centralized control over all animation systems.
 */

import { log } from "reynard-error-boundaries";
import type {
  GlobalAnimationConfig,
  GlobalAnimationControls,
  GlobalAnimationTesting,
  AnimationPackageInfo,
  SystemPreferences,
} from "./GlobalAnimationTypes.js";
import {
  shouldDisableAnimations,
  getAnimationEngine,
  validateConfig,
  createPersistence,
} from "./GlobalAnimationConfig.js";

/**
 * Global animation control system
 */
export class GlobalAnimationControlSystem {
  private config: GlobalAnimationConfig;
  private systemPreferences: SystemPreferences;
  private availablePackages: Set<string> = new Set();
  private mocks: {
    systemPreferences: Partial<SystemPreferences>;
    packageAvailability: Record<string, boolean>;
  } = {
    systemPreferences: {},
    packageAvailability: {},
  };
  private persistence: ReturnType<typeof createPersistence>;
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor(
    initialConfig: GlobalAnimationConfig,
    systemPreferences: SystemPreferences,
    storageKey: string = "reynard-animation-config"
  ) {
    this.config = initialConfig;
    this.systemPreferences = systemPreferences;
    this.persistence = createPersistence(storageKey);
  }

  /**
   * Get current configuration
   */
  getConfig(): GlobalAnimationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GlobalAnimationConfig>): void {
    this.config = validateConfig({ ...this.config, ...newConfig });
    this.emit("configUpdate", this.config);
    this.emit("stateChange", this.getState());
  }

  /**
   * Get current system preferences
   */
  getSystemPreferences(): SystemPreferences {
    return {
      ...this.systemPreferences,
      ...this.mocks.systemPreferences,
    };
  }

  /**
   * Update system preferences
   */
  updateSystemPreferences(preferences: Partial<SystemPreferences>): void {
    this.systemPreferences = { ...this.systemPreferences, ...preferences };
    this.emit("preferencesChange", this.getSystemPreferences());
    this.emit("stateChange", this.getState());
  }

  /**
   * Get current state
   */
  getState() {
    const effectivePreferences = this.getSystemPreferences();
    const isDisabled = shouldDisableAnimations(this.config, effectivePreferences);
    const animationEngine = getAnimationEngine(this.config, effectivePreferences, this.availablePackages.size > 0);

    return {
      config: this.getConfig(),
      isDisabled,
      performanceMode: this.config.performance.enabled,
      accessibilityMode: this.config.accessibility.highContrast,
      availablePackages: Array.from(this.availablePackages),
      animationEngine,
      systemPreferences: effectivePreferences,
    };
  }

  /**
   * Enable/disable animations globally
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.emit("enabledChange", enabled);
    this.emit("stateChange", this.getState());
    this.saveConfig();
  }

  /**
   * Toggle performance mode
   */
  togglePerformanceMode(): void {
    this.config.performance.enabled = !this.config.performance.enabled;
    this.emit("performanceModeToggle", this.config.performance.enabled);
    this.emit("stateChange", this.getState());
    this.saveConfig();
  }

  /**
   * Toggle accessibility mode
   */
  toggleAccessibilityMode(): void {
    this.config.accessibility.highContrast = !this.config.accessibility.highContrast;
    this.emit("accessibilityModeToggle", this.config.accessibility.highContrast);
    this.emit("stateChange", this.getState());
    this.saveConfig();
  }

  /**
   * Check if animations should be disabled
   */
  shouldDisableAnimations(): boolean {
    return shouldDisableAnimations(this.config, this.getSystemPreferences());
  }

  /**
   * Get current animation engine
   */
  getAnimationEngine(): "full" | "fallback" | "disabled" {
    return getAnimationEngine(this.config, this.getSystemPreferences(), this.availablePackages.size > 0);
  }

  /**
   * Register available package
   */
  registerPackage(packageName: string, info?: Partial<AnimationPackageInfo>): void {
    this.availablePackages.add(packageName);
    this.emit("packageAvailabilityChange", {
      name: packageName,
      available: true,
      optional: info?.optional ?? false,
      fallbackAvailable: info?.fallbackAvailable ?? true,
    });
    this.emit("stateChange", this.getState());
  }

  /**
   * Unregister package
   */
  unregisterPackage(packageName: string): void {
    this.availablePackages.delete(packageName);
    this.emit("packageAvailabilityChange", {
      name: packageName,
      available: false,
      optional: true,
      fallbackAvailable: true,
    });
    this.emit("stateChange", this.getState());
  }

  /**
   * Check package availability
   */
  checkPackageAvailability(packageName: string): boolean {
    if (packageName in this.mocks.packageAvailability) {
      return this.mocks.packageAvailability[packageName];
    }
    return this.availablePackages.has(packageName);
  }

  /**
   * Save configuration to storage
   */
  saveConfig(): void {
    this.persistence.saveToLocalStorage(this.config);
  }

  /**
   * Load configuration from storage
   */
  loadConfig(): void {
    const stored = this.persistence.loadFromLocalStorage();
    if (stored) {
      this.config = stored;
      this.emit("configUpdate", this.config);
      this.emit("stateChange", this.getState());
    }
  }

  /**
   * Reset to default configuration
   */
  resetConfig(): void {
    this.config = validateConfig({});
    this.emit("configUpdate", this.config);
    this.emit("stateChange", this.getState());
    this.saveConfig();
  }

  /**
   * Clear all stored configuration
   */
  clearStorage(): void {
    this.persistence.clearStorage();
  }

  /**
   * Export configuration
   */
  exportConfig(): string {
    return this.persistence.exportConfig(this.config);
  }

  /**
   * Import configuration
   */
  importConfig(configString: string): boolean {
    const imported = this.persistence.importConfig(configString);
    if (imported) {
      this.config = imported;
      this.emit("configUpdate", this.config);
      this.emit("stateChange", this.getState());
      this.saveConfig();
      return true;
    }
    return false;
  }

  /**
   * Add event listener
   */
  addEventListener(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          log.warn(`Error in event listener for ${event}`, error, undefined, {
            component: "GlobalAnimationControls",
            function: "addEventListener",
          });
        }
      });
    }
  }

  /**
   * Get testing utilities
   */
  getTesting(): GlobalAnimationTesting {
    return {
      mockSystemPreferences: (preferences: Partial<SystemPreferences>) => {
        this.mocks.systemPreferences = { ...this.mocks.systemPreferences, ...preferences };
        this.emit("preferencesChange", this.getSystemPreferences());
        this.emit("stateChange", this.getState());
      },

      mockPackageAvailability: (packageName: string, available: boolean) => {
        this.mocks.packageAvailability[packageName] = available;
        this.emit("packageAvailabilityChange", {
          name: packageName,
          available,
          optional: true,
          fallbackAvailable: true,
        });
        this.emit("stateChange", this.getState());
      },

      resetMocks: () => {
        this.mocks = {
          systemPreferences: {},
          packageAvailability: {},
        };
        this.emit("stateChange", this.getState());
      },

      getMocks: () => ({ ...this.mocks }),
    };
  }

  /**
   * Get controls interface
   */
  getControls(): GlobalAnimationControls {
    return {
      setEnabled: (enabled: boolean) => this.setEnabled(enabled),
      togglePerformanceMode: () => this.togglePerformanceMode(),
      toggleAccessibilityMode: () => this.toggleAccessibilityMode(),
      updateConfig: (config: Partial<GlobalAnimationConfig>) => this.updateConfig(config),
      resetConfig: () => this.resetConfig(),
      saveConfig: () => this.saveConfig(),
      loadConfig: () => this.loadConfig(),
      shouldDisableAnimations: () => this.shouldDisableAnimations(),
      getAnimationEngine: () => this.getAnimationEngine(),
      checkPackageAvailability: (packageName: string) => this.checkPackageAvailability(packageName),
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.eventListeners.clear();
    this.availablePackages.clear();
  }
}

/**
 * Global animation control utilities
 */
export const GlobalAnimationUtils = {
  /**
   * Create global animation control system
   */
  createControlSystem: (
    initialConfig: GlobalAnimationConfig,
    systemPreferences: SystemPreferences,
    storageKey?: string
  ) => new GlobalAnimationControlSystem(initialConfig, systemPreferences, storageKey),

  /**
   * Apply global animation settings to document
   */
  applyGlobalSettings: (config: GlobalAnimationConfig, systemPreferences: SystemPreferences) => {
    if (typeof document === "undefined") return;

    const shouldDisable = shouldDisableAnimations(config, systemPreferences);
    const animationEngine = getAnimationEngine(config, systemPreferences, true);

    // Apply CSS classes
    document.documentElement.classList.toggle("animations-disabled", shouldDisable);
    document.documentElement.classList.toggle("performance-mode", config.performance.enabled);
    document.documentElement.classList.toggle("accessibility-mode", config.accessibility.highContrast);
    document.documentElement.classList.toggle("reduced-motion", systemPreferences.prefersReducedMotion);
    document.documentElement.classList.toggle("high-contrast", systemPreferences.prefersHighContrast);

    // Apply CSS custom properties
    document.documentElement.style.setProperty("--animation-enabled", shouldDisable ? "0" : "1");
    document.documentElement.style.setProperty("--performance-mode", config.performance.enabled ? "1" : "0");
    document.documentElement.style.setProperty("--accessibility-mode", config.accessibility.highContrast ? "1" : "0");
    document.documentElement.style.setProperty("--animation-engine", animationEngine);
  },

  /**
   * Remove global animation settings from document
   */
  removeGlobalSettings: () => {
    if (typeof document === "undefined") return;

    document.documentElement.classList.remove(
      "animations-disabled",
      "performance-mode",
      "accessibility-mode",
      "reduced-motion",
      "high-contrast"
    );

    document.documentElement.style.removeProperty("--animation-enabled");
    document.documentElement.style.removeProperty("--performance-mode");
    document.documentElement.style.removeProperty("--accessibility-mode");
    document.documentElement.style.removeProperty("--animation-engine");
  },

  /**
   * Check if global animation system is available
   */
  isGlobalAnimationAvailable: (): boolean => {
    return typeof window !== "undefined" && typeof document !== "undefined";
  },

  /**
   * Get current global animation state from DOM
   */
  getCurrentGlobalState: () => {
    if (typeof document === "undefined") {
      return {
        animationsDisabled: false,
        performanceMode: false,
        accessibilityMode: false,
        reducedMotion: false,
        highContrast: false,
      };
    }

    return {
      animationsDisabled: document.documentElement.classList.contains("animations-disabled"),
      performanceMode: document.documentElement.classList.contains("performance-mode"),
      accessibilityMode: document.documentElement.classList.contains("accessibility-mode"),
      reducedMotion: document.documentElement.classList.contains("reduced-motion"),
      highContrast: document.documentElement.classList.contains("high-contrast"),
    };
  },
};
