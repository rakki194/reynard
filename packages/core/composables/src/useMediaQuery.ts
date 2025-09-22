/**
 * 🦊 Media Query Hook
 * 
 * Provides reactive media query functionality for SolidJS.
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

/**
 * Hook for checking if user prefers reduced motion
 * 
 * @returns Signal indicating if user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = createSignal(false);

  createEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    // Set initial value
    updatePreference();

    // Listen for changes
    mediaQuery.addEventListener("change", updatePreference);

    onCleanup(() => {
      mediaQuery.removeEventListener("change", updatePreference);
    });
  });

  return prefersReducedMotion;
}

/**
 * Hook for checking media query matches
 * 
 * @param query - Media query string
 * @returns Signal indicating if media query matches
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = createSignal(false);

  createEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    const updateMatches = () => {
      setMatches(mediaQuery.matches);
    };

    // Set initial value
    updateMatches();

    // Listen for changes
    mediaQuery.addEventListener("change", updateMatches);

    onCleanup(() => {
      mediaQuery.removeEventListener("change", updateMatches);
    });
  });

  return matches;
}
