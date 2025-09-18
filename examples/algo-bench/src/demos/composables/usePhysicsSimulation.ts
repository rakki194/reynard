import type { Setter } from "solid-js";
import type { PhysicsObject } from "../types";

/**
 * Composable for physics simulation and object movement
 */
export function usePhysicsSimulation(setObjects: Setter<PhysicsObject[]>) {
  /**
   * Update physics simulation for all objects
   */
  const updatePhysics = (deltaTime: number, canvasWidth: number, canvasHeight: number) => {
    setObjects(prev =>
      prev.map(obj => {
        let newX = obj.x + obj.vx * deltaTime;
        let newY = obj.y + obj.vy * deltaTime;
        let newVx = obj.vx;
        let newVy = obj.vy;

        // Bounce off walls
        if (newX <= 0 || newX + obj.width >= canvasWidth) {
          newVx = -newVx;
          newX = Math.max(0, Math.min(canvasWidth - obj.width, newX));
        }
        if (newY <= 0 || newY + obj.height >= canvasHeight) {
          newVy = -newVy;
          newY = Math.max(0, Math.min(canvasHeight - obj.height, newY));
        }

        return {
          ...obj,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          colliding: false,
        };
      })
    );
  };

  return {
    updatePhysics,
  };
}
