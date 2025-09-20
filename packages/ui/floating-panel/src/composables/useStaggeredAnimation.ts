/**
 * Staggered Animation Composable
 *
 * Manages staggered entrance and exit animations for floating panels.
 * Based on Yipyap's sophisticated animation timing system.
 */

import { createSignal, onCleanup } from "solid-js";
import type { UseStaggeredAnimationReturn } from "../types.js";
import { createDefaultAnimationConfig } from "./staggered-animation/AnimationConfig.js";
import { calculateStaggerDelay } from "./staggered-animation/AnimationTiming.js";

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

export function useStaggeredAnimation(options: UseStaggeredAnimationOptions = {}): UseStaggeredAnimationReturn {
  const config = { ...createDefaultAnimationConfig(), ...options };
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [totalItems, setTotalItems] = createSignal(0);

  const startAnimation = (items: unknown[]) => {
    setTotalItems(items.length);
    setIsAnimating(true);
    setCurrentIndex(0);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    setCurrentIndex(0);
  };

  const getDelayForIndex = (index: number) => {
    return calculateStaggerDelay(index, totalItems(), config);
  };

  // Cleanup
  onCleanup(() => {
    stopAnimation();
  });

  return {
    isAnimating,
    currentIndex,
    totalItems,
    startAnimation,
    stopAnimation,
    getDelayForIndex,
    config,
  };
}
