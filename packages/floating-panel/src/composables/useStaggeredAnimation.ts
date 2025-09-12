/**
 * Staggered Animation Composable
 *
 * Manages staggered entrance and exit animations for floating panels.
 * Based on Yipyap's sophisticated animation timing system.
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import type {
  AnimationConfig,
  StaggeredAnimation,
  UseStaggeredAnimationReturn,
} from "../types";

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
}

const DEFAULT_ANIMATION_CONFIG: Required<AnimationConfig> = {
  staggerDelay: 0.1,
  entranceDelay: 0.1,
  exitDelay: 0,
  duration: 300,
  easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  transform: {
    entrance: "translateY(0) scale(1)",
    exit: "translateY(20px) scale(0.95)",
    scale: 1,
    translateX: 0,
    translateY: 0,
  },
};

const DEFAULT_STAGGER_CONFIG: Required<StaggeredAnimation> = {
  baseDelay: 0.1,
  staggerStep: 0.1,
  maxDelay: 0.5,
  direction: "forward",
};

export function useStaggeredAnimation(
  options: UseStaggeredAnimationOptions = {},
): UseStaggeredAnimationReturn {
  const config = { ...DEFAULT_ANIMATION_CONFIG, ...options };
  const staggerConfig = { ...DEFAULT_STAGGER_CONFIG, ...options };

  // Animation state
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [animationConfig, setAnimationConfig] =
    createSignal<AnimationConfig>(config);

  // Animation timing
  let animationTimeoutId: number | undefined;
  let staggerTimeoutIds: number[] = [];

  // Cleanup on unmount
  onCleanup(() => {
    if (animationTimeoutId) clearTimeout(animationTimeoutId);
    staggerTimeoutIds.forEach((id) => clearTimeout(id));
  });

  // Calculate stagger delay based on index and direction
  const getStaggerDelay = (index: number): number => {
    const { baseDelay, staggerStep, maxDelay, direction } = staggerConfig;

    let delay: number;

    switch (direction) {
      case "forward":
        delay = baseDelay + index * staggerStep;
        break;
      case "reverse":
        delay =
          baseDelay + (staggerTimeoutIds.length - 1 - index) * staggerStep;
        break;
      case "center-out":
        const center = Math.floor(staggerTimeoutIds.length / 2);
        const distance = Math.abs(index - center);
        delay = baseDelay + distance * staggerStep;
        break;
      default:
        delay = baseDelay + index * staggerStep;
    }

    return Math.min(delay, maxDelay);
  };

  // Calculate entrance delay
  const getEntranceDelay = (index: number): number => {
    return getStaggerDelay(index);
  };

  // Calculate exit delay (usually immediate for exit)
  const getExitDelay = (_index: number): number => {
    return config.exitDelay;
  };

  // Start animation sequence
  const startAnimation = () => {
    setIsAnimating(true);

    // Clear any existing timeouts
    staggerTimeoutIds.forEach((id) => clearTimeout(id));
    staggerTimeoutIds = [];

    // Update animation config
    setAnimationConfig((prev) => ({
      ...prev,
      staggerDelay: staggerConfig.baseDelay,
      entranceDelay: staggerConfig.baseDelay,
      exitDelay: config.exitDelay,
    }));
  };

  // Stop animation sequence
  const stopAnimation = () => {
    setIsAnimating(false);

    // Clear all timeouts
    if (animationTimeoutId) clearTimeout(animationTimeoutId);
    staggerTimeoutIds.forEach((id) => clearTimeout(id));
    staggerTimeoutIds = [];
  };

  // Effect to handle animation state changes
  createEffect(() => {
    const animating = isAnimating();
    if (animating) {
      // Animation started
      startAnimation();
    } else {
      // Animation stopped
      stopAnimation();
    }
  });

  return {
    animationConfig,
    getStaggerDelay,
    getEntranceDelay,
    getExitDelay,
    isAnimating,
    startAnimation,
    stopAnimation,
  };
}

/**
 * Hook for managing staggered animations for a specific panel
 */
export function usePanelAnimation(
  panelIndex: number,
  options: UseStaggeredAnimationOptions = {},
) {
  const animation = useStaggeredAnimation(options);

  return {
    ...animation,
    panelDelay: () => animation.getStaggerDelay(panelIndex),
    panelEntranceDelay: () => animation.getEntranceDelay(panelIndex),
    panelExitDelay: () => animation.getExitDelay(panelIndex),
  };
}

/**
 * Hook for managing staggered animations for multiple panels
 */
export function useMultiPanelAnimation(
  panelCount: number,
  options: UseStaggeredAnimationOptions = {},
) {
  const animation = useStaggeredAnimation(options);

  const getPanelDelays = () => {
    return Array.from({ length: panelCount }, (_, i) => ({
      index: i,
      staggerDelay: animation.getStaggerDelay(i),
      entranceDelay: animation.getEntranceDelay(i),
      exitDelay: animation.getExitDelay(i),
    }));
  };

  return {
    ...animation,
    panelCount: () => panelCount,
    getPanelDelays,
    getPanelDelay: (index: number) => animation.getStaggerDelay(index),
    getPanelEntranceDelay: (index: number) => animation.getEntranceDelay(index),
    getPanelExitDelay: (index: number) => animation.getExitDelay(index),
  };
}
