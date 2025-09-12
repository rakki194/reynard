// Animation loop utilities
import type { AnimationState, EasingType } from "../types";
import { applyEasing } from "./easing";

/**
 * Create animation loop for point transitions
 */
export function createAnimationLoop(
  animationState: AnimationState,
  duration: number,
  easing: EasingType,
  onUpdate: (progress: number) => void,
  onComplete: () => void
): Promise<void> {
  return new Promise<void>((resolve) => {
    const animate = (currentTime: number) => {
      const elapsed = currentTime - animationState.startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = applyEasing(progress, easing);

      animationState.progress = easedProgress;
      onUpdate(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
}

/**
 * Create cluster animation loop
 */
export function createClusterAnimationLoop(
  startTime: number,
  duration: number,
  easing: EasingType,
  onUpdate: (progress: number) => void,
  onComplete: () => void
): Promise<void> {
  return new Promise<void>((resolve) => {
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = applyEasing(progress, easing);

      onUpdate(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
}
