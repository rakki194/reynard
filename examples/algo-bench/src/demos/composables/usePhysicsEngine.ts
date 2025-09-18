import type { Accessor } from "solid-js";
import { usePhysicsObjects } from "./usePhysicsObjects";
import { useCollisionDetection } from "./useCollisionDetection";
import { usePhysicsSimulation } from "./usePhysicsSimulation";

/**
 * Physics engine composable that orchestrates physics objects, collision detection, and simulation
 */
export function usePhysicsEngine(objectCount: Accessor<number>) {
  // Initialize focused composables
  const physicsObjects = usePhysicsObjects(objectCount);
  const collisionDetection = useCollisionDetection(physicsObjects.objects);
  const physicsSimulation = usePhysicsSimulation(physicsObjects.setObjects);

  /**
   * Check for collisions and update object states
   */
  const checkCollisions = () => {
    const collisionResults = collisionDetection.checkCollisions();

    // Update collision state for objects
    const collisionIndices = collisionResults.flatMap(collision => [collision.index1, collision.index2]);
    physicsObjects.updateCollisionState(collisionIndices);
  };

  return {
    objects: physicsObjects.objects,
    collisions: collisionDetection.collisions,
    stats: collisionDetection.stats,
    initializeObjects: physicsObjects.initializeObjects,
    updatePhysics: physicsSimulation.updatePhysics,
    checkCollisions,
    addObject: physicsObjects.addObject,
    updateFPS: collisionDetection.updateFPS,
  };
}
