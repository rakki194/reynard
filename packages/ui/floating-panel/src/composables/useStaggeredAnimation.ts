/**
 * 🦊 Staggered Animation Composable
 *
 * Manages staggered entrance and exit animations for floating panels.
 * Integrates with the unified animation system with smart imports and fallbacks.
 * Based on Yipyap's sophisticated animation timing system.
 */

import { onCleanup } from "solid-js";
import type { UseStaggeredAnimationReturn } from "../types.js";
import { createDefaultAnimationConfig } from "./staggered-animation/AnimationConfig.js";
import { calculateStaggerDelay } from "./staggered-animation/AnimationTiming.js";
import { createAnimationSystemInitializer } from "./staggered-animation/AnimationSystemInitializer.js";
import { createAnimationControls } from "./staggered-animation/AnimationControls.js";
import { createAnimationStateManager } from "./staggered-animation/AnimationStateManager.js";

export interface UseStaggeredAnimationOptions {
  baseDelay?: number;
  staggerStep?: number;
  maxDelay?: number;
  direction?: "forward" | "reverse" | "center-out";
  duration?: number;
  easing?: string;
  transform?: {
    entrance: string;
    exit: string;
    scale?: number;
    translateX?: number;
    translateY?: number;
  };
  /** Whether to use fallback animations when package unavailable */
  useFallback?: boolean;
  /** Whether to respect global animation control */
  respectGlobalControl?: boolean;
}


export function useStaggeredAnimation(options: UseStaggeredAnimationOptions = {}): UseStaggeredAnimationReturn {
  const {
    useFallback = true,
    respectGlobalControl = true,
    ...animationOptions
  } = options;
  
  const config = { ...createDefaultAnimationConfig(), ...animationOptions };
  
  // Create animation state management
  const { state, setters } = createAnimationStateManager(respectGlobalControl);

  // Initialize animation system
  const initializeAnimationSystem = createAnimationSystemInitializer(
    respectGlobalControl,
    useFallback,
    setters.setGlobalControl,
    setters.setAnimationEngine,
    setters.setFallbackSystem
  );

  // Initialize on mount
  initializeAnimationSystem();

  // Create animation controls
  const { startAnimation, stopAnimation } = createAnimationControls(
    config,
    state.animationEngine,
    state.fallbackSystem,
    state.shouldDisableAnimations,
    setters.setTotalItems,
    setters.setIsAnimating,
    setters.setCurrentIndex
  );

  const getDelayForIndex = (index: number) => {
    if (state.shouldDisableAnimations()) {
      return 0; // No delay for disabled animations
    }
    return calculateStaggerDelay(index, state.totalItems(), config);
  };

  // Cleanup
  onCleanup(() => {
    stopAnimation();
  });

  return {
    isAnimating: state.isAnimating,
    currentIndex: state.currentIndex,
    totalItems: state.totalItems,
    startAnimation,
    stopAnimation,
    getDelayForIndex,
    config,
    animationEngine: state.animationEngine,
    isAnimationsDisabled: state.shouldDisableAnimations,
  };
}
