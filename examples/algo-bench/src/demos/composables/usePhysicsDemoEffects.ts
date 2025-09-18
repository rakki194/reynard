import { createEffect, onCleanup } from "solid-js";
import type { PhysicsStats } from "../types";

/**
 * Effects and cleanup composable for physics demo
 * Handles reactive effects and cleanup logic
 */
export function usePhysicsDemoEffects(
  stats: () => PhysicsStats,
  onStatsUpdate: (stats: PhysicsStats) => void,
  isRunning: () => boolean,
  animationLoop: { startAnimation: () => void; stopAnimation: () => void }
) {
  // Stats update effect
  createEffect(() => {
    onStatsUpdate(stats());
  });

  // Animation control effect
  createEffect(() => {
    if (isRunning()) {
      animationLoop.startAnimation();
    } else {
      animationLoop.stopAnimation();
    }
  });

  // Cleanup
  onCleanup(() => {
    animationLoop.stopAnimation();
  });
}
