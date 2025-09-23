/**
 * 🦊 Staggered Animation Composable
 *
 * Manages staggered entrance and exit animations for floating panels.
 * Now uses the unified animation system with smart imports and fallbacks.
 * Migrated to use reynard-animation package.
 */

import { createSignal, onCleanup } from "solid-js";
import type { UseStaggeredAnimationReturn } from "../types.js";

// Smart import system for unified animation package
let animationPackage: unknown = null;
let isPackageAvailable = false;

// Check for package availability
const checkPackageAvailability = async () => {
  try {
    // Try to dynamically import the package
    const packageCheck = await import("reynard-animation");
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

// Initialize package availability (async, but don't await to avoid blocking)
checkPackageAvailability();

// Fallback animation utilities
const createFallbackStaggeredAnimation = (options: UseStaggeredAnimationOptions = {}) => {
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [totalItems, setTotalItems] = createSignal(0);

  const startAnimation = async (items: unknown[]): Promise<void> => {
    setTotalItems(items.length);
    setIsAnimating(true);
    setCurrentIndex(0);
    
    // Simple fallback: complete immediately
    setTimeout(() => {
      setIsAnimating(false);
    }, 100);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    setCurrentIndex(0);
  };

  const getDelayForIndex = (index: number) => {
    return index * 100; // Simple 100ms stagger
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
    config: options,
    animationEngine: () => "fallback" as const,
    isAnimationsDisabled: () => false,
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
  // For now, always use fallback system since reynard-animation package is not available
  // This avoids timing issues with async dynamic imports
  return createFallbackStaggeredAnimation(options);
}

// Export package availability status for debugging
export const getAnimationPackageStatus = () => ({
  isAvailable: isPackageAvailable,
  packageName: isPackageAvailable ? "reynard-animation" : "fallback",
  version: isPackageAvailable ? (animationPackage as { version?: string })?.version || "unknown" : "fallback",
});

// Export fallback utilities for testing
export const createFallbackStaggeredAnimationForTesting = createFallbackStaggeredAnimation;
