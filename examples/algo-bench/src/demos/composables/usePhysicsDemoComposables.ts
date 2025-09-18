import { usePhysicsSimulation } from "./usePhysicsSimulation";
import { useCollisionDetection } from "./useCollisionDetection";
import { useCanvasRenderer } from "./useCanvasRenderer";
import { useMouseInteractions } from "./useMouseInteractions";
import { useEnergyCalculation } from "./useEnergyCalculation";
import { useAnimationLoop } from "./useAnimationLoop";
import type { PhysicsObject, PhysicsStats } from "../types";

/**
 * Composable initialization for physics demo
 * Handles creation and configuration of all sub-composables
 */
export function usePhysicsDemoComposables(
  objects: () => PhysicsObject[],
  setObjects: (objects: PhysicsObject[]) => void,
  canvasRef: () => HTMLCanvasElement | undefined,
  gravity: () => number,
  setStats: (stats: PhysicsStats) => void,
  isRunning: () => boolean
) {
  // Initialize composables
  const physics = usePhysicsSimulation(setObjects);
  const collisionDetection = useCollisionDetection();
  const mouseInteractions = useMouseInteractions(canvasRef, objects, setObjects);
  const energyCalculation = useEnergyCalculation(objects, gravity, setStats);
  const renderer = useCanvasRenderer(canvasRef, objects, () => [], mouseInteractions.mousePos);

  // Initialize animation loop
  const animationLoop = useAnimationLoop({
    isRunning,
    physics: {
      objects,
      collisions: () => [],
      updatePhysics: physics.updatePhysics,
      handleCollisionResponse: () => {},
      setObjects,
      setStats,
    },
    collisionDetection,
    energyCalculation,
    renderer,
  });

  return {
    physics,
    collisionDetection,
    mouseInteractions,
    energyCalculation,
    renderer,
    animationLoop,
  };
}
