import { type Accessor } from "solid-js";
import type { PhysicsObject, PhysicsStats } from "../types";
import type { CollisionResult } from "reynard-algorithms";
import { useFpsCalculator } from "./useFpsCalculator";
import { useCollisionStateManager } from "./useCollisionStateManager";

export interface AnimationLoopConfig {
  isRunning: Accessor<boolean>;
  physics: {
    objects: Accessor<PhysicsObject[]>;
    collisions: Accessor<Array<{ index1: number; index2: number; result: CollisionResult }>>;
    updatePhysics: (deltaTime: number) => void;
    handleCollisionResponse: (obj1: PhysicsObject, obj2: PhysicsObject) => void;
    setObjects: (updater: (prev: PhysicsObject[]) => PhysicsObject[]) => void;
    setStats: (updater: (prev: PhysicsStats) => PhysicsStats) => void;
  };
  collisionDetection: {
    checkCollisions: (
      objects: PhysicsObject[],
      onCollisionResponse: (obj1: PhysicsObject, obj2: PhysicsObject) => void,
      onStatsUpdate: (stats: { collisionChecks: number; actualCollisions: number; lastFrameTime: number }) => void
    ) => void;
  };
  energyCalculation: {
    calculateTotalEnergy: () => void;
  };
  renderer: {
    render: () => void;
  };
}

/**
 * Animation loop composable for physics simulations
 * Orchestrates the main animation cycle using focused sub-composables
 */
export function useAnimationLoop(config: AnimationLoopConfig) {
  let animationFrameId: number;
  let lastTime = 0;

  // Initialize focused composables
  const fpsCalculator = useFpsCalculator({ setStats: config.physics.setStats });
  const collisionStateManager = useCollisionStateManager({
    objects: config.physics.objects,
    collisions: config.physics.collisions,
    setObjects: config.physics.setObjects,
  });

  // Main animation loop
  const animate = (currentTime: number) => {
    if (!config.isRunning()) return;

    const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to 60fps
    lastTime = currentTime;

    // Update physics
    config.physics.updatePhysics(deltaTime);

    // Check collisions with response handling
    config.collisionDetection.checkCollisions(
      config.physics.objects(),
      config.physics.handleCollisionResponse,
      collisionStats => {
        config.physics.setStats(prev => ({
          ...prev,
          ...collisionStats,
        }));
      }
    );

    // Update collision states
    collisionStateManager.updateCollisionStates();

    // Calculate energy and render
    config.energyCalculation.calculateTotalEnergy();
    config.renderer.render();

    // Update FPS
    fpsCalculator.updateFps(deltaTime);

    animationFrameId = window.requestAnimationFrame(animate);
  };

  // Start animation loop
  const startAnimation = () => {
    lastTime = performance.now();
    fpsCalculator.reset();
    animationFrameId = window.requestAnimationFrame(animate);
  };

  // Stop animation loop
  const stopAnimation = () => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }
  };

  return {
    startAnimation,
    stopAnimation,
  };
}
