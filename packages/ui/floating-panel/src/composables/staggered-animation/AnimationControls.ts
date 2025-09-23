/**
 * 🦊 Animation Controls
 * 
 * Handles animation control functions for staggered animations
 */

import { createFallbackStaggeredAnimation } from "./FallbackStaggeredAnimation.js";

export interface AnimationConfig {
  duration: number;
  baseDelay: number;
  staggerStep: number;
  direction: string;
}

export interface AnimationControls {
  startAnimation: (items: unknown[]) => Promise<void>;
  stopAnimation: () => void;
}

/**
 * Create animation control functions
 */
export function createAnimationControls(
  config: AnimationConfig,
  animationEngine: () => "full" | "fallback" | "disabled",
  // fallbackSystem: () => unknown,
  shouldDisableAnimations: () => boolean,
  setTotalItems: (count: number) => void,
  setIsAnimating: (animating: boolean) => void,
  setCurrentIndex: (index: number) => void
): AnimationControls {
  const startAnimation = async (items: unknown[]) => {
    if (shouldDisableAnimations()) {
      // Immediate completion for disabled animations
      setTotalItems(items.length);
      setIsAnimating(true);
      setCurrentIndex(items.length - 1);
      setIsAnimating(false);
      return;
    }

    setTotalItems(items.length);
    setIsAnimating(true);
    setCurrentIndex(0);

    if (animationEngine() === "fallback") {
      // Use local fallback system
      const fallbackState = createFallbackStaggeredAnimation(items.length, {
        duration: config.duration,
        delay: config.baseDelay,
        stagger: config.staggerStep,
        direction: config.direction === "center-out" ? "center" : config.direction,
      });

      await fallbackState.start();
      setIsAnimating(false);
    } else if (animationEngine() === "full") {
      // Use full animation system (existing logic)
      setTimeout(() => {
        setIsAnimating(false);
        setCurrentIndex(items.length - 1);
      }, config.duration + (items.length * config.staggerStep));
    }
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    setCurrentIndex(0);
  };

  return { startAnimation, stopAnimation };
}
