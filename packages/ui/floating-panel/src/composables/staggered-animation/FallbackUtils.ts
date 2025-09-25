/**
 * 🦊 Staggered Animation Fallback Utilities
 *
 * Helper functions for fallback staggered animations.
 * Provides CSS-based fallback animations when the unified animation package is not available.
 */

import { calculateStaggerDelay } from "./AnimationTiming.js";
import type { UseStaggeredAnimationOptions } from "../useStaggeredAnimation.js";

// Helper functions for fallback animations
export const checkShouldDisableAnimations = (): boolean => {
  return (
    typeof document !== "undefined" &&
    (document.documentElement.classList.contains("animations-disabled") ||
      document.documentElement.classList.contains("reduced-motion") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  );
};

export const applyImmediateCompletion = (items: unknown[]): void => {
  if (typeof document === "undefined") return;

  items.forEach((item, _index) => {
    if (item && typeof item === "object" && "style" in item) {
      const element = item as HTMLElement;
      element.style.setProperty("opacity", "1");
      element.style.setProperty("transform", "translateY(0) scale(1)");
      element.classList.add("reynard-staggered-immediate");
    }
  });
};

export const applyCSSFallbackAnimations = (
  items: unknown[],
  config: ReturnType<typeof import("./AnimationConfig.js").createDefaultAnimationConfig>
): void => {
  if (typeof document === "undefined") return;

  items.forEach((item, index) => {
    if (item && typeof item === "object" && "style" in item) {
      const element = item as HTMLElement;
      const delay = calculateStaggerDelay(index, items.length, config);

      element.style.setProperty("--animation-delay", `${delay}ms`);
      element.style.setProperty("--animation-duration", `${config.duration || 300}ms`);
      element.style.setProperty("--animation-easing", config.easing || "ease-in-out");
      element.classList.add("reynard-staggered-fallback");
    }
  });
};

export const cleanupFallbackAnimations = (): void => {
  if (typeof document === "undefined") return;

  document.querySelectorAll(".reynard-staggered-fallback").forEach(element => {
    const htmlElement = element as HTMLElement;
    htmlElement.classList.remove("reynard-staggered-fallback");
    htmlElement.style.removeProperty("--animation-delay");
    htmlElement.style.removeProperty("--animation-duration");
    htmlElement.style.removeProperty("--animation-easing");
  });

  document.querySelectorAll(".reynard-staggered-immediate").forEach(element => {
    const htmlElement = element as HTMLElement;
    htmlElement.classList.remove("reynard-staggered-immediate");
    htmlElement.style.removeProperty("opacity");
    htmlElement.style.removeProperty("transform");
  });
};

// Inject CSS fallback styles if not already present
export const injectFallbackStyles = (): void => {
  if (typeof document === "undefined") return;

  const existingStyle = document.getElementById("reynard-staggered-fallback-styles");
  if (existingStyle) return;

  const style = document.createElement("style");
  style.id = "reynard-staggered-fallback-styles";
  style.textContent = `
    .reynard-staggered-fallback {
      animation: reynard-staggered-fallback var(--animation-duration, 300ms) var(--animation-easing, ease-in-out) var(--animation-delay, 0ms) both;
    }
    
    @keyframes reynard-staggered-fallback {
      0% {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    /* Respect reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .reynard-staggered-fallback {
        animation: none;
        opacity: 1;
        transform: none;
      }
    }
    
    /* Performance mode optimizations */
    .performance-mode .reynard-staggered-fallback {
      animation-duration: 150ms;
    }
    
    /* Accessibility mode optimizations */
    .accessibility-mode .reynard-staggered-fallback {
      animation-duration: 200ms;
      animation-timing-function: ease;
    }
  `;

  document.head.appendChild(style);
};
