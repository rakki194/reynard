/**
 * 🦊 Color Fallback Animation Utilities
 * 
 * Utility functions for applying CSS-based fallback color animations.
 * Provides immediate completion for disabled animations and performance optimizations.
 */

import type { OKLCHColor } from "reynard-colors";

export interface ColorFallbackOptions {
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Easing function to use */
  easing?: string;
  /** Whether to use immediate completion for disabled animations */
  immediateCompletion?: boolean;
  /** Whether to respect global animation control */
  respectGlobalControl?: boolean;
}

/**
 * Apply CSS fallback color transition to an element
 */
export function applyColorFallbackTransition(
  element: HTMLElement,
  startColor: OKLCHColor,
  endColor: OKLCHColor,
  options: ColorFallbackOptions = {}
): void {
  const {
    duration = 300,
    easing = "ease",
    immediateCompletion = true,
    respectGlobalControl = true,
  } = options;

  // Check if animations should be disabled
  if (respectGlobalControl && shouldDisableColorAnimations()) {
    if (immediateCompletion) {
      applyImmediateColorChange(element, endColor);
    }
    return;
  }

  // Apply CSS transition
  element.style.setProperty("--color-animation-duration", `${duration}ms`);
  element.style.setProperty("--color-animation-easing", easing);
  element.style.setProperty("--color-start", oklchToCSS(startColor));
  element.style.setProperty("--color-end", oklchToCSS(endColor));

  element.classList.add("color-fallback-transition");
  
  // Trigger the transition
  requestAnimationFrame(() => {
    element.style.backgroundColor = oklchToCSS(endColor);
  });
}

/**
 * Apply CSS fallback hue shift to an element
 */
export function applyHueFallbackShift(
  element: HTMLElement,
  baseColor: OKLCHColor,
  deltaH: number,
  options: ColorFallbackOptions = {}
): void {
  const {
    duration = 300,
    easing = "ease",
    immediateCompletion = true,
    respectGlobalControl = true,
  } = options;

  // Check if animations should be disabled
  if (respectGlobalControl && shouldDisableColorAnimations()) {
    if (immediateCompletion) {
      const shiftedColor = shiftHue(baseColor, deltaH);
      applyImmediateColorChange(element, shiftedColor);
    }
    return;
  }

  // Apply CSS hue shift
  element.style.setProperty("--color-animation-duration", `${duration}ms`);
  element.style.setProperty("--color-animation-easing", easing);
  element.style.setProperty("--hue-shift", `${deltaH}deg`);

  element.classList.add("hue-fallback-shift");
  
  // Trigger the transition
  requestAnimationFrame(() => {
    element.classList.add("animate");
  });
}

/**
 * Apply CSS fallback color ramp to an element
 */
export function applyColorRampFallback(
  element: HTMLElement,
  colors: OKLCHColor[],
  options: ColorFallbackOptions = {}
): void {
  const {
    duration = 300,
    easing = "ease",
    immediateCompletion = true,
    respectGlobalControl = true,
  } = options;

  // Check if animations should be disabled
  if (respectGlobalControl && shouldDisableColorAnimations()) {
    if (immediateCompletion) {
      applyImmediateColorRamp(element, colors);
    }
    return;
  }

  // Apply CSS color ramp
  element.style.setProperty("--color-animation-duration", `${duration}ms`);
  element.style.setProperty("--color-animation-easing", easing);
  
  const gradient = colors.map(color => oklchToCSS(color)).join(", ");
  element.style.setProperty("--color-ramp", gradient);

  element.classList.add("color-ramp-fallback");
  
  // Trigger the transition
  requestAnimationFrame(() => {
    element.style.background = `linear-gradient(to right, ${gradient})`;
  });
}

/**
 * Apply CSS fallback staggered color animation to elements
 */
export function applyStaggeredColorFallback(
  elements: HTMLElement[],
  colors: OKLCHColor[],
  options: ColorFallbackOptions = {}
): void {
  const {
    duration = 300,
    easing = "ease",
    immediateCompletion = true,
    respectGlobalControl = true,
  } = options;

  // Check if animations should be disabled
  if (respectGlobalControl && shouldDisableColorAnimations()) {
    if (immediateCompletion) {
      elements.forEach((element, index) => {
        const color = colors[index] || colors[0];
        applyImmediateColorChange(element, color);
      });
    }
    return;
  }

  // Apply CSS staggered animation
  elements.forEach((element, index) => {
    element.style.setProperty("--color-animation-duration", `${duration}ms`);
    element.style.setProperty("--color-animation-easing", easing);
    element.style.setProperty("--color-animation-delay", `${index * 50}ms`);
    
    element.classList.add("color-staggered-fallback", "color-item");
    
    // Trigger the transition
    requestAnimationFrame(() => {
      const color = colors[index] || colors[0];
      element.style.backgroundColor = oklchToCSS(color);
    });
  });
}

/**
 * Apply immediate color change (no animation)
 */
export function applyImmediateColorChange(element: HTMLElement, color: OKLCHColor): void {
  element.style.backgroundColor = oklchToCSS(color);
  element.style.transition = "none";
  
  // Force reflow
  element.offsetHeight;
  
  // Restore transition
  element.style.transition = "";
}

/**
 * Apply immediate color ramp (no animation)
 */
export function applyImmediateColorRamp(element: HTMLElement, colors: OKLCHColor[]): void {
  const gradient = colors.map(color => oklchToCSS(color)).join(", ");
  element.style.background = `linear-gradient(to right, ${gradient})`;
  element.style.transition = "none";
  
  // Force reflow
  element.offsetHeight;
  
  // Restore transition
  element.style.transition = "";
}

/**
 * Check if color animations should be disabled
 */
function shouldDisableColorAnimations(): boolean {
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
 * Convert OKLCH color to CSS string
 */
function oklchToCSS(color: OKLCHColor): string {
  return `oklch(${color.l} ${color.c} ${color.h})`;
}

/**
 * Shift hue of an OKLCH color
 */
function shiftHue(color: OKLCHColor, deltaH: number): OKLCHColor {
  return {
    ...color,
    h: (color.h + deltaH) % 360,
  };
}

/**
 * Create CSS custom properties for color animation
 */
export function createColorAnimationCSS(
  colors: OKLCHColor[],
  options: ColorFallbackOptions = {}
): string {
  const {
    duration = 300,
    easing = "ease",
  } = options;

  const cssVariables = [
    `--color-animation-duration: ${duration}ms`,
    `--color-animation-easing: ${easing}`,
  ];

  colors.forEach((color, index) => {
    cssVariables.push(`--color-${index}: ${oklchToCSS(color)}`);
  });

  return cssVariables.join("; ");
}

/**
 * Apply CSS custom properties to an element
 */
export function applyColorAnimationCSS(
  element: HTMLElement,
  colors: OKLCHColor[],
  options: ColorFallbackOptions = {}
): void {
  const css = createColorAnimationCSS(colors, options);
  element.style.cssText += css;
}

/**
 * Remove color animation classes from element
 */
export function removeColorAnimationClasses(element: HTMLElement): void {
  const classesToRemove = [
    "color-fallback-transition",
    "hue-fallback-shift",
    "color-ramp-fallback",
    "color-staggered-fallback",
    "color-palette-fallback",
    "color-picker-fallback",
    "color-swatch-fallback",
    "color-gradient-fallback",
    "color-theme-fallback",
    "color-accessibility-fallback",
    "animate",
  ];

  classesToRemove.forEach(className => {
    element.classList.remove(className);
  });
}

/**
 * Clean up color animation styles from element
 */
export function cleanupColorAnimationStyles(element: HTMLElement): void {
  removeColorAnimationClasses(element);
  
  // Remove CSS custom properties
  const propertiesToRemove = [
    "--color-animation-duration",
    "--color-animation-easing",
    "--color-animation-delay",
    "--color-start",
    "--color-end",
    "--hue-shift",
    "--color-ramp",
    "--gradient-start",
    "--gradient-end",
    "--theme-color",
    "--theme-text-color",
    "--contrast-level",
    "--brightness-level",
  ];

  propertiesToRemove.forEach(property => {
    element.style.removeProperty(property);
  });
}
