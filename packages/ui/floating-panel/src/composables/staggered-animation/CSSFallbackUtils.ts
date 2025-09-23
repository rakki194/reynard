/**
 * 🦊 CSS Fallback Animation Utilities
 * 
 * Utilities for applying CSS-based fallback animations to DOM elements.
 * Provides seamless integration with the staggered animation system.
 */

export interface CSSFallbackOptions {
  duration?: number;
  stagger?: number;
  direction?: "forward" | "reverse" | "center" | "random";
  easing?: string;
  delay?: number;
  useTransitions?: boolean;
}

export interface CSSFallbackAnimation {
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

/**
 * Apply CSS fallback animation to elements
 */
export function applyCSSFallbackAnimation(
  elements: HTMLElement[],
  animationType: "entrance" | "exit",
  options: CSSFallbackOptions = {}
): CSSFallbackAnimation {
  const {
    duration = 300,
    stagger = 100,
    direction = "forward",
    easing = "ease",
    delay = 0,
    useTransitions = true,
  } = options;

  // Set CSS custom properties
  const setCSSProperties = () => {
    const root = document.documentElement;
    root.style.setProperty("--fallback-animation-duration", `${duration}ms`);
    root.style.setProperty("--fallback-animation-stagger", `${stagger}ms`);
    root.style.setProperty("--fallback-animation-easing", easing);
    root.style.setProperty("--fallback-animation-delay", `${delay}ms`);
  };

  // Apply animation classes
  const applyAnimationClasses = () => {
    elements.forEach((element, index) => {
      // Remove any existing animation classes
      element.classList.remove(
        "fallback-staggered-entrance",
        "fallback-staggered-exit",
        "animate",
        "fallback-staggered-forward",
        "fallback-staggered-reverse",
        "fallback-staggered-center"
      );

      // Add base animation class
      if (animationType === "entrance") {
        element.classList.add("fallback-staggered-entrance");
      } else {
        element.classList.add("fallback-staggered-exit");
      }

      // Add direction class
      const container = element.closest(".fallback-staggered-container");
      if (container) {
        container.classList.add(`fallback-staggered-${direction}`);
      }

      // Add stagger item class
      element.classList.add("fallback-staggered-item");
    });
  };

  // Calculate individual delays
  const calculateDelays = (): number[] => {
    return elements.map((_, index) => {
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
  };

  // Start animation
  const start = async (): Promise<void> => {
    if (!useTransitions) {
      // Immediate completion
      elements.forEach(element => {
        element.classList.add("animate");
      });
      return;
    }

    setCSSProperties();
    applyAnimationClasses();

    const delays = calculateDelays();

    // Start animations with calculated delays
    const animationPromises = elements.map((element, index) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          element.classList.add("animate");
          
          // Listen for transition end
          const handleTransitionEnd = (event: TransitionEvent) => {
            if (event.target === element) {
              element.removeEventListener("transitionend", handleTransitionEnd);
              resolve();
            }
          };

          element.addEventListener("transitionend", handleTransitionEnd);

          // Fallback timeout
          setTimeout(() => {
            element.removeEventListener("transitionend", handleTransitionEnd);
            resolve();
          }, duration + delays[index] + 100);
        }, delays[index]);
      });
    });

    await Promise.all(animationPromises);
  };

  // Stop animation
  const stop = (): void => {
    elements.forEach(element => {
      element.classList.remove("animate");
    });
  };

  // Reset animation
  const reset = (): void => {
    elements.forEach(element => {
      element.classList.remove(
        "fallback-staggered-entrance",
        "fallback-staggered-exit",
        "animate",
        "fallback-staggered-item"
      );
    });
  };

  return { start, stop, reset };
}

/**
 * Apply floating panel specific CSS fallback animation
 */
export function applyFloatingPanelCSSFallback(
  panel: HTMLElement,
  animationType: "entrance" | "exit",
  options: CSSFallbackOptions = {}
): CSSFallbackAnimation {
  const {
    duration = 300,
    easing = "ease",
    useTransitions = true,
  } = options;

  // Set CSS custom properties
  const setCSSProperties = () => {
    const root = document.documentElement;
    root.style.setProperty("--fallback-animation-duration", `${duration}ms`);
    root.style.setProperty("--fallback-animation-easing", easing);
  };

  // Start animation
  const start = async (): Promise<void> => {
    if (!useTransitions) {
      panel.classList.add("animate");
      return;
    }

    setCSSProperties();

    // Remove existing classes
    panel.classList.remove(
      "floating-panel-fallback-entrance",
      "floating-panel-fallback-exit",
      "animate"
    );

    // Add appropriate class
    if (animationType === "entrance") {
      panel.classList.add("floating-panel-fallback-entrance");
    } else {
      panel.classList.add("floating-panel-fallback-exit");
    }

    // Trigger animation
    await new Promise<void>(resolve => {
      setTimeout(() => {
        panel.classList.add("animate");
        
        const handleTransitionEnd = (event: TransitionEvent) => {
          if (event.target === panel) {
            panel.removeEventListener("transitionend", handleTransitionEnd);
            resolve();
          }
        };

        panel.addEventListener("transitionend", handleTransitionEnd);

        // Fallback timeout
        setTimeout(() => {
          panel.removeEventListener("transitionend", handleTransitionEnd);
          resolve();
        }, duration + 100);
      }, 10); // Small delay to ensure classes are applied
    });
  };

  // Stop animation
  const stop = (): void => {
    panel.classList.remove("animate");
  };

  // Reset animation
  const reset = (): void => {
    panel.classList.remove(
      "floating-panel-fallback-entrance",
      "floating-panel-fallback-exit",
      "animate"
    );
  };

  return { start, stop, reset };
}

/**
 * Apply content CSS fallback animation
 */
export function applyContentCSSFallback(
  content: HTMLElement,
  options: CSSFallbackOptions = {}
): CSSFallbackAnimation {
  const {
    duration = 300,
    easing = "ease",
    useTransitions = true,
  } = options;

  // Set CSS custom properties
  const setCSSProperties = () => {
    const root = document.documentElement;
    root.style.setProperty("--fallback-animation-duration", `${duration}ms`);
    root.style.setProperty("--fallback-animation-easing", easing);
  };

  // Start animation
  const start = async (): Promise<void> => {
    if (!useTransitions) {
      content.classList.add("animate");
      return;
    }

    setCSSProperties();

    // Remove existing classes
    content.classList.remove("floating-panel-content-fallback", "animate");

    // Add content animation class
    content.classList.add("floating-panel-content-fallback");

    // Trigger animation
    await new Promise<void>(resolve => {
      setTimeout(() => {
        content.classList.add("animate");
        
        const handleTransitionEnd = (event: TransitionEvent) => {
          if (event.target === content) {
            content.removeEventListener("transitionend", handleTransitionEnd);
            resolve();
          }
        };

        content.addEventListener("transitionend", handleTransitionEnd);

        // Fallback timeout
        setTimeout(() => {
          content.removeEventListener("transitionend", handleTransitionEnd);
          resolve();
        }, duration + 100);
      }, 10);
    });
  };

  // Stop animation
  const stop = (): void => {
    content.classList.remove("animate");
  };

  // Reset animation
  const reset = (): void => {
    content.classList.remove("floating-panel-content-fallback", "animate");
  };

  return { start, stop, reset };
}

/**
 * Check if CSS fallback animations are supported
 */
export function isCSSFallbackSupported(): boolean {
  return typeof document !== "undefined" && 
         typeof window !== "undefined" && 
         "transition" in document.documentElement.style;
}

/**
 * Check if animations should be disabled based on user preferences
 */
export function shouldDisableCSSAnimations(): boolean {
  if (typeof window === "undefined") return true;
  
  // Check for reduced motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return true;
  }

  // Check for performance mode
  if (document.documentElement.classList.contains("performance-mode")) {
    return true;
  }

  // Check for animations disabled globally
  if (document.documentElement.classList.contains("animations-disabled")) {
    return true;
  }

  return false;
}

/**
 * Create performance-optimized CSS fallback
 */
export function createPerformanceOptimizedCSSFallback(
  elements: HTMLElement[],
  animationType: "entrance" | "exit",
  options: CSSFallbackOptions = {}
): CSSFallbackAnimation {
  const performanceOptions: CSSFallbackOptions = {
    duration: Math.min(options.duration || 300, 200),
    stagger: Math.min(options.stagger || 100, 50),
    useTransitions: false, // Disable transitions for maximum performance
    ...options,
  };

  return applyCSSFallbackAnimation(elements, animationType, performanceOptions);
}

/**
 * Create accessibility-compliant CSS fallback
 */
export function createAccessibilityCompliantCSSFallback(
  elements: HTMLElement[],
  animationType: "entrance" | "exit",
  options: CSSFallbackOptions = {}
): CSSFallbackAnimation {
  if (shouldDisableCSSAnimations()) {
    return applyCSSFallbackAnimation(elements, animationType, {
      ...options,
      useTransitions: false,
      duration: 0,
      stagger: 0,
    });
  }

  const accessibilityOptions: CSSFallbackOptions = {
    duration: Math.min(options.duration || 300, 500),
    stagger: Math.min(options.stagger || 100, 200),
    ...options,
  };

  return applyCSSFallbackAnimation(elements, animationType, accessibilityOptions);
}


