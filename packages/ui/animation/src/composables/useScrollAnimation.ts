/**
 * 🦊 Scroll Animation Composable
 * 
 * SolidJS composable for scroll-triggered animations
 */

import { createSignal, onCleanup, onMount } from "solid-js";
import { ScrollAnimations, globalScrollAnimations } from "../scroll/ScrollAnimations";
import type { ParallaxOptions, RevealOptions, ProgressAnimationOptions } from "../scroll/ScrollAnimations";
import type { EasingType } from "../types";

export interface UseScrollAnimationOptions {
  type: 'parallax' | 'reveal' | 'progress';
  parallax?: ParallaxOptions;
  reveal?: RevealOptions;
  progress?: ProgressAnimationOptions;
  onEnter?: () => void;
  onExit?: () => void;
  onProgress?: (progress: number) => void;
}

export interface UseScrollAnimationReturn {
  ref: (element: HTMLElement) => void;
  isVisible: () => boolean;
  progress: () => number;
  cleanup: () => void;
}

export function useScrollAnimation(
  options: UseScrollAnimationOptions
): UseScrollAnimationReturn {
  const [isVisible, setIsVisible] = createSignal(false);
  const [progress, setProgress] = createSignal(0);
  
  let elementRef: HTMLElement | null = null;
  let cleanupFunction: (() => void) | null = null;
  let scrollAnimations: ScrollAnimations = globalScrollAnimations;

  const ref = (element: HTMLElement) => {
    elementRef = element;
    
    if (cleanupFunction) {
      cleanupFunction();
    }

    switch (options.type) {
      case 'parallax':
        if (options.parallax) {
          cleanupFunction = scrollAnimations.createParallax(element, {
            ...options.parallax,
            // Add progress callback if provided
            ...(options.onProgress && {
              onProgress: (progress) => {
                setProgress(progress);
                options.onProgress?.(progress);
              },
            }),
          });
        }
        break;
        
      case 'reveal':
        if (options.reveal) {
          cleanupFunction = scrollAnimations.createReveal(element, {
            ...options.reveal,
            onEnter: () => {
              setIsVisible(true);
              options.onEnter?.();
            },
            onExit: () => {
              setIsVisible(false);
              options.onExit?.();
            },
          });
        }
        break;
        
      case 'progress':
        if (options.progress) {
          cleanupFunction = scrollAnimations.createProgressAnimation(element, {
            ...options.progress,
            onProgress: (progress) => {
              setProgress(progress);
              options.onProgress?.(progress);
            },
          });
        }
        break;
    }
  };

  const cleanup = () => {
    if (cleanupFunction) {
      cleanupFunction();
      cleanupFunction = null;
    }
  };

  // Cleanup on unmount
  onCleanup(() => {
    cleanup();
  });

  return {
    ref,
    isVisible,
    progress,
    cleanup,
  };
}

// Convenience composables for specific animation types
export function useParallax(options: ParallaxOptions & { onProgress?: (progress: number) => void }) {
  return useScrollAnimation({
    type: 'parallax',
    parallax: options,
    onProgress: options.onProgress,
  });
}

export function useReveal(options: RevealOptions & { onEnter?: () => void; onExit?: () => void }) {
  return useScrollAnimation({
    type: 'reveal',
    reveal: options,
    onEnter: options.onEnter,
    onExit: options.onExit,
  });
}

export function useProgressAnimation(options: ProgressAnimationOptions & { onProgress?: (progress: number) => void }) {
  return useScrollAnimation({
    type: 'progress',
    progress: options,
    onProgress: options.onProgress,
  });
}
