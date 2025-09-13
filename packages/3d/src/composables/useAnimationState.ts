// Animation state management composable
// 
// @deprecated Use reynard-animation package instead
// This file is kept for backward compatibility
import { createSignal, createMemo } from "solid-js";
import type { AnimationState, EasingType } from "../types";

export function useAnimationState() {
  const [currentAnimation, setCurrentAnimation] =
    createSignal<AnimationState | null>(null);
  const [animationFrameId, setAnimationFrameId] = createSignal<number | null>(
    null,
  );

  const isAnimationsDisabled = createMemo(() => false);

  const createAnimationState = (
    duration: number,
    easing: EasingType,
  ): AnimationState => ({
    isAnimating: true,
    progress: 0,
    startTime: performance.now(),
    duration,
    easing,
  });

  const stopAnimations = () => {
    const currentId = animationFrameId();
    if (currentId) {
      window.cancelAnimationFrame(currentId);
      setAnimationFrameId(null);
    }
    setCurrentAnimation(null);
  };

  return {
    currentAnimation,
    setCurrentAnimation,
    animationFrameId,
    setAnimationFrameId,
    isAnimationsDisabled,
    createAnimationState,
    stopAnimations,
  };
}
