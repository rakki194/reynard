import { createSignal, type Accessor } from "solid-js";
import type { PhysicsObject } from "../types";

const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"];

/**
 * Create a physics object with random properties
 */
function createPhysicsObject(id: number, x: number, y: number, width: number, height: number): PhysicsObject {
  return {
    id,
    x,
    y,
    width,
    height,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    mass: 1 + Math.random() * 2,
    color: colors[id % colors.length],
    colliding: false,
    isStatic: false,
  };
}

/**
 * Composable for managing physics objects initialization and state
 */
export function usePhysicsObjects(objectCount: Accessor<number>) {
  const [objects, setObjects] = createSignal<PhysicsObject[]>([]);

  const initializeObjects = () => {
    const newObjects: PhysicsObject[] = [];
    for (let i = 0; i < objectCount(); i++) {
      newObjects.push(
        createPhysicsObject(
          i,
          Math.random() * 700 + 50,
          Math.random() * 400 + 50,
          20 + Math.random() * 30,
          20 + Math.random() * 30
        )
      );
    }
    setObjects(newObjects);
  };

  const addObject = (x: number, y: number) => {
    const newObject = createPhysicsObject(Date.now(), x - 15, y - 15, 30, 30);
    setObjects(prev => [...prev, newObject]);
  };

  const updateCollisionState = (collisionIndices: number[]) => {
    setObjects(prev =>
      prev.map((obj, index) =>
        collisionIndices.includes(index) ? { ...obj, colliding: true } : { ...obj, colliding: false }
      )
    );
  };

  return {
    objects,
    setObjects,
    initializeObjects,
    addObject,
    updateCollisionState,
  };
}
