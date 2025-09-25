/**
 * 🦊 Scroll Animations
 *
 * Parallax scrolling effects, reveal animations, and progress-based animations
 */

import { ScrollObserver, globalScrollObserver } from "./ScrollObserver";
import { createSimpleAnimation } from "../utils/SimplifiedAnimationLoop";
import type { EasingType } from "../types";

export interface ParallaxOptions {
  speed: number; // 0 = no movement, 1 = same as scroll, >1 = faster
  direction?: "vertical" | "horizontal" | "both";
  offset?: number;
  easing?: EasingType;
}

export interface RevealOptions {
  direction?: "up" | "down" | "left" | "right" | "fade";
  distance?: number;
  duration?: number;
  easing?: EasingType;
  delay?: number;
  triggerOnce?: boolean;
}

export interface ProgressAnimationOptions {
  properties: {
    translateX?: (progress: number) => number;
    translateY?: (progress: number) => number;
    scale?: (progress: number) => number;
    rotate?: (progress: number) => number;
    opacity?: (progress: number) => number;
  };
  easing?: EasingType;
}

export class ScrollAnimations {
  private observer: ScrollObserver;
  private elements: Map<Element, any> = new Map();

  constructor(observer: ScrollObserver = globalScrollObserver) {
    this.observer = observer;
  }

  /**
   * Create parallax scrolling effect
   */
  createParallax(element: HTMLElement, options: ParallaxOptions): () => void {
    const { speed, direction = "vertical", offset = 0, easing = "linear" } = options;

    let isActive = true;
    let initialTransform = "";

    const updateParallax = (progress: number) => {
      if (!isActive) return;

      const scrollY = window.scrollY;
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top + scrollY;
      const viewportHeight = window.innerHeight;

      // Calculate parallax offset
      const parallaxOffset = (scrollY - elementTop + viewportHeight) * speed + offset;

      let transform = "";

      if (direction === "vertical" || direction === "both") {
        transform += `translateY(${parallaxOffset}px) `;
      }

      if (direction === "horizontal" || direction === "both") {
        transform += `translateX(${parallaxOffset}px) `;
      }

      element.style.transform = transform.trim();
    };

    // Set initial transform
    initialTransform = element.style.transform;

    // Observe element for scroll progress
    this.observer.observe(element, {
      onProgress: progress => {
        updateParallax(progress);
      },
    });

    // Store cleanup function
    const cleanup = () => {
      isActive = false;
      element.style.transform = initialTransform;
      this.observer.unobserve(element);
      this.elements.delete(element);
    };

    this.elements.set(element, cleanup);
    return cleanup;
  }

  /**
   * Create reveal animation on scroll
   */
  createReveal(element: HTMLElement, options: RevealOptions): () => void {
    const {
      direction = "up",
      distance = 50,
      duration = 600,
      easing = "easeOutCubic",
      delay = 0,
      triggerOnce = true,
    } = options;

    let isRevealed = false;
    let isAnimating = false;
    let initialTransform = "";
    let initialOpacity = "";

    // Set initial state
    const setInitialState = () => {
      initialTransform = element.style.transform;
      initialOpacity = element.style.opacity;

      let hiddenTransform = "";
      let hiddenOpacity = "0";

      switch (direction) {
        case "up":
          hiddenTransform = `translateY(${distance}px)`;
          break;
        case "down":
          hiddenTransform = `translateY(-${distance}px)`;
          break;
        case "left":
          hiddenTransform = `translateX(${distance}px)`;
          break;
        case "right":
          hiddenTransform = `translateX(-${distance}px)`;
          break;
        case "fade":
          hiddenOpacity = "0";
          break;
      }

      element.style.transform = hiddenTransform;
      element.style.opacity = hiddenOpacity;
    };

    const reveal = () => {
      if (isRevealed || isAnimating) return;

      isAnimating = true;

      setTimeout(() => {
        createSimpleAnimation(
          duration,
          easing,
          progress => {
            if (direction === "fade") {
              element.style.opacity = progress.toString();
            } else {
              element.style.transform = initialTransform;
              element.style.opacity = "1";
            }
          },
          () => {
            isRevealed = true;
            isAnimating = false;
          }
        );
      }, delay);
    };

    // Set initial hidden state
    setInitialState();

    // Observe element
    this.observer.observe(element, {
      onEnter: () => {
        reveal();
      },
      triggerOnce,
    });

    // Store cleanup function
    const cleanup = () => {
      element.style.transform = initialTransform;
      element.style.opacity = initialOpacity;
      this.observer.unobserve(element);
      this.elements.delete(element);
    };

    this.elements.set(element, cleanup);
    return cleanup;
  }

  /**
   * Create progress-based animation
   */
  createProgressAnimation(element: HTMLElement, options: ProgressAnimationOptions): () => void {
    const { properties, easing = "linear" } = options;

    let isActive = true;

    const updateProgress = (progress: number) => {
      if (!isActive) return;

      const transforms: string[] = [];

      if (properties.translateX) {
        const x = properties.translateX(progress);
        transforms.push(`translateX(${x}px)`);
      }

      if (properties.translateY) {
        const y = properties.translateY(progress);
        transforms.push(`translateY(${y}px)`);
      }

      if (properties.scale) {
        const scale = properties.scale(progress);
        transforms.push(`scale(${scale})`);
      }

      if (properties.rotate) {
        const rotate = properties.rotate(progress);
        transforms.push(`rotate(${rotate}deg)`);
      }

      if (properties.opacity) {
        const opacity = properties.opacity(progress);
        element.style.opacity = opacity.toString();
      }

      if (transforms.length > 0) {
        element.style.transform = transforms.join(" ");
      }
    };

    // Observe element for scroll progress
    this.observer.observe(element, {
      onProgress: progress => {
        updateProgress(progress);
      },
    });

    // Store cleanup function
    const cleanup = () => {
      isActive = false;
      element.style.transform = "";
      element.style.opacity = "";
      this.observer.unobserve(element);
      this.elements.delete(element);
    };

    this.elements.set(element, cleanup);
    return cleanup;
  }

  /**
   * Create scroll-triggered animation sequence
   */
  createSequence(
    elements: HTMLElement[],
    options: {
      stagger?: number;
      direction?: "up" | "down" | "left" | "right" | "fade";
      distance?: number;
      duration?: number;
      easing?: EasingType;
    }
  ): () => void {
    const { stagger = 100, direction = "up", distance = 50, duration = 600, easing = "easeOutCubic" } = options;

    const cleanups: (() => void)[] = [];

    elements.forEach((element, index) => {
      const cleanup = this.createReveal(element, {
        direction,
        distance,
        duration,
        easing,
        delay: index * stagger,
        triggerOnce: true,
      });
      cleanups.push(cleanup);
    });

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }

  /**
   * Clean up all animations
   */
  destroy(): void {
    this.elements.forEach(cleanup => cleanup());
    this.elements.clear();
  }
}

// Global scroll animations instance
export const globalScrollAnimations = new ScrollAnimations();
