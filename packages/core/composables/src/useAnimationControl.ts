/**
 * 🦊 Global Animation Control System
 * 
 * Provides centralized control over all animations in the Reynard ecosystem.
 * Supports accessibility preferences, performance modes, and optional animation package.
 * 
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { createSignal, createMemo, createEffect, onCleanup } from "solid-js";
import { usePrefersReducedMotion } from "./useMediaQuery";

export interface AnimationControlConfig {
  /** Whether animations are globally enabled */
  enabled: boolean;
  /** Whether to respect user's reduced motion preference */
  respectReducedMotion: boolean;
  /** Whether to fallback to CSS animations when package unavailable */
  fallbackToCSS: boolean;
  /** Whether performance mode is enabled (disables all animations) */
  performanceMode: boolean;
  /** Whether the animation package is available */
  animationPackageAvailable: boolean;
}

export interface AnimationControlState {
  /** Whether animations are currently disabled */
  isAnimationsDisabled: boolean;
  /** Whether the user prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Whether the animation package is available */
  isAnimationPackageAvailable: boolean;
  /** Whether performance mode is active */
  isPerformanceMode: boolean;
  /** Whether accessibility mode is active */
  isAccessibilityMode: boolean;
}

/**
 * Check if animation package is available
 */
function useAnimationPackageDetection() {
  const [isAnimationPackageAvailable, setIsAnimationPackageAvailable] = createSignal(false);

  createEffect(() => {
    let isMounted = true;
    
    const checkAnimationPackage = async () => {
      try {
        await import("reynard-animation");
        if (isMounted) {
          setIsAnimationPackageAvailable(true);
        }
      } catch {
        if (isMounted) {
          setIsAnimationPackageAvailable(false);
        }
      }
    };

    checkAnimationPackage();

    return () => {
      isMounted = false;
    };
  });

  return isAnimationPackageAvailable;
}

/**
 * Create animation control functions
 */
function createAnimationControlFunctions(setConfig: (fn: (prev: AnimationControlConfig) => AnimationControlConfig) => void) {
  return {
    disableAllAnimations: () => setConfig(prev => ({ ...prev, enabled: false })),
    enableAllAnimations: () => setConfig(prev => ({ ...prev, enabled: true })),
    enablePerformanceMode: () => setConfig(prev => ({ ...prev, performanceMode: true })),
    disablePerformanceMode: () => setConfig(prev => ({ ...prev, performanceMode: false })),
    enableAccessibilityMode: () => setConfig(prev => ({ ...prev, respectReducedMotion: true })),
    disableAccessibilityMode: () => setConfig(prev => ({ ...prev, respectReducedMotion: false })),
    toggleAnimations: () => setConfig(prev => ({ ...prev, enabled: !prev.enabled })),
    togglePerformanceMode: () => setConfig(prev => ({ ...prev, performanceMode: !prev.performanceMode })),
    toggleAccessibilityMode: () => setConfig(prev => ({ ...prev, respectReducedMotion: !prev.respectReducedMotion })),
  };
}

/**
 * Create animation state computation
 */
function createAnimationStateComputation(
  config: () => AnimationControlConfig,
  prefersReducedMotion: () => boolean
) {
  return createMemo<AnimationControlState>(() => {
    const currentConfig = config();
    const prefersReduced = prefersReducedMotion();
    
    return {
      isAnimationsDisabled: !currentConfig.enabled || 
                           (currentConfig.respectReducedMotion && prefersReduced) ||
                           currentConfig.performanceMode ||
                           !currentConfig.animationPackageAvailable,
      prefersReducedMotion: prefersReduced,
      isAnimationPackageAvailable: currentConfig.animationPackageAvailable,
      isPerformanceMode: currentConfig.performanceMode,
      isAccessibilityMode: currentConfig.respectReducedMotion && prefersReduced,
    };
  });
}

/**
 * Setup CSS class management
 */
function setupCSSClassManagement(animationState: () => AnimationControlState) {
  createEffect(() => {
    const state = animationState();
    const root = document.documentElement;
    
    root.classList.toggle("animations-disabled", state.isAnimationsDisabled);
    root.classList.toggle("performance-mode", state.isPerformanceMode);
    root.classList.toggle("accessibility-mode", state.isAccessibilityMode);
  });

  onCleanup(() => {
    const root = document.documentElement;
    root.classList.remove("animations-disabled", "performance-mode", "accessibility-mode");
  });
}

/**
 * Global animation control composable
 * 
 * Provides centralized control over all animations with support for:
 * - Accessibility preferences (prefers-reduced-motion)
 * - Performance modes
 * - Optional animation package availability
 * - Global enable/disable functionality
 * 
 * @returns Animation control state and functions
 */
export function useAnimationControl() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimationPackageAvailable = useAnimationPackageDetection();
  
  const [config, setConfig] = createSignal<AnimationControlConfig>({
    enabled: true,
    respectReducedMotion: true,
    fallbackToCSS: true,
    performanceMode: false,
    animationPackageAvailable: false,
  });

  createEffect(() => {
    setConfig(prev => ({ ...prev, animationPackageAvailable: isAnimationPackageAvailable() }));
  });

  const animationState = createAnimationStateComputation(config, prefersReducedMotion);
  const controlFunctions = createAnimationControlFunctions(setConfig);
  
  setupCSSClassManagement(animationState);

  return {
    config,
    animationState,
    isAnimationsDisabled: () => animationState().isAnimationsDisabled,
    prefersReducedMotion,
    isAnimationPackageAvailable,
    isPerformanceMode: () => animationState().isPerformanceMode,
    isAccessibilityMode: () => animationState().isAccessibilityMode,
    ...controlFunctions,
    setConfig,
    updateConfig: (updates: Partial<AnimationControlConfig>) => {
      setConfig(prev => ({ ...prev, ...updates }));
    },
  };
}

/**
 * Hook for checking if animations are disabled
 * 
 * @returns Computed signal indicating if animations are disabled
 */
export function useIsAnimationsDisabled() {
  const { isAnimationsDisabled } = useAnimationControl();
  return isAnimationsDisabled;
}

/**
 * Hook for checking if animation package is available
 * 
 * @returns Computed signal indicating if animation package is available
 */
export function useIsAnimationPackageAvailable() {
  const { isAnimationPackageAvailable } = useAnimationControl();
  return isAnimationPackageAvailable;
}

/**
 * Hook for checking if performance mode is active
 * 
 * @returns Computed signal indicating if performance mode is active
 */
export function useIsPerformanceMode() {
  const { isPerformanceMode } = useAnimationControl();
  return isPerformanceMode;
}

/**
 * Hook for checking if accessibility mode is active
 * 
 * @returns Computed signal indicating if accessibility mode is active
 */
export function useIsAccessibilityMode() {
  const { isAccessibilityMode } = useAnimationControl();
  return isAccessibilityMode;
}
