/**
 * 🦊 Animation State Manager
 *
 * Manages animation state and provides computed values
 */

import { createMemo, createSignal } from "solid-js";

export interface AnimationState {
  isAnimating: () => boolean;
  currentIndex: () => number;
  totalItems: () => number;
  animationEngine: () => "full" | "fallback" | "disabled";
  fallbackSystem: () => unknown;
  globalControl: () => unknown;
  shouldDisableAnimations: () => boolean;
}

/**
 * Create animation state management
 */
export function createAnimationStateManager(respectGlobalControl: boolean): {
  state: AnimationState;
  setters: {
    setIsAnimating: (animating: boolean) => void;
    setCurrentIndex: (index: number) => void;
    setTotalItems: (count: number) => void;
    setAnimationEngine: (engine: "full" | "fallback" | "disabled") => void;
    setFallbackSystem: (system: unknown) => void;
    setGlobalControl: (control: unknown) => void;
  };
} {
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [totalItems, setTotalItems] = createSignal(0);
  const [animationEngine, setAnimationEngine] = createSignal<"full" | "fallback" | "disabled">("full");
  const [fallbackSystem, setFallbackSystem] = createSignal<unknown>(null);
  const [globalControl, setGlobalControl] = createSignal<unknown>(null);

  // Check if animations should be disabled
  const shouldDisableAnimations = createMemo(() => {
    if (animationEngine() === "disabled") return true;

    if (globalControl() && respectGlobalControl) {
      const control = globalControl() as Record<string, unknown>;
      const isDisabled = control.isAnimationsDisabled as (() => boolean) | undefined;
      return isDisabled?.() || false;
    }

    return false;
  });

  const state: AnimationState = {
    isAnimating,
    currentIndex,
    totalItems,
    animationEngine,
    fallbackSystem,
    globalControl,
    shouldDisableAnimations,
  };

  const setters = {
    setIsAnimating,
    setCurrentIndex,
    setTotalItems,
    setAnimationEngine,
    setFallbackSystem,
    setGlobalControl,
  };

  return { state, setters };
}
