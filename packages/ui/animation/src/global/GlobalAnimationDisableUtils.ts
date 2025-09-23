/**
 * 🦊 Global Animation Disable Utilities
 * 
 * Utility functions for disabling animations globally with CSS injection and testing support.
 * Provides comprehensive animation control and testing capabilities.
 */

import type { GlobalAnimationConfig, SystemPreferences } from "./GlobalAnimationTypes.js";

export interface AnimationDisableOptions {
  /** Whether to use CSS injection for testing */
  useCSSInjection?: boolean;
  /** Whether to respect global animation control */
  respectGlobalControl?: boolean;
  /** Whether to use immediate completion */
  immediateCompletion?: boolean;
  /** Custom CSS selector for targeting */
  customSelector?: string;
  /** Whether to include print styles */
  includePrintStyles?: boolean;
}

export interface CSSInjectionOptions {
  /** CSS content to inject */
  css: string;
  /** Unique identifier for the injected style */
  id: string;
  /** Whether to append to head or replace existing */
  replace?: boolean;
  /** Whether to use !important declarations */
  useImportant?: boolean;
}

/**
 * Global animation disable utilities
 */
export class GlobalAnimationDisableUtils {
  private injectedStyles: Map<string, HTMLStyleElement> = new Map();
  private originalStyles: Map<string, string> = new Map();
  private isDisabled: boolean = false;
  private isPerformanceMode: boolean = false;
  private isAccessibilityMode: boolean = false;

  /**
   * Disable all animations globally
   */
  disableAllAnimations(options: AnimationDisableOptions = {}): void {
    const {
      useCSSInjection = true,
      respectGlobalControl = true,
      immediateCompletion = true,
      customSelector = "*",
      includePrintStyles = true,
    } = options;

    if (respectGlobalControl && this.isDisabled) {
      return; // Already disabled
    }

    this.isDisabled = true;

    if (useCSSInjection) {
      this.injectDisableCSS(customSelector, immediateCompletion, includePrintStyles);
    } else {
      this.applyDisableClasses();
    }

    this.updateDocumentClasses();
  }

  /**
   * Enable all animations globally
   */
  enableAllAnimations(options: AnimationDisableOptions = {}): void {
    const { useCSSInjection = true } = options;

    this.isDisabled = false;

    if (useCSSInjection) {
      this.removeDisableCSS();
    } else {
      this.removeDisableClasses();
    }

    this.updateDocumentClasses();
  }

  /**
   * Toggle performance mode
   */
  togglePerformanceMode(enabled: boolean): void {
    this.isPerformanceMode = enabled;
    this.updateDocumentClasses();
  }

  /**
   * Toggle accessibility mode
   */
  toggleAccessibilityMode(enabled: boolean): void {
    this.isAccessibilityMode = enabled;
    this.updateDocumentClasses();
  }

  /**
   * Apply configuration to global animation state
   */
  applyConfiguration(config: GlobalAnimationConfig, preferences: SystemPreferences): void {
    // Update internal state
    this.isDisabled = !config.enabled;
    this.isPerformanceMode = config.performance.enabled;
    this.isAccessibilityMode = config.accessibility.highContrast;

    // Apply based on configuration
    if (this.isDisabled) {
      this.disableAllAnimations({
        useCSSInjection: true,
        respectGlobalControl: false,
        immediateCompletion: config.fallback.immediateCompletion,
      });
    } else {
      this.enableAllAnimations();
    }

    this.updateDocumentClasses();
  }

  /**
   * Inject CSS to disable animations
   */
  private injectDisableCSS(
    selector: string,
    immediateCompletion: boolean,
    includePrintStyles: boolean
  ): void {
    const css = this.generateDisableCSS(selector, immediateCompletion, includePrintStyles);
    
    this.injectCSS({
      css,
      id: "reynard-animation-disable",
      replace: true,
      useImportant: true,
    });
  }

  /**
   * Remove injected disable CSS
   */
  private removeDisableCSS(): void {
    this.removeInjectedCSS("reynard-animation-disable");
  }

  /**
   * Generate CSS for disabling animations
   */
  private generateDisableCSS(
    selector: string,
    immediateCompletion: boolean,
    includePrintStyles: boolean
  ): string {
    let css = `
      /* Global Animation Disable */
      ${selector},
      ${selector}::before,
      ${selector}::after {
        animation-duration: 0ms !important;
        animation-delay: 0ms !important;
        transition-duration: 0ms !important;
        transition-delay: 0ms !important;
        scroll-behavior: auto !important;
      }
    `;

    if (immediateCompletion) {
      css += `
        ${selector} {
          animation-play-state: paused !important;
          transition-property: none !important;
        }
      `;
    }

    if (includePrintStyles) {
      css += `
        @media print {
          ${selector},
          ${selector}::before,
          ${selector}::after {
            animation-duration: 0ms !important;
            animation-delay: 0ms !important;
            transition-duration: 0ms !important;
            transition-delay: 0ms !important;
            scroll-behavior: auto !important;
          }
        }
      `;
    }

    return css;
  }

  /**
   * Apply disable classes to document
   */
  private applyDisableClasses(): void {
    if (typeof document === "undefined") return;

    document.documentElement.classList.add("animations-disabled");
    document.documentElement.classList.add("no-animations");
    document.documentElement.classList.add("immediate-completion");
  }

  /**
   * Remove disable classes from document
   */
  private removeDisableClasses(): void {
    if (typeof document === "undefined") return;

    document.documentElement.classList.remove(
      "animations-disabled",
      "no-animations",
      "immediate-completion"
    );
  }

  /**
   * Update document classes based on current state
   */
  private updateDocumentClasses(): void {
    if (typeof document === "undefined") return;

    const { classList } = document.documentElement;

    // Update animation state classes
    classList.toggle("animations-disabled", this.isDisabled);
    classList.toggle("performance-mode", this.isPerformanceMode);
    classList.toggle("accessibility-mode", this.isAccessibilityMode);

    // Update CSS custom properties
    document.documentElement.style.setProperty("--animation-enabled", this.isDisabled ? "0" : "1");
    document.documentElement.style.setProperty("--performance-mode", this.isPerformanceMode ? "1" : "0");
    document.documentElement.style.setProperty("--accessibility-mode", this.isAccessibilityMode ? "1" : "0");
  }

  /**
   * Inject CSS into document head
   */
  injectCSS(options: CSSInjectionOptions): void {
    if (typeof document === "undefined") return;

    const { css, id, replace = false, useImportant = false } = options;

    // Remove existing style if replacing
    if (replace) {
      this.removeInjectedCSS(id);
    }

    // Create style element
    const style = document.createElement("style");
    style.id = id;
    style.type = "text/css";
    
    // Process CSS if using important
    const processedCSS = useImportant ? this.addImportantToCSS(css) : css;
    style.textContent = processedCSS;

    // Inject into head
    document.head.appendChild(style);
    this.injectedStyles.set(id, style);
  }

  /**
   * Remove injected CSS
   */
  removeInjectedCSS(id: string): void {
    const style = this.injectedStyles.get(id);
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
      this.injectedStyles.delete(id);
    }
  }

  /**
   * Add !important to CSS declarations
   */
  private addImportantToCSS(css: string): string {
    return css.replace(/;(\s*})/g, " !important;$1");
  }

  /**
   * Get current animation state
   */
  getCurrentState(): {
    isDisabled: boolean;
    isPerformanceMode: boolean;
    isAccessibilityMode: boolean;
    injectedStyles: string[];
  } {
    return {
      isDisabled: this.isDisabled,
      isPerformanceMode: this.isPerformanceMode,
      isAccessibilityMode: this.isAccessibilityMode,
      injectedStyles: Array.from(this.injectedStyles.keys()),
    };
  }

  /**
   * Reset all animation states
   */
  reset(): void {
    this.isDisabled = false;
    this.isPerformanceMode = false;
    this.isAccessibilityMode = false;

    // Remove all injected styles
    this.injectedStyles.forEach((_, id) => {
      this.removeInjectedCSS(id);
    });

    // Remove all classes
    this.removeDisableClasses();
    this.updateDocumentClasses();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.reset();
    this.injectedStyles.clear();
    this.originalStyles.clear();
  }
}

/**
 * Global instance of animation disable utilities
 */
let globalAnimationDisableUtils: GlobalAnimationDisableUtils | null = null;

/**
 * Get or create global animation disable utilities
 */
export function getGlobalAnimationDisableUtils(): GlobalAnimationDisableUtils {
  if (!globalAnimationDisableUtils) {
    globalAnimationDisableUtils = new GlobalAnimationDisableUtils();
  }
  return globalAnimationDisableUtils;
}

/**
 * Reset global animation disable utilities
 */
export function resetGlobalAnimationDisableUtils(): void {
  if (globalAnimationDisableUtils) {
    globalAnimationDisableUtils.destroy();
    globalAnimationDisableUtils = null;
  }
}

/**
 * Utility functions for global animation control
 */
export const GlobalAnimationDisableFunctions = {
  /**
   * Disable all animations globally
   */
  disableAllAnimations: (options?: AnimationDisableOptions) => {
    getGlobalAnimationDisableUtils().disableAllAnimations(options);
  },

  /**
   * Enable all animations globally
   */
  enableAllAnimations: (options?: AnimationDisableOptions) => {
    getGlobalAnimationDisableUtils().enableAllAnimations(options);
  },

  /**
   * Toggle performance mode
   */
  togglePerformanceMode: (enabled: boolean) => {
    getGlobalAnimationDisableUtils().togglePerformanceMode(enabled);
  },

  /**
   * Toggle accessibility mode
   */
  toggleAccessibilityMode: (enabled: boolean) => {
    getGlobalAnimationDisableUtils().toggleAccessibilityMode(enabled);
  },

  /**
   * Apply configuration
   */
  applyConfiguration: (config: GlobalAnimationConfig, preferences: SystemPreferences) => {
    getGlobalAnimationDisableUtils().applyConfiguration(config, preferences);
  },

  /**
   * Get current state
   */
  getCurrentState: () => {
    return getGlobalAnimationDisableUtils().getCurrentState();
  },

  /**
   * Reset all states
   */
  reset: () => {
    getGlobalAnimationDisableUtils().reset();
  },

  /**
   * Inject custom CSS
   */
  injectCSS: (options: CSSInjectionOptions) => {
    getGlobalAnimationDisableUtils().injectCSS(options);
  },

  /**
   * Remove injected CSS
   */
  removeInjectedCSS: (id: string) => {
    getGlobalAnimationDisableUtils().removeInjectedCSS(id);
  },
};

/**
 * Testing utilities for animation disable system
 */
export const AnimationDisableTesting = {
  /**
   * Mock document for testing
   */
  mockDocument: (mockDoc: Partial<Document>) => {
    const originalDocument = global.document;
    // @ts-ignore
    global.document = { ...originalDocument, ...mockDoc };
    return () => {
      global.document = originalDocument;
    };
  },

  /**
   * Mock window for testing
   */
  mockWindow: (mockWin: Partial<Window>) => {
    const originalWindow = global.window;
    // @ts-ignore
    global.window = { ...originalWindow, ...mockWin };
    return () => {
      global.window = originalWindow;
    };
  },

  /**
   * Create test configuration
   */
  createTestConfig: (): GlobalAnimationConfig => ({
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
  }),

  /**
   * Create test preferences
   */
  createTestPreferences: (): SystemPreferences => ({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersColorScheme: "light",
    prefersContrast: "no-preference",
    forcedColors: "none",
  }),
};
