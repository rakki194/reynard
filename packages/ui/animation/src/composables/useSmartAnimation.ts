/**
 * 🦊 Smart Animation Composable
 *
 * SolidJS composable for smart animations with automatic engine selection.
 * Provides reactive state management for animation engine types and states.
 *
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { log } from "reynard-error-boundaries";

import { createSignal, createMemo, createEffect, onCleanup } from "solid-js";
import {
  SmartAnimationCore,
  SmartAnimationConfig,
  SmartAnimationState,
  AnimationOptions,
  AnimationResult,
} from "../engines/SmartAnimationCore";

export interface UseSmartAnimationOptions {
  /** Smart animation configuration */
  config?: Partial<SmartAnimationConfig>;
  /** Whether to auto-initialize on mount */
  autoInitialize?: boolean;
}

export interface UseSmartAnimationReturn {
  /** Whether the animation core is initialized */
  isInitialized: () => boolean;
  /** Current animation state */
  state: () => SmartAnimationState;
  /** Whether animations are disabled */
  isAnimationsDisabled: () => boolean;
  /** Whether the animation package is available */
  isAnimationPackageAvailable: () => boolean;
  /** Whether performance mode is active */
  isPerformanceMode: () => boolean;
  /** Whether accessibility mode is active */
  isAccessibilityMode: () => boolean;
  /** Whether fallback mode is active */
  isFallbackMode: () => boolean;
  /** Current engine type */
  engineType: () => "full" | "fallback" | "no-op";
  /** Create an animation */
  animate: (
    element: HTMLElement,
    properties: Record<string, string>,
    options?: AnimationOptions
  ) => Promise<AnimationResult>;
  /** Create a staggered animation */
  animateStaggered: (
    elements: HTMLElement[],
    properties: Record<string, string>,
    options?: AnimationOptions & { stagger?: number; direction?: string }
  ) => Promise<AnimationResult>;
  /** Create an animation loop */
  animateLoop: (
    duration: number,
    onUpdate: (progress: number) => void,
    onComplete?: () => void
  ) => Promise<AnimationResult>;
  /** Update configuration */
  updateConfig: (newConfig: Partial<SmartAnimationConfig>) => void;
  /** Get the underlying smart animation core */
  getCore: () => SmartAnimationCore;
}

/**
 * Smart animation composable with reactive state management
 */
export function useSmartAnimation(options: UseSmartAnimationOptions = {}): UseSmartAnimationReturn {
  const { config = {}, autoInitialize = true } = options;

  const [isInitialized, setIsInitialized] = createSignal(false);
  const [smartAnimationCore, setSmartAnimationCore] = createSignal<SmartAnimationCore | null>(null);

  // Initialize the smart animation core
  const initialize = async () => {
    if (isInitialized()) {
      return;
    }

    try {
      const core = new SmartAnimationCore(config);
      setSmartAnimationCore(core);
      setIsInitialized(true);

      if (config.enableLogging) {
        log.info("Smart animation core initialized", undefined, {
          component: "useSmartAnimation",
          function: "initializeSmartCore",
        });
      }
    } catch (error) {
      log.error(
        "Failed to initialize smart animation core",
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        {
          component: "useSmartAnimation",
          function: "initializeSmartCore",
        }
      );
    }
  };

  // Auto-initialize on mount
  createEffect(() => {
    if (autoInitialize) {
      initialize();
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    const core = smartAnimationCore();
    if (core) {
      core.cleanup();
    }
  });

  // Reactive state getters
  const state = createMemo(() => {
    const core = smartAnimationCore();
    return core
      ? core.getState()
      : {
          isAnimationsDisabled: false,
          isAnimationPackageAvailable: false,
          isPerformanceMode: false,
          isAccessibilityMode: false,
          isFallbackMode: false,
          engineType: "no-op" as const,
        };
  });

  const isAnimationsDisabled = createMemo(() => state().isAnimationsDisabled);
  const isAnimationPackageAvailable = createMemo(() => state().isAnimationPackageAvailable);
  const isPerformanceMode = createMemo(() => state().isPerformanceMode);
  const isAccessibilityMode = createMemo(() => state().isAccessibilityMode);
  const isFallbackMode = createMemo(() => state().isFallbackMode);
  const engineType = createMemo(() => state().engineType);

  // Animation functions
  const animate = async (
    element: HTMLElement,
    properties: Record<string, string>,
    options: AnimationOptions = {}
  ): Promise<AnimationResult> => {
    const core = smartAnimationCore();
    if (!core) {
      throw new Error("Smart animation core not initialized");
    }
    return core.animate(element, properties, options);
  };

  const animateStaggered = async (
    elements: HTMLElement[],
    properties: Record<string, string>,
    options: AnimationOptions & { stagger?: number; direction?: string } = {}
  ): Promise<AnimationResult> => {
    const core = smartAnimationCore();
    if (!core) {
      throw new Error("Smart animation core not initialized");
    }
    return core.animateStaggered(elements, properties, options);
  };

  const animateLoop = async (
    duration: number,
    onUpdate: (progress: number) => void,
    onComplete?: () => void
  ): Promise<AnimationResult> => {
    const core = smartAnimationCore();
    if (!core) {
      throw new Error("Smart animation core not initialized");
    }
    return core.animateLoop(duration, onUpdate, onComplete);
  };

  const updateConfig = (newConfig: Partial<SmartAnimationConfig>) => {
    const core = smartAnimationCore();
    if (core) {
      core.updateConfig(newConfig);
    }
  };

  const getCore = () => {
    const core = smartAnimationCore();
    if (!core) {
      throw new Error("Smart animation core not initialized");
    }
    return core;
  };

  return {
    isInitialized,
    state,
    isAnimationsDisabled,
    isAnimationPackageAvailable,
    isPerformanceMode,
    isAccessibilityMode,
    isFallbackMode,
    engineType,
    animate,
    animateStaggered,
    animateLoop,
    updateConfig,
    getCore,
  };
}

/**
 * Hook for checking animation engine type
 */
export function useAnimationEngineType() {
  const { engineType, isInitialized } = useSmartAnimation();

  return {
    engineType,
    isInitialized,
    isFullEngine: () => engineType() === "full",
    isFallbackEngine: () => engineType() === "fallback",
    isNoOpEngine: () => engineType() === "no-op",
  };
}

/**
 * Hook for checking animation package availability
 */
export function useAnimationPackageAvailability() {
  const { isAnimationPackageAvailable, isInitialized } = useSmartAnimation();

  return {
    isAvailable: isAnimationPackageAvailable,
    isInitialized,
  };
}

/**
 * Hook for checking animation performance mode
 */
export function useAnimationPerformanceMode() {
  const { isPerformanceMode, isInitialized } = useSmartAnimation();

  return {
    isPerformanceMode,
    isInitialized,
  };
}

/**
 * Hook for checking animation accessibility mode
 */
export function useAnimationAccessibilityMode() {
  const { isAccessibilityMode, isInitialized } = useSmartAnimation();

  return {
    isAccessibilityMode,
    isInitialized,
  };
}
