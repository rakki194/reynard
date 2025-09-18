import type { Accessor } from "solid-js";
import type { PhysicsObject } from "../types";
import type { CollisionResult } from "reynard-algorithms";

export interface CollisionStateConfig {
  objects: Accessor<PhysicsObject[]>;
  collisions: Accessor<Array<{ index1: number; index2: number; result: CollisionResult }>>;
  setObjects: (updater: (prev: PhysicsObject[]) => PhysicsObject[]) => void;
}

/**
 * Collision state management composable
 * Handles updating object collision states based on collision detection results
 */
export function useCollisionStateManager(config: CollisionStateConfig) {
  const updateCollisionStates = () => {
    // Reset all collision states
    config.setObjects(prev => prev.map(obj => ({ ...obj, colliding: false })));

    // Set collision states for colliding objects
    config.collisions().forEach(collision => {
      const dynamicObjects = config.objects().filter(obj => !obj.isStatic);
      const obj1 = dynamicObjects[collision.index1];
      const obj2 = dynamicObjects[collision.index2];

      if (obj1 && obj2) {
        config.setObjects(prev =>
          prev.map(obj => (obj.id === obj1.id || obj.id === obj2.id ? { ...obj, colliding: true } : obj))
        );
      }
    });
  };

  return {
    updateCollisionStates,
  };
}
