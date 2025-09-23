/**
 * 🦊 Fallback Staggered Animation System
 * 
 * Provides CSS-based staggered animations when the full animation package is unavailable.
 * Includes immediate completion for disabled animations and accessibility compliance.
 */

import { createSignal, createMemo } from "solid-js";

export interface FallbackStaggeredAnimationOptions {
  duration?: number;
  delay?: number;
  stagger?: number;
  direction?: "forward" | "reverse" | "center" | "random";
  easing?: string;
  useTransitions?: boolean;
}

export interface FallbackAnimationItem {
  index: number;
  delay: number;
  isAnimating: boolean;
  progress: number;
}

export interface FallbackStaggeredAnimationState {
  items: () => FallbackAnimationItem[];
  isAnimating: () => boolean;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

/**
 * Create CSS-based fallback staggered animation
 */
export function createFallbackStaggeredAnimation(
  itemCount: number,
  options: FallbackStaggeredAnimationOptions = {}
): FallbackStaggeredAnimationState {
  const {
    duration = 300,
    delay = 0,
    stagger = 100,
    direction = "forward",
    easing = "ease",
    useTransitions = true,
  } = options;

  const [items, setItems] = createSignal<FallbackAnimationItem[]>([]);
  const [isAnimating, setIsAnimating] = createSignal(false);

  // Calculate delay for each item based on direction
  const calculateItemDelay = (index: number): number => {
    switch (direction) {
      case "forward":
        return delay + index * stagger;
      case "reverse":
        return delay + (itemCount - 1 - index) * stagger;
      case "center":
        const centerIndex = Math.floor(itemCount / 2);
        const distanceFromCenter = Math.abs(index - centerIndex);
        return delay + distanceFromCenter * stagger;
      case "random":
        return delay + Math.random() * stagger * itemCount;
      default:
        return delay + index * stagger;
    }
  };

  const start = async (): Promise<void> => {
    if (isAnimating()) {
      console.warn("🦊 FallbackStaggeredAnimation: Already animating, ignoring start request");
      return;
    }

    setIsAnimating(true);

    // Create items with calculated delays
    const newItems: FallbackAnimationItem[] = Array.from({ length: itemCount }, (_, index) => ({
      index,
      delay: calculateItemDelay(index),
      isAnimating: false,
      progress: 0,
    }));

    setItems(newItems);

    // If not using transitions, complete immediately
    if (!useTransitions) {
      setItems(prev => prev.map(item => ({ ...item, isAnimating: false, progress: 1 })));
      setIsAnimating(false);
      return;
    }

    // Start animations for each item
    const animationPromises = newItems.map(item => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setItems(prev => prev.map(i => (i.index === item.index ? { ...i, isAnimating: true } : i)));

          // Simulate animation progress using requestAnimationFrame
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
}

/**
 * Create CSS-based fallback animation for elements
 */
export function createFallbackElementAnimation(
  elements: HTMLElement[],
  properties: Record<string, string>,
  options: FallbackStaggeredAnimationOptions = {}
): Promise<void> {
  const {
    duration = 300,
    delay = 0,
    stagger = 100,
    direction = "forward",
    easing = "ease",
    useTransitions = true,
  } = options;

  return new Promise((resolve) => {
    // If not using transitions, apply properties immediately
    if (!useTransitions) {
      elements.forEach(element => {
        Object.assign(element.style, properties);
      });
      resolve();
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
      return new Promise<void>(elementResolve => {
        setTimeout(() => {
          // Set up CSS transition
          const transitionProperty = Object.keys(properties).join(", ");
          element.style.transition = `${transitionProperty} ${duration}ms ${easing}`;
          element.style.transitionDelay = `${delays[index]}ms`;

          // Apply the properties
          Object.assign(element.style, properties);

          // Listen for transition end
          const handleTransitionEnd = (event: TransitionEvent) => {
            if (event.target === element && event.propertyName === Object.keys(properties)[0]) {
              element.removeEventListener("transitionend", handleTransitionEnd);
              elementResolve();
            }
          };

          element.addEventListener("transitionend", handleTransitionEnd);

          // Fallback timeout in case transition doesn't fire
          setTimeout(() => {
            element.removeEventListener("transitionend", handleTransitionEnd);
            elementResolve();
          }, duration + delays[index] + 100);
        }, delays[index]);
      });
    });

    // Wait for all animations to complete
    Promise.all(animationPromises).then(() => resolve());
  });
}

/**
 * Create performance-optimized fallback animation
 */
export function createPerformanceOptimizedFallback(
  itemCount: number,
  options: FallbackStaggeredAnimationOptions = {}
): FallbackStaggeredAnimationState {
  // Use minimal options for performance
  const performanceOptions: FallbackStaggeredAnimationOptions = {
    duration: Math.min(options.duration || 300, 200), // Cap duration for performance
    stagger: Math.min(options.stagger || 100, 50), // Reduce stagger for performance
    useTransitions: false, // Disable transitions for maximum performance
    ...options,
  };

  return createFallbackStaggeredAnimation(itemCount, performanceOptions);
}

/**
 * Create accessibility-compliant fallback animation
 */
export function createAccessibilityCompliantFallback(
  itemCount: number,
  options: FallbackStaggeredAnimationOptions = {}
): FallbackStaggeredAnimationState {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
  if (prefersReducedMotion) {
    // Immediate completion for reduced motion
    return createFallbackStaggeredAnimation(itemCount, {
      ...options,
      useTransitions: false,
      duration: 0,
      stagger: 0,
    });
  }

  // Use standard fallback with accessibility considerations
  return createFallbackStaggeredAnimation(itemCount, {
    duration: Math.min(options.duration || 300, 500), // Cap duration for accessibility
    stagger: Math.min(options.stagger || 100, 200), // Reduce stagger for accessibility
    ...options,
  });
}


