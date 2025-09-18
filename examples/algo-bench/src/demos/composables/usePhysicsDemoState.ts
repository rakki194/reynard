import { createSignal } from "solid-js";
import type { PhysicsObject, PhysicsStats } from "../types";

/**
 * State management composable for physics demo
 * Handles all reactive state signals
 */
export function usePhysicsDemoState() {
  const [isRunning, setIsRunning] = createSignal(false);
  const [gravity, setGravity] = createSignal(0.5);
  const [damping, setDamping] = createSignal(0.98);
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement>();

  // Create physics objects signal
  const [objects, setObjects] = createSignal<PhysicsObject[]>([]);
  const [stats, setStats] = createSignal<PhysicsStats>({
    collisionChecks: 0,
    actualCollisions: 0,
    fps: 0,
    lastFrameTime: 0,
  });

  return {
    // State signals
    isRunning,
    gravity,
    damping,
    canvasRef,
    objects,
    stats,

    // State setters
    setIsRunning,
    setGravity,
    setDamping,
    setCanvasRef,
    setObjects,
    setStats,
  };
}
