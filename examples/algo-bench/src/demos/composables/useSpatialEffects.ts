import { createEffect, onCleanup } from "solid-js";

/**
 * Effects and cleanup composable for spatial optimization demo
 * Handles reactive effects and cleanup logic
 */
export function useSpatialEffects(
  objectCount: () => number,
  generateObjects: (count: number) => void,
  isRunning: () => boolean,
  animation: { startAnimation: () => void; stopAnimation: () => void }
) {
  // Generate objects when count changes
  createEffect(() => {
    generateObjects(objectCount());
  });

  // Control animation based on running state
  createEffect(() => {
    if (isRunning()) {
      animation.startAnimation();
    } else {
      animation.stopAnimation();
    }
  });

  // Cleanup
  onCleanup(() => {
    animation.stopAnimation();
  });
}
