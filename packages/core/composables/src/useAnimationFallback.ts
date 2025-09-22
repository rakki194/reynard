/**
 * 🦊 Animation Fallback System
 * 
 * Provides fallback animation functionality when the animation package is not available.
 * Uses CSS transitions and immediate completion for disabled animations.
 * 
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { createSignal, createMemo } from "solid-js";
import { useAnimationControl } from "./useAnimationControl";

export interface FallbackAnimationOptions {
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Easing function for the animation */
  easing?: string;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Whether to use CSS transitions (true) or immediate completion (false) */
  useTransitions?: boolean;
}

export interface FallbackStaggeredAnimationOptions extends FallbackAnimationOptions {
  /** Delay between each item in milliseconds */
  stagger?: number;
  /** Direction of the stagger effect */
  direction?: "forward" | "reverse" | "center" | "random";
}

export interface FallbackAnimationItem {
  /** Index of the item */
  index: number;
  /** Delay before this item starts animating */
  delay: number;
  /** Whether this item is currently animating */
  isAnimating: boolean;
  /** Progress of the animation (0-1) */
  progress: number;
}

/**
 * Animation fallback system
 * 
 * Provides fallback animation functionality when the animation package is not available.
 * Automatically detects if animations should be disabled and provides appropriate fallbacks.
 * 
 * @returns Fallback animation functions and state
 */
export function useAnimationFallback() {
  const { isAnimationsDisabled, isAnimationPackageAvailable } = useAnimationControl();

  /**
   * Create a fallback animation using CSS transitions
   * 
   * @param element - The element to animate
   * @param properties - CSS properties to animate
   * @param options - Animation options
   * @returns Promise that resolves when animation completes
   */
  const createFallbackAnimation = (
    element: HTMLElement,
    properties: Record<string, string>,
    options: FallbackAnimationOptions = {}
  ): Promise<void> => {
    const {
      duration = 300,
      easing = "ease",
      delay = 0,
      useTransitions = true,
    } = options;

    return new Promise((resolve) => {
      // If animations are disabled, apply properties immediately
      if (isAnimationsDisabled()) {
        Object.assign(element.style, properties);
        resolve();
        return;
      }

      // If not using transitions, apply properties immediately
      if (!useTransitions) {
        Object.assign(element.style, properties);
        resolve();
        return;
      }

      // Set up CSS transition
      const transitionProperty = Object.keys(properties).join(", ");
      element.style.transition = `${transitionProperty} ${duration}ms ${easing}`;
      
      // Apply delay if specified
      if (delay > 0) {
        element.style.transitionDelay = `${delay}ms`;
      }

      // Apply the properties
      Object.assign(element.style, properties);

      // Listen for transition end
      const handleTransitionEnd = (event: TransitionEvent) => {
        // Only resolve if this is the transition we're waiting for
        if (event.target === element && event.propertyName === Object.keys(properties)[0]) {
          element.removeEventListener("transitionend", handleTransitionEnd);
          resolve();
        }
      };

      element.addEventListener("transitionend", handleTransitionEnd);

      // Fallback timeout in case transition doesn't fire
      setTimeout(() => {
        element.removeEventListener("transitionend", handleTransitionEnd);
        resolve();
      }, duration + delay + 100);
    });
  };

  /**
   * Create a fallback staggered animation
   * 
   * @param elements - Array of elements to animate
   * @param properties - CSS properties to animate
   * @param options - Animation options
   * @returns Promise that resolves when all animations complete
   */
  const createFallbackStaggeredAnimation = async (
    elements: HTMLElement[],
    properties: Record<string, string>,
    options: FallbackStaggeredAnimationOptions = {}
  ): Promise<void> => {
    const {
      duration = 300,
      easing = "ease",
      delay = 0,
      stagger = 100,
      direction = "forward",
      useTransitions = true,
    } = options;

    // If animations are disabled, apply properties immediately to all elements
    if (isAnimationsDisabled()) {
      elements.forEach(element => {
        Object.assign(element.style, properties);
      });
      return;
    }

    // Calculate delays for each element based on direction
    const delays = elements.map((_, index) => {
      switch (direction) {
        case "forward":
          return delay + index * stagger;
        case "reverse":
          return delay + (elements.length - 1 - index) * stagger;
        case "center":
          const centerIndex = Math.floor(elements.length / 2);
          const distanceFromCenter = Math.abs(index - centerIndex);
          return delay + distanceFromCenter * stagger;
        case "random":
          return delay + Math.random() * stagger * elements.length;
        default:
          return delay + index * stagger;
      }
    });

    // Start animations for each element
    const animationPromises = elements.map((element, index) => {
      return createFallbackAnimation(element, properties, {
        duration,
        easing,
        delay: delays[index],
        useTransitions,
      });
    });

    // Wait for all animations to complete
    await Promise.all(animationPromises);
  };

  /**
   * Create a fallback staggered animation with state management
   * 
   * @param itemCount - Number of items to animate
   * @param options - Animation options
   * @returns Staggered animation state and controls
   */
  const createFallbackStaggeredAnimationState = (
    itemCount: number,
    options: FallbackStaggeredAnimationOptions = {}
  ) => {
    const [items, setItems] = createSignal<FallbackAnimationItem[]>([]);
    const [isAnimating, setIsAnimating] = createSignal(false);

    const {
      duration = 300,
      delay = 0,
      stagger = 100,
      direction = "forward",
    } = options;

    const start = async (): Promise<void> => {
      if (isAnimating()) {
        console.warn("🦊 FallbackStaggeredAnimation: Already animating, ignoring start request");
        return;
      }

      setIsAnimating(true);

      // Create items with calculated delays
      const newItems: FallbackAnimationItem[] = Array.from({ length: itemCount }, (_, index) => {
        let itemDelay = delay;
        
        switch (direction) {
          case "forward":
            itemDelay += index * stagger;
            break;
          case "reverse":
            itemDelay += (itemCount - 1 - index) * stagger;
            break;
          case "center":
            const centerIndex = Math.floor(itemCount / 2);
            const distanceFromCenter = Math.abs(index - centerIndex);
            itemDelay += distanceFromCenter * stagger;
            break;
          case "random":
            itemDelay += Math.random() * stagger * itemCount;
            break;
        }

        return {
          index,
          delay: itemDelay,
          isAnimating: false,
          progress: 0,
        };
      });

      setItems(newItems);

      // If animations are disabled, complete immediately
      if (isAnimationsDisabled()) {
        setItems(prev => prev.map(item => ({ ...item, isAnimating: false, progress: 1 })));
        setIsAnimating(false);
        return;
      }

      // Start animations for each item
      const animationPromises = newItems.map(item => {
        return new Promise<void>(resolve => {
          setTimeout(() => {
            setItems(prev => prev.map(i => (i.index === item.index ? { ...i, isAnimating: true } : i)));

            // Simulate animation progress
            const startTime = performance.now();
            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);

              setItems(prev => prev.map(i => (i.index === item.index ? { ...i, progress } : i)));

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setItems(prev => prev.map(i => (i.index === item.index ? { ...i, isAnimating: false, progress: 1 } : i)));
                resolve();
              }
            };

            requestAnimationFrame(animate);
          }, item.delay);
        });
      });

      // Wait for all animations to complete
      await Promise.all(animationPromises);
      setIsAnimating(false);
    };

    const stop = () => {
      setIsAnimating(false);
      setItems(prev => prev.map(item => ({ ...item, isAnimating: false })));
    };

    const reset = () => {
      setIsAnimating(false);
      setItems([]);
    };

    return {
      items,
      isAnimating,
      start,
      stop,
      reset,
    };
  };

  /**
   * Create a simple fallback animation loop
   * 
   * @param duration - Duration of the animation in milliseconds
   * @param onUpdate - Callback called on each frame with progress (0-1)
   * @param onComplete - Callback called when animation completes
   * @returns Promise that resolves when animation completes
   */
  const createFallbackAnimationLoop = (
    duration: number,
    onUpdate: (progress: number) => void,
    onComplete?: () => void
  ): Promise<void> => {
    return new Promise((resolve) => {
      // If animations are disabled, complete immediately
      if (isAnimationsDisabled()) {
        onUpdate(1);
        onComplete?.();
        resolve();
        return;
      }

      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        onUpdate(progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onComplete?.();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  };

  return {
    // Animation functions
    createFallbackAnimation,
    createFallbackStaggeredAnimation,
    createFallbackStaggeredAnimationState,
    createFallbackAnimationLoop,
    
    // State
    isAnimationsDisabled,
    isAnimationPackageAvailable,
  };
}

/**
 * Hook for creating fallback animations
 * 
 * @returns Fallback animation functions
 */
export function useFallbackAnimations() {
  return useAnimationFallback();
}
