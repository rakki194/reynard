import { usePhysicsDemoState } from "./usePhysicsDemoState";
import { usePhysicsDemoComposables } from "./usePhysicsDemoComposables";
import { usePhysicsDemoEffects } from "./usePhysicsDemoEffects";
import type { PhysicsStats } from "../types";

/**
 * Main physics demo composable that orchestrates all simulation modules
 * Provides a clean interface for the main component
 */
export function usePhysicsDemo(onStatsUpdate: (stats: PhysicsStats) => void) {
  // Initialize state management
  const state = usePhysicsDemoState();

  // Initialize composables
  const composables = usePhysicsDemoComposables(
    state.objects,
    state.setObjects,
    state.canvasRef,
    state.gravity,
    state.setStats,
    state.isRunning
  );

  // Setup effects and cleanup
  usePhysicsDemoEffects(state.stats, onStatsUpdate, state.isRunning, composables.animationLoop);

  return {
    // State
    isRunning: state.isRunning,
    gravity: state.gravity,
    damping: state.damping,
    canvasRef: state.canvasRef,
    objects: state.objects,
    stats: state.stats,

    // Mouse interactions
    mouseInteractions: composables.mouseInteractions,

    // Control functions
    setGravity: state.setGravity,
    setDamping: state.setDamping,
    setIsRunning: state.setIsRunning,
    setCanvasRef: state.setCanvasRef,
  };
}
