/**
 * 🦊 Color Animation Composable
 * 
 * SolidJS composable for color animations with smart imports and fallbacks.
 * Integrates with the unified animation system.
 */

import { createSignal, createMemo, onCleanup } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import { getColorAnimationSystem } from "./ColorAnimationSystem.js";
import { ColorEasingFunctions } from "./ColorAnimations.js";

export interface UseColorAnimationOptions {
  /** Base color for animations */
  baseColor?: OKLCHColor;
  /** Default duration for animations */
  duration?: number;
  /** Default easing function */
  easing?: keyof typeof ColorEasingFunctions;
  /** Whether to use fallback animations when package unavailable */
  useFallback?: boolean;
  /** Whether to respect global animation control */
  respectGlobalControl?: boolean;
}

export interface UseColorAnimationReturn {
  /** Current color state */
  currentColor: () => OKLCHColor;
  /** Whether animation is currently running */
  isAnimating: () => boolean;
  /** Current animation engine being used */
  animationEngine: () => "full" | "fallback" | "disabled";
  /** Whether animations are currently disabled */
  isAnimationsDisabled: () => boolean;
  /** Whether color package is available */
  isColorPackageAvailable: () => boolean;
  
  /** Animation functions */
  animateToColor: (targetColor: OKLCHColor, options?: ColorAnimationOptions) => Promise<void>;
  animateHueShift: (deltaH: number, options?: ColorAnimationOptions) => Promise<void>;
  generateColorRamp: (targetColor: OKLCHColor, stops?: number) => OKLCHColor[];
  generateHueRamp: (maxShift: number, stops?: number) => OKLCHColor[];
  
  /** Control functions */
  stopAnimation: () => void;
  resetToBase: () => void;
}

export interface ColorAnimationOptions {
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Easing function to use */
  easing?: keyof typeof ColorEasingFunctions;
  /** Whether to use fallback animations when package unavailable */
  useFallback?: boolean;
  /** Whether to respect global animation control */
  respectGlobalControl?: boolean;
}

/**
 * Color animation composable with smart imports and fallbacks
 */
export function useColorAnimation(options: UseColorAnimationOptions = {}): UseColorAnimationReturn {
  const {
    baseColor = { l: 0.5, c: 0.1, h: 0 },
    duration = 300,
    easing = "linear",
    useFallback = true,
    respectGlobalControl = true,
  } = options;

  const [currentColor, setCurrentColor] = createSignal<OKLCHColor>(baseColor);
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [animationId, setAnimationId] = createSignal<number | null>(null);

  // Get color animation system
  const colorSystem = getColorAnimationSystem();
  const { state, functions } = colorSystem;

  // Animation control functions
  const stopAnimation = () => {
    const id = animationId();
    if (id !== null) {
      cancelAnimationFrame(id);
      setAnimationId(null);
    }
    setIsAnimating(false);
  };

  const resetToBase = () => {
    stopAnimation();
    setCurrentColor(baseColor);
  };

  // Enhanced animation functions
  const animateToColor = async (
    targetColor: OKLCHColor,
    animationOptions: ColorAnimationOptions = {}
  ): Promise<void> => {
    if (isAnimating()) {
      console.warn("🦊 ColorAnimation: Already animating, ignoring request");
      return;
    }

    const {
      duration: animDuration = duration,
      easing: animEasing = easing,
      useFallback: animUseFallback = useFallback,
      respectGlobalControl: animRespectControl = respectGlobalControl,
    } = animationOptions;

    setIsAnimating(true);

    try {
      const colors = await functions.animateColorTransition(
        currentColor(),
        targetColor,
        {
          duration: animDuration,
          easing: animEasing,
          useFallback: animUseFallback,
          respectGlobalControl: animRespectControl,
        }
      );

      // Animate through the color steps
      const startTime = performance.now();
      const totalDuration = animDuration;
      const easingFunction = ColorEasingFunctions[animEasing];

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);
        const easedProgress = easingFunction(progress);

        // Interpolate between start and end color
        const startColor = currentColor();
        const interpolated = functions.interpolateColor(
          startColor,
          targetColor,
          easedProgress,
          easingFunction
        );

        setCurrentColor(interpolated);

        if (progress < 1) {
          const id = requestAnimationFrame(animate);
          setAnimationId(id);
        } else {
          setCurrentColor(targetColor);
          setIsAnimating(false);
          setAnimationId(null);
        }
      };

      const id = requestAnimationFrame(animate);
      setAnimationId(id);
    } catch (error) {
      console.error("🦊 ColorAnimation: Animation failed:", error);
      setCurrentColor(targetColor);
      setIsAnimating(false);
      setAnimationId(null);
    }
  };

  const animateHueShift = async (
    deltaH: number,
    animationOptions: ColorAnimationOptions = {}
  ): Promise<void> => {
    const targetColor = functions.pureHueShift(currentColor(), deltaH);
    await animateToColor(targetColor, animationOptions);
  };

  const generateColorRamp = (
    targetColor: OKLCHColor,
    stops: number = 5
  ): OKLCHColor[] => {
    return functions.generateEasedColorRamp(
      currentColor(),
      targetColor,
      stops,
      ColorEasingFunctions[easing]
    );
  };

  const generateHueRamp = (
    maxShift: number,
    stops: number = 5
  ): OKLCHColor[] => {
    return functions.generateEasedHueRamp(
      currentColor(),
      stops,
      maxShift,
      ColorEasingFunctions[easing]
    );
  };

  // Cleanup on unmount
  onCleanup(() => {
    stopAnimation();
  });

  return {
    currentColor,
    isAnimating,
    animationEngine: state.animationEngine,
    isAnimationsDisabled: state.isAnimationsDisabled,
    isColorPackageAvailable: state.isColorPackageAvailable,
    animateToColor,
    animateHueShift,
    generateColorRamp,
    generateHueRamp,
    stopAnimation,
    resetToBase,
  };
}

/**
 * Hook for creating color animation with specific base color
 */
export function useColorAnimationWithBase(baseColor: OKLCHColor, options?: Omit<UseColorAnimationOptions, 'baseColor'>) {
  return useColorAnimation({ ...options, baseColor });
}

/**
 * Hook for hue shifting animations
 */
export function useHueShiftAnimation(baseColor: OKLCHColor, options?: UseColorAnimationOptions) {
  const colorAnimation = useColorAnimation({ ...options, baseColor });
  
  return {
    ...colorAnimation,
    shiftHue: (deltaH: number, animationOptions?: ColorAnimationOptions) => 
      colorAnimation.animateHueShift(deltaH, animationOptions),
  };
}
