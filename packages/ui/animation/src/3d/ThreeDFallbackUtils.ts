/**
 * 🦊 3D Fallback Animation Utilities
 *
 * Utility functions for applying CSS-based fallback 3D animations.
 * Provides immediate completion for disabled animations and performance optimizations.
 */

import type { EmbeddingPoint } from "./ThreeDAnimationTypes.js";

export interface ThreeDFallbackOptions {
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Easing function to use */
  easing?: string;
  /** Whether to use immediate completion for disabled animations */
  immediateCompletion?: boolean;
  /** Whether to respect global animation control */
  respectGlobalControl?: boolean;
  /** 3D perspective value */
  perspective?: number;
  /** Transform origin */
  transformOrigin?: string;
}

/**
 * Apply CSS fallback 3D point animation to an element
 */
export function apply3DPointFallback(
  element: HTMLElement,
  startPoint: EmbeddingPoint,
  endPoint: EmbeddingPoint,
  options: ThreeDFallbackOptions = {}
): void {
  const {
    duration = 800,
    easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    immediateCompletion = true,
    respectGlobalControl = true,
  } = options;

  // Check if animations should be disabled
  if (respectGlobalControl && shouldDisable3DAnimations()) {
    if (immediateCompletion) {
      applyImmediate3DTransform(element, endPoint);
    }
    return;
  }

  // Apply CSS transition
  element.style.setProperty("--3d-animation-duration", `${duration}ms`);
  element.style.setProperty("--3d-animation-easing", easing);
  element.style.setProperty("--point-x", `${endPoint.x}px`);
  element.style.setProperty("--point-y", `${endPoint.y}px`);
  element.style.setProperty("--point-z", `${endPoint.z}px`);
  element.style.setProperty("--point-opacity", "1");

  element.classList.add("three-d-point-fallback");

  // Trigger the transition
  requestAnimationFrame(() => {
    element.classList.add("animate");
  });
}

/**
 * Apply CSS fallback 3D cluster animation to elements
 */
export function apply3DClusterFallback(
  elements: HTMLElement[],
  center: [number, number, number],
  expansionRadius: number,
  options: ThreeDFallbackOptions = {}
): void {
  const {
    duration = 800,
    easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    immediateCompletion = true,
    respectGlobalControl = true,
  } = options;

  // Check if animations should be disabled
  if (respectGlobalControl && shouldDisable3DAnimations()) {
    if (immediateCompletion) {
      elements.forEach(element => {
        applyImmediate3DTransform(element, { x: center[0], y: center[1], z: center[2] });
      });
    }
    return;
  }

  // Apply CSS cluster animation
  elements.forEach((element, index) => {
    element.style.setProperty("--3d-animation-duration", `${duration}ms`);
    element.style.setProperty("--3d-animation-easing", easing);
    element.style.setProperty("--cluster-x", `${center[0]}px`);
    element.style.setProperty("--cluster-y", `${center[1]}px`);
    element.style.setProperty("--cluster-z", `${center[2]}px`);
    element.style.setProperty("--cluster-scale", "1.2");
    element.style.setProperty("--3d-animation-delay", `${index * 50}ms`);

    element.classList.add("three-d-cluster-fallback");

    // Trigger the transition
    requestAnimationFrame(() => {
      element.classList.add("animate");
    });
  });
}

/**
 * Apply CSS fallback 3D camera animation to an element
 */
export function apply3DCameraFallback(
  element: HTMLElement,
  startPosition: [number, number, number],
  endPosition: [number, number, number],
  options: ThreeDFallbackOptions = {}
): void {
  const {
    duration = 800,
    easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    immediateCompletion = true,
    respectGlobalControl = true,
  } = options;

  // Check if animations should be disabled
  if (respectGlobalControl && shouldDisable3DAnimations()) {
    if (immediateCompletion) {
      applyImmediate3DTransform(element, { x: endPosition[0], y: endPosition[1], z: endPosition[2] });
    }
    return;
  }

  // Apply CSS camera animation
  element.style.setProperty("--3d-animation-duration", `${duration}ms`);
  element.style.setProperty("--3d-animation-easing", easing);
  element.style.setProperty("--camera-x", `${endPosition[0]}px`);
  element.style.setProperty("--camera-y", `${endPosition[1]}px`);
  element.style.setProperty("--camera-z", `${endPosition[2]}px`);

  element.classList.add("three-d-camera-fallback");

  // Trigger the transition
  requestAnimationFrame(() => {
    element.classList.add("animate");
  });
}

/**
 * Apply CSS fallback 3D rotation animation to an element
 */
export function apply3DRotationFallback(
  element: HTMLElement,
  rotation: [number, number, number],
  options: ThreeDFallbackOptions = {}
): void {
  const {
    duration = 800,
    easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    immediateCompletion = true,
    respectGlobalControl = true,
  } = options;

  // Check if animations should be disabled
  if (respectGlobalControl && shouldDisable3DAnimations()) {
    if (immediateCompletion) {
      element.style.transform = `rotateX(${rotation[0]}deg) rotateY(${rotation[1]}deg) rotateZ(${rotation[2]}deg)`;
    }
    return;
  }

  // Apply CSS rotation animation
  element.style.setProperty("--3d-animation-duration", `${duration}ms`);
  element.style.setProperty("--3d-animation-easing", easing);
  element.style.setProperty("--rotation-x", `${rotation[0]}deg`);
  element.style.setProperty("--rotation-y", `${rotation[1]}deg`);
  element.style.setProperty("--rotation-z", `${rotation[2]}deg`);

  element.classList.add("three-d-rotation-fallback");

  // Trigger the transition
  requestAnimationFrame(() => {
    element.classList.add("animate");
  });
}

/**
 * Apply CSS fallback 3D scale animation to an element
 */
export function apply3DScaleFallback(
  element: HTMLElement,
  scale: [number, number, number],
  options: ThreeDFallbackOptions = {}
): void {
  const {
    duration = 800,
    easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    immediateCompletion = true,
    respectGlobalControl = true,
  } = options;

  // Check if animations should be disabled
  if (respectGlobalControl && shouldDisable3DAnimations()) {
    if (immediateCompletion) {
      element.style.transform = `scale3d(${scale[0]}, ${scale[1]}, ${scale[2]})`;
    }
    return;
  }

  // Apply CSS scale animation
  element.style.setProperty("--3d-animation-duration", `${duration}ms`);
  element.style.setProperty("--3d-animation-easing", easing);
  element.style.setProperty("--scale-x", scale[0].toString());
  element.style.setProperty("--scale-y", scale[1].toString());
  element.style.setProperty("--scale-z", scale[2].toString());

  element.classList.add("three-d-scale-fallback");

  // Trigger the transition
  requestAnimationFrame(() => {
    element.classList.add("animate");
  });
}

/**
 * Apply CSS fallback 3D translation animation to an element
 */
export function apply3DTranslationFallback(
  element: HTMLElement,
  translation: [number, number, number],
  options: ThreeDFallbackOptions = {}
): void {
  const {
    duration = 800,
    easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    immediateCompletion = true,
    respectGlobalControl = true,
  } = options;

  // Check if animations should be disabled
  if (respectGlobalControl && shouldDisable3DAnimations()) {
    if (immediateCompletion) {
      element.style.transform = `translate3d(${translation[0]}px, ${translation[1]}px, ${translation[2]}px)`;
    }
    return;
  }

  // Apply CSS translation animation
  element.style.setProperty("--3d-animation-duration", `${duration}ms`);
  element.style.setProperty("--3d-animation-easing", easing);
  element.style.setProperty("--translation-x", `${translation[0]}px`);
  element.style.setProperty("--translation-y", `${translation[1]}px`);
  element.style.setProperty("--translation-z", `${translation[2]}px`);

  element.classList.add("three-d-translation-fallback");

  // Trigger the transition
  requestAnimationFrame(() => {
    element.classList.add("animate");
  });
}

/**
 * Apply immediate 3D transform (no animation)
 */
export function applyImmediate3DTransform(element: HTMLElement, point: EmbeddingPoint): void {
  element.style.transform = `translate3d(${point.x}px, ${point.y}px, ${point.z}px)`;
  element.style.transition = "none";

  // Force reflow
  element.offsetHeight;

  // Restore transition
  element.style.transition = "";
}

/**
 * Check if 3D animations should be disabled
 */
function shouldDisable3DAnimations(): boolean {
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
 * Create CSS custom properties for 3D animation
 */
export function create3DAnimationCSS(transforms: Record<string, string>, options: ThreeDFallbackOptions = {}): string {
  const {
    duration = 800,
    easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    perspective = 1000,
    transformOrigin = "center center",
  } = options;

  const cssVariables = [
    `--3d-animation-duration: ${duration}ms`,
    `--3d-animation-easing: ${easing}`,
    `--3d-perspective: ${perspective}px`,
    `--3d-transform-origin: ${transformOrigin}`,
  ];

  Object.entries(transforms).forEach(([key, value]) => {
    cssVariables.push(`--${key}: ${value}`);
  });

  return cssVariables.join("; ");
}

/**
 * Apply CSS custom properties to an element
 */
export function apply3DAnimationCSS(
  element: HTMLElement,
  transforms: Record<string, string>,
  options: ThreeDFallbackOptions = {}
): void {
  const css = create3DAnimationCSS(transforms, options);
  element.style.cssText += css;
}

/**
 * Remove 3D animation classes from element
 */
export function remove3DAnimationClasses(element: HTMLElement): void {
  const classesToRemove = [
    "three-d-point-fallback",
    "three-d-cluster-fallback",
    "three-d-camera-fallback",
    "three-d-rotation-fallback",
    "three-d-scale-fallback",
    "three-d-translation-fallback",
    "three-d-orbit-fallback",
    "three-d-zoom-fallback",
    "three-d-fade-fallback",
    "three-d-color-fallback",
    "three-d-staggered-fallback",
    "three-d-animation-enter",
    "three-d-animation-exit",
    "animate",
  ];

  classesToRemove.forEach(className => {
    element.classList.remove(className);
  });
}

/**
 * Clean up 3D animation styles from element
 */
export function cleanup3DAnimationStyles(element: HTMLElement): void {
  remove3DAnimationClasses(element);

  // Remove CSS custom properties
  const propertiesToRemove = [
    "--3d-animation-duration",
    "--3d-animation-easing",
    "--3d-animation-delay",
    "--3d-perspective",
    "--3d-transform-origin",
    "--point-x",
    "--point-y",
    "--point-z",
    "--point-opacity",
    "--cluster-x",
    "--cluster-y",
    "--cluster-z",
    "--cluster-scale",
    "--camera-x",
    "--camera-y",
    "--camera-z",
    "--camera-rotate-x",
    "--camera-rotate-y",
    "--camera-rotate-z",
    "--rotation-x",
    "--rotation-y",
    "--rotation-z",
    "--scale-x",
    "--scale-y",
    "--scale-z",
    "--translation-x",
    "--translation-y",
    "--translation-z",
    "--orbit-x",
    "--orbit-y",
    "--orbit-radius",
    "--zoom-scale",
    "--fade-opacity",
    "--color-rgb",
    "--background-rgb",
    "--border-rgb",
  ];

  propertiesToRemove.forEach(property => {
    element.style.removeProperty(property);
  });
}
