import { createSignal, type Accessor, type Setter } from "solid-js";
import { batchCollisionDetection, type AABB } from "reynard-algorithms";
import type { PhysicsObject, CollisionData, DemoStats } from "../types";

/**
 * Physics engine composable for managing physics objects and collision detection
 */
export function usePhysicsEngine(objectCount: Accessor<number>) {
  const [objects, setObjects] = createSignal<PhysicsObject[]>([]);
  const [collisions, setCollisions] = createSignal<CollisionData[]>([]);
  const [stats, setStats] = createSignal<DemoStats>({
    collisionChecks: 0,
    actualCollisions: 0,
    fps: 0,
    lastFrameTime: 0,
  });

  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"];

  /**
   * Initialize physics objects with random positions and velocities
   */
  const initializeObjects = () => {
    const newObjects: PhysicsObject[] = [];

    for (let i = 0; i < objectCount(); i++) {
      newObjects.push({
        id: i,
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 50,
        width: 20 + Math.random() * 30,
        height: 20 + Math.random() * 30,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: colors[i % colors.length],
        colliding: false,
      });
    }
    setObjects(newObjects);
  };

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
      },
    });
    const endTime = performance.now();

    // Update collision state
    setObjects(prev => prev.map(obj => ({ ...obj, colliding: false })));

    collisionResults.forEach(collision => {
      setObjects(prev =>
        prev.map((obj, index) =>
          index === collision.index1 || index === collision.index2 ? { ...obj, colliding: true } : obj
        )
      );
    });

    setCollisions(collisionResults);

    // Update stats
    setStats(prev => ({
      ...prev,
      collisionChecks: (aabbs.length * (aabbs.length - 1)) / 2,
      actualCollisions: collisionResults.length,
      lastFrameTime: endTime - startTime,
    }));
  };

  /**
   * Add a new object at the specified position
   */
  const addObject = (x: number, y: number) => {
    const newObject: PhysicsObject = {
      id: Date.now(),
      x: x - 15,
      y: y - 15,
      width: 30,
      height: 30,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      colliding: false,
    };

    setObjects(prev => [...prev, newObject]);
  };

  /**
   * Update FPS statistics
   */
  const updateFPS = (fps: number) => {
    setStats(prev => ({ ...prev, fps }));
  };

  return {
    objects,
    collisions,
    stats,
    initializeObjects,
    updatePhysics,
    checkCollisions,
    addObject,
    updateFPS,
  };
}
