/**
 * 🦊 Staggered Animation Composable
 *
 * Manages staggered entrance and exit animations for floating panels.
 * Integrates with the unified animation system with smart imports and fallbacks.
 * Based on Yipyap's sophisticated animation timing system.
 */

import { createSignal, onCleanup, createMemo, createEffect } from "solid-js";
import type { UseStaggeredAnimationReturn } from "../types.js";
import { createDefaultAnimationConfig } from "./staggered-animation/AnimationConfig.js";
import { calculateStaggerDelay } from "./staggered-animation/AnimationTiming.js";

// Smart import system for unified animation package
let animationPackage: any = null;
let isPackageAvailable = false;

// Check for package availability (will be set by the smart import system)
const checkPackageAvailability = () => {
  try {
    // Try to access the package (this will work if it's available)
    const packageCheck = require("reynard-animation");
    if (packageCheck && packageCheck.useStaggeredAnimation) {
      animationPackage = packageCheck;
      isPackageAvailable = true;
      return true;
    }
  } catch (error) {
    // Package not available, will use fallback
    console.warn("🦊 Floating Panel: reynard-animation package not available, using fallback animations");
  }
  return false;
};

// Initialize package availability
checkPackageAvailability();

// Fallback animation utilities
const createFallbackStaggeredAnimation = (options: UseStaggeredAnimationOptions = {}) => {
  const config = { ...createDefaultAnimationConfig(), ...options };
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [totalItems, setTotalItems] = createSignal(0);

  const startAnimation = (items: unknown[]) => {
    setTotalItems(items.length);
    setIsAnimating(true);
    setCurrentIndex(0);
    
    // Apply CSS fallback animations
    if (typeof document !== "undefined") {
      items.forEach((item, index) => {
        if (item && typeof item === "object" && "style" in item) {
          const element = item as HTMLElement;
          const delay = calculateStaggerDelay(index, items.length, config);
          
          // Apply CSS fallback animation
          element.style.setProperty("--animation-delay", `${delay}ms`);
          element.style.setProperty("--animation-duration", `${config.duration || 300}ms`);
          element.style.setProperty("--animation-easing", config.easing || "ease-in-out");
          element.classList.add("reynard-staggered-fallback");
        }
      });
    }
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    setCurrentIndex(0);
    
    // Cleanup CSS fallback animations
    if (typeof document !== "undefined") {
      document.querySelectorAll(".reynard-staggered-fallback").forEach(element => {
        element.classList.remove("reynard-staggered-fallback");
        element.style.removeProperty("--animation-delay");
        element.style.removeProperty("--animation-duration");
        element.style.removeProperty("--animation-easing");
      });
    }
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
    isFallback: true,
  };
};

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
  // Use smart import system to determine which animation system to use
  if (isPackageAvailable && animationPackage) {
    // Use the unified animation package
    return animationPackage.useStaggeredAnimation(options);
  } else {
    // Use fallback animation system
    return createFallbackStaggeredAnimation(options);
  }
}

// Export package availability status for debugging
export const getAnimationPackageStatus = () => ({
  isAvailable: isPackageAvailable,
  packageName: isPackageAvailable ? "reynard-animation" : "fallback",
  version: isPackageAvailable ? animationPackage?.version || "unknown" : "fallback",
});

// Export fallback utilities for testing
export const createFallbackStaggeredAnimationForTesting = createFallbackStaggeredAnimation;
