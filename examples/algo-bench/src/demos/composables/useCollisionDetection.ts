import { createSignal, type Accessor } from "solid-js";
import { batchCollisionDetection, type AABB } from "reynard-algorithms";
import type { PhysicsObject, CollisionData, DemoStats } from "../types";

/**
 * Composable for collision detection and statistics
 */
export function useCollisionDetection(objects: Accessor<PhysicsObject[]>) {
  const [collisions, setCollisions] = createSignal<CollisionData[]>([]);
  const [stats, setStats] = createSignal<DemoStats>({
    collisionChecks: 0,
    actualCollisions: 0,
    fps: 0,
    lastFrameTime: 0,
  });

  /**
   * Check for collisions between all objects
   */
  const checkCollisions = () => {
    const currentObjects = objects();
    const aabbs: AABB[] = currentObjects.map(obj => ({
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height,
    }));

    const startTime = performance.now();
    const collisionResults = batchCollisionDetection(aabbs, {
      spatialHash: {
        enableOptimization: true,
        cellSize: 50,
        maxObjectsPerCell: 10,
      },
    });
    const endTime = performance.now();

    setCollisions(collisionResults);

    // Update stats
    setStats(prev => ({
      ...prev,
      collisionChecks: (aabbs.length * (aabbs.length - 1)) / 2,
      actualCollisions: collisionResults.length,
      lastFrameTime: endTime - startTime,
    }));

    return collisionResults;
  };

  /**
   * Update FPS statistics
   */
  const updateFPS = (fps: number) => {
    setStats(prev => ({ ...prev, fps }));
  };

  return {
    collisions,
    stats,
    checkCollisions,
    updateFPS,
  };
}
