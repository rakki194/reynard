/**
 * 🦊 Simplified Staggered Animation Composable
 *
 * Uses single requestAnimationFrame loop - no setTimeout anti-patterns
 */

import { log } from "reynard-error-boundaries";
import { createSignal, onCleanup } from "solid-js";
import type { EasingType } from "../types";
import { createStaggeredAnimation } from "../utils/SimplifiedAnimationLoop";

export interface SimplifiedStaggeredAnimationItem {
  index: number;
  progress: number;
  isAnimating: boolean;
}

export interface UseSimplifiedStaggeredAnimationOptions {
  duration?: number;
  stagger?: number;
  easing?: EasingType;
  direction?: "forward" | "reverse" | "center" | "random";
  onStart?: () => void;
  onComplete?: () => void;
  onItemStart?: (index: number) => void;
  onItemComplete?: (index: number) => void;
}

export interface UseSimplifiedStaggeredAnimationReturn {
  items: () => SimplifiedStaggeredAnimationItem[];
  isAnimating: () => boolean;
  start: (itemCount: number) => void;
  stop: () => void;
  reset: () => void;
}

export function useSimplifiedStaggeredAnimation(
  options: UseSimplifiedStaggeredAnimationOptions = {}
): UseSimplifiedStaggeredAnimationReturn {
  const [items, setItems] = createSignal<SimplifiedStaggeredAnimationItem[]>([]);
  const [isAnimating, setIsAnimating] = createSignal(false);

  const config = {
    duration: 500,
    stagger: 100,
    easing: "easeOutCubic" as EasingType,
    direction: "forward" as const,
    ...options,
  };

  let cleanupFunction: (() => void) | null = null;

  const calculateItemDelay = (index: number, totalItems: number): number => {
    switch (config.direction) {
      case "forward":
        return index * config.stagger;
      case "reverse":
        return (totalItems - 1 - index) * config.stagger;
      case "center":
        const centerIndex = Math.floor(totalItems / 2);
        const distanceFromCenter = Math.abs(index - centerIndex);
        return distanceFromCenter * config.stagger;
      case "random":
        return Math.random() * config.stagger * totalItems;
      default:
        return index * config.stagger;
    }
  };

  const start = (itemCount: number): void => {
    if (isAnimating()) {
      log.warn("Already animating, ignoring start request", undefined, { 
        component: "useSimplifiedStaggeredAnimation", 
        function: "start" 
      });
      return;
    }

    setIsAnimating(true);
    config.onStart?.();

    // Initialize items
    const newItems: SimplifiedStaggeredAnimationItem[] = Array.from({ length: itemCount }, (_, index) => ({
      index,
      progress: 0,
      isAnimating: false,
    }));

    setItems(newItems);

    // Create staggered animation using single loop
    cleanupFunction = createStaggeredAnimation(
      itemCount,
      config.duration,
      config.stagger,
      config.easing,
      (index, progress) => {
        setItems(prev => prev.map(item => (item.index === index ? { ...item, progress, isAnimating: true } : item)));
      },
      index => {
        setItems(prev =>
          prev.map(item => (item.index === index ? { ...item, isAnimating: false, progress: 1 } : item))
        );
        config.onItemComplete?.(index);
      },
      () => {
        setIsAnimating(false);
        config.onComplete?.();
      }
    );
  };

  const stop = (): void => {
    if (cleanupFunction) {
      cleanupFunction();
      cleanupFunction = null;
    }
    setIsAnimating(false);
    setItems(prev => prev.map(item => ({ ...item, isAnimating: false })));
  };

  const reset = (): void => {
    stop();
    setItems([]);
  };

  // Cleanup on unmount
  onCleanup(() => {
    stop();
  });

  return {
    items,
    isAnimating,
    start,
    stop,
    reset,
  };
}
