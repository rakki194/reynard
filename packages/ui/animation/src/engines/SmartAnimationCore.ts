/**
 * 🦊 Smart Animation Core
 *
 * Intelligent animation engine that automatically adapts based on:
 * - Animation package availability
 * - Global animation control state
 * - Performance mode settings
 * - Accessibility preferences
 *
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { createSignal, createMemo, createEffect, onCleanup } from "solid-js";
import { SmartImportSystem, getSmartImportSystem } from "../smart-imports/SmartImportSystem";
import { log } from "../utils/Logger";

export interface SmartAnimationConfig {
  /** Whether to use fallback when package unavailable */
  useFallback: boolean;
  /** Whether to respect global animation control */
  respectGlobalControl: boolean;
  /** Whether to enable performance mode */
  performanceMode: boolean;
  /** Whether to respect accessibility preferences */
  respectAccessibility: boolean;
  /** Timeout for import attempts in milliseconds */
  importTimeout: number;
  /** Whether to enable logging */
  enableLogging: boolean;
}

export interface SmartAnimationState {
  /** Whether animations are currently disabled */
  isAnimationsDisabled: boolean;
  /** Whether the animation package is available */
  isAnimationPackageAvailable: boolean;
  /** Whether performance mode is active */
  isPerformanceMode: boolean;
  /** Whether accessibility mode is active */
  isAccessibilityMode: boolean;
  /** Whether fallback mode is active */
  isFallbackMode: boolean;
  /** Current animation engine type */
  engineType: "full" | "fallback" | "no-op";
}

export interface AnimationOptions {
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Easing function for the animation */
  easing?: string;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Whether to use CSS transitions */
  useTransitions?: boolean;
  /** Whether to force animation (ignore disabled state) */
  force?: boolean;
}

export interface AnimationResult {
  /** Whether the animation was successful */
  success: boolean;
  /** Whether fallback was used */
  usedFallback: boolean;
  /** Whether no-op was used */
  usedNoOp: boolean;
  /** Duration of the animation in milliseconds */
  duration: number;
  /** Error message if animation failed */
  error: string | null;
}

/**
 * No-op animation engine for disabled animations
 */
class NoOpAnimationEngine {
  private config: SmartAnimationConfig;

  constructor(config: SmartAnimationConfig) {
    this.config = config;
  }

  /**
   * Create a no-op animation that completes immediately
   */
  async animate(
    element: HTMLElement,
    properties: Record<string, string>,
    options: AnimationOptions = {}
  ): Promise<AnimationResult> {
    const startTime = performance.now();

    if (this.config.enableLogging) {
      log.debug("🦊 NoOpAnimationEngine: Applying properties immediately", properties);
    }

    // Apply properties immediately
    Object.assign(element.style, properties);

    const duration = performance.now() - startTime;

    return {
      success: true,
      usedFallback: false,
      usedNoOp: true,
      duration,
      error: null,
    };
  }

  /**
   * Create a no-op staggered animation
   */
  async animateStaggered(
    elements: HTMLElement[],
    properties: Record<string, string>,
    options: AnimationOptions & { stagger?: number; direction?: string } = {}
  ): Promise<AnimationResult> {
    const startTime = performance.now();

    if (this.config.enableLogging) {
      log.debug("🦊 NoOpAnimationEngine: Applying staggered properties immediately", properties);
    }

    // Apply properties to all elements immediately
    elements.forEach(element => {
      Object.assign(element.style, properties);
    });

    const duration = performance.now() - startTime;

    return {
      success: true,
      usedFallback: false,
      usedNoOp: true,
      duration,
      error: null,
    };
  }

  /**
   * Create a no-op animation loop
   */
  async animateLoop(
    duration: number,
    onUpdate: (progress: number) => void,
    onComplete?: () => void
  ): Promise<AnimationResult> {
    const startTime = performance.now();

    if (this.config.enableLogging) {
      log.debug("🦊 NoOpAnimationEngine: Completing animation loop immediately");
    }

    // Complete immediately
    onUpdate(1);
    onComplete?.();

    const actualDuration = performance.now() - startTime;

    return {
      success: true,
      usedFallback: false,
      usedNoOp: true,
      duration: actualDuration,
      error: null,
    };
  }
}

/**
 * Fallback animation engine using CSS transitions
 */
class FallbackAnimationEngine {
  private config: SmartAnimationConfig;

  constructor(config: SmartAnimationConfig) {
    this.config = config;
  }

  /**
   * Create a fallback animation using CSS transitions
   */
  async animate(
    element: HTMLElement,
    properties: Record<string, string>,
    options: AnimationOptions = {}
  ): Promise<AnimationResult> {
    const startTime = performance.now();
    const { duration = 300, easing = "ease", delay = 0, useTransitions = true } = options;

    if (this.config.enableLogging) {
      log.debug("🦊 FallbackAnimationEngine: Creating CSS transition animation", properties);
    }

    return new Promise(resolve => {
      if (!useTransitions) {
        // Apply properties immediately
        Object.assign(element.style, properties);
        resolve({
          success: true,
          usedFallback: true,
          usedNoOp: false,
          duration: performance.now() - startTime,
          error: null,
        });
        return;
      }

      // Set up CSS transition
      const transitionProperty = Object.keys(properties).join(", ");
      element.style.transition = `${transitionProperty} ${duration}ms ${easing}`;

      if (delay > 0) {
        element.style.transitionDelay = `${delay}ms`;
      }

      // Apply the properties
      Object.assign(element.style, properties);

      // Listen for transition end
      const handleTransitionEnd = (event: TransitionEvent) => {
        if (event.target === element && event.propertyName === Object.keys(properties)[0]) {
          element.removeEventListener("transitionend", handleTransitionEnd);
          resolve({
            success: true,
            usedFallback: true,
            usedNoOp: false,
            duration: performance.now() - startTime,
            error: null,
          });
        }
      };

      element.addEventListener("transitionend", handleTransitionEnd);

      // Fallback timeout
      setTimeout(
        () => {
          element.removeEventListener("transitionend", handleTransitionEnd);
          resolve({
            success: true,
            usedFallback: true,
            usedNoOp: false,
            duration: performance.now() - startTime,
            error: null,
          });
        },
        duration + delay + 100
      );
    });
  }

  /**
   * Create a fallback staggered animation
   */
  async animateStaggered(
    elements: HTMLElement[],
    properties: Record<string, string>,
    options: AnimationOptions & { stagger?: number; direction?: string } = {}
  ): Promise<AnimationResult> {
    const startTime = performance.now();
    const {
      duration = 300,
      easing = "ease",
      delay = 0,
      stagger = 100,
      direction = "forward",
      useTransitions = true,
    } = options;

    if (this.config.enableLogging) {
      log.debug("🦊 FallbackAnimationEngine: Creating staggered CSS transition animation", properties);
    }

    // Calculate delays for each element
    const delays = elements.map((_, index) => {
      switch (direction) {
        case "forward":
          return delay + index * stagger;
        case "reverse":
          return delay + (elements.length - 1 - index) * stagger;
        case "center":
          const centerIndex = Math.floor(elements.length / 2);
          const distanceFromCenter = Math.abs(index - centerIndex);
          return delay + distanceFromCenter * stagger;
        default:
          return delay + index * stagger;
      }
    });

    // Start animations for each element
    const animationPromises = elements.map((element, index) => {
      return this.animate(element, properties, {
        duration,
        easing,
        delay: delays[index],
        useTransitions,
      });
    });

    // Wait for all animations to complete
    await Promise.all(animationPromises);

    return {
      success: true,
      usedFallback: true,
      usedNoOp: false,
      duration: performance.now() - startTime,
      error: null,
    };
  }

  /**
   * Create a fallback animation loop
   */
  async animateLoop(
    duration: number,
    onUpdate: (progress: number) => void,
    onComplete?: () => void
  ): Promise<AnimationResult> {
    const startTime = performance.now();

    if (this.config.enableLogging) {
      log.debug("🦊 FallbackAnimationEngine: Creating CSS-based animation loop");
    }

    return new Promise(resolve => {
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        onUpdate(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onComplete?.();
          resolve({
            success: true,
            usedFallback: true,
            usedNoOp: false,
            duration: performance.now() - startTime,
            error: null,
          });
        }
      };

      requestAnimationFrame(animate);
    });
  }
}

/**
 * Smart Animation Core - Main orchestrator
 */
export class SmartAnimationCore {
  private config: SmartAnimationConfig;
  private smartImportSystem: SmartImportSystem;
  private noOpEngine: NoOpAnimationEngine;
  private fallbackEngine: FallbackAnimationEngine;
  private fullEngine: any = null;
  private animationState = createSignal<SmartAnimationState>({
    isAnimationsDisabled: false,
    isAnimationPackageAvailable: false,
    isPerformanceMode: false,
    isAccessibilityMode: false,
    isFallbackMode: false,
    engineType: "no-op",
  });

  constructor(config: Partial<SmartAnimationConfig> = {}) {
    this.config = {
      useFallback: true,
      respectGlobalControl: true,
      performanceMode: false,
      respectAccessibility: true,
      importTimeout: 5000,
      enableLogging: false,
      ...config,
    };

    this.smartImportSystem = getSmartImportSystem({
      useFallback: this.config.useFallback,
      enableCaching: true,
      importTimeout: this.config.importTimeout,
      enableLogging: this.config.enableLogging,
    });

    this.noOpEngine = new NoOpAnimationEngine(this.config);
    this.fallbackEngine = new FallbackAnimationEngine(this.config);

    this.initialize();
  }

  /**
   * Initialize the smart animation core
   */
  private async initialize(): Promise<void> {
    // Check if animation package is available
    const availability = await this.smartImportSystem.checkPackageAvailability("reynard-animation");

    this.updateAnimationState({
      isAnimationPackageAvailable: availability.isAvailable,
      isFallbackMode: !availability.isAvailable && this.config.useFallback,
      engineType: this.determineEngineType(availability.isAvailable),
    });

    // Try to import the full animation engine if available
    if (availability.isAvailable) {
      try {
        const result = await this.smartImportSystem.smartImport("reynard-animation");
        if (result.success && result.module) {
          this.fullEngine = result.module;
          if (this.config.enableLogging) {
            log.debug("🦊 SmartAnimationCore: Full animation engine loaded");
          }
        }
      } catch (error) {
        if (this.config.enableLogging) {
          log.warn("🦊 SmartAnimationCore: Failed to load full animation engine:", error);
        }
      }
    }

    // Set up global animation control integration
    this.setupGlobalAnimationControl();
  }

  /**
   * Determine the appropriate engine type
   */
  private determineEngineType(isPackageAvailable: boolean): "full" | "fallback" | "no-op" {
    if (this.config.performanceMode) {
      return "no-op";
    }

    if (this.config.respectGlobalControl && this.isGlobalAnimationDisabled()) {
      return "no-op";
    }

    if (this.config.respectAccessibility && this.isAccessibilityModeActive()) {
      return "no-op";
    }

    if (isPackageAvailable && this.fullEngine) {
      return "full";
    }

    if (this.config.useFallback) {
      return "fallback";
    }

    return "no-op";
  }

  /**
   * Check if global animation is disabled
   */
  private isGlobalAnimationDisabled(): boolean {
    // This would integrate with the global animation control system
    // For now, we'll check for CSS classes
    return document.documentElement.classList.contains("animations-disabled");
  }

  /**
   * Check if accessibility mode is active
   */
  private isAccessibilityModeActive(): boolean {
    // Check for prefers-reduced-motion
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Set up global animation control integration
   */
  private setupGlobalAnimationControl(): void {
    // Listen for changes in global animation state
    const observer = new MutationObserver(() => {
      this.updateEngineType();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Listen for media query changes
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", () => {
      this.updateEngineType();
    });

    // Cleanup on destroy
    onCleanup(() => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", () => {});
    });
  }

  /**
   * Update the engine type based on current state
   */
  private updateEngineType(): void {
    const currentState = this.animationState[0]();
    const newEngineType = this.determineEngineType(currentState.isAnimationPackageAvailable);

    if (newEngineType !== currentState.engineType) {
      this.updateAnimationState({ engineType: newEngineType });

      if (this.config.enableLogging) {
        log.debug(`🦊 SmartAnimationCore: Engine type changed to ${newEngineType}`);
      }
    }
  }

  /**
   * Update animation state
   */
  private updateAnimationState(updates: Partial<SmartAnimationState>): void {
    const [state, setState] = this.animationState;
    setState(prev => ({ ...prev, ...updates }));
  }

  /**
   * Get current animation state
   */
  getState(): SmartAnimationState {
    return this.animationState[0]();
  }

  /**
   * Get reactive animation state
   */
  getReactiveState() {
    return this.animationState;
  }

  /**
   * Create an animation
   */
  async animate(
    element: HTMLElement,
    properties: Record<string, string>,
    options: AnimationOptions = {}
  ): Promise<AnimationResult> {
    const state = this.getState();
    const engineType = state.engineType;

    if (this.config.enableLogging) {
      log.debug(`🦊 SmartAnimationCore: Creating animation with ${engineType} engine`, properties);
    }

    switch (engineType) {
      case "full":
        if (this.fullEngine && this.fullEngine.animate) {
          return this.fullEngine.animate(element, properties, options);
        }
      // Fall through to fallback if full engine not available
      case "fallback":
        return this.fallbackEngine.animate(element, properties, options);
      case "no-op":
      default:
        return this.noOpEngine.animate(element, properties, options);
    }
  }

  /**
   * Create a staggered animation
   */
  async animateStaggered(
    elements: HTMLElement[],
    properties: Record<string, string>,
    options: AnimationOptions & { stagger?: number; direction?: string } = {}
  ): Promise<AnimationResult> {
    const state = this.getState();
    const engineType = state.engineType;

    if (this.config.enableLogging) {
      log.debug(`🦊 SmartAnimationCore: Creating staggered animation with ${engineType} engine`, properties);
    }

    switch (engineType) {
      case "full":
        if (this.fullEngine && this.fullEngine.animateStaggered) {
          return this.fullEngine.animateStaggered(elements, properties, options);
        }
      // Fall through to fallback if full engine not available
      case "fallback":
        return this.fallbackEngine.animateStaggered(elements, properties, options);
      case "no-op":
      default:
        return this.noOpEngine.animateStaggered(elements, properties, options);
    }
  }

  /**
   * Create an animation loop
   */
  async animateLoop(
    duration: number,
    onUpdate: (progress: number) => void,
    onComplete?: () => void
  ): Promise<AnimationResult> {
    const state = this.getState();
    const engineType = state.engineType;

    if (this.config.enableLogging) {
      log.debug(`🦊 SmartAnimationCore: Creating animation loop with ${engineType} engine`);
    }

    switch (engineType) {
      case "full":
        if (this.fullEngine && this.fullEngine.animateLoop) {
          return this.fullEngine.animateLoop(duration, onUpdate, onComplete);
        }
      // Fall through to fallback if full engine not available
      case "fallback":
        return this.fallbackEngine.animateLoop(duration, onUpdate, onComplete);
      case "no-op":
      default:
        return this.noOpEngine.animateLoop(duration, onUpdate, onComplete);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SmartAnimationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.updateEngineType();

    if (this.config.enableLogging) {
      log.debug("🦊 SmartAnimationCore: Configuration updated", this.config);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.smartImportSystem.cleanup();

    if (this.config.enableLogging) {
      log.debug("🦊 SmartAnimationCore: Cleaned up");
    }
  }
}

// Global smart animation core instance
let globalSmartAnimationCore: SmartAnimationCore | null = null;

/**
 * Get or create the global smart animation core
 */
export function getSmartAnimationCore(config?: Partial<SmartAnimationConfig>): SmartAnimationCore {
  if (!globalSmartAnimationCore) {
    globalSmartAnimationCore = new SmartAnimationCore(config);
  }
  return globalSmartAnimationCore;
}

/**
 * Create a new smart animation core instance
 */
export function createSmartAnimationCore(config?: Partial<SmartAnimationConfig>): SmartAnimationCore {
  return new SmartAnimationCore(config);
}

/**
 * Cleanup the global smart animation core
 */
export function cleanupSmartAnimationCore(): void {
  if (globalSmartAnimationCore) {
    globalSmartAnimationCore.cleanup();
    globalSmartAnimationCore = null;
  }
}
