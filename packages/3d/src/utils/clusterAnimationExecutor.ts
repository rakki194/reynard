// Cluster animation execution utility
// Handles the animation loop and progress tracking

import type { ClusterAnimation, EasingType } from "../types";
import { applyEasing } from "./easing";

export interface AnimationExecutorOptions {
  duration: number;
  easing: EasingType;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

/**
 * Execute cluster animation with progress tracking
 */
export function executeClusterAnimation(
  options: AnimationExecutorOptions,
): Promise<void> {
  const { duration, easing, onProgress, onComplete } = options;

  return new Promise<void>((resolve) => {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = applyEasing(progress, easing);

      onProgress(easedProgress);

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
