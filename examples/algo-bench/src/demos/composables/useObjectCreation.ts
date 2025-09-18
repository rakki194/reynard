import type { PhysicsObject } from "../types";

/**
 * Object creation composable
 * Handles creation of new physics objects
 */
export function useObjectCreation(setObjects: (updater: (prev: PhysicsObject[]) => PhysicsObject[]) => void) {
  const createObjectAtPosition = (x: number, y: number) => {
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"];
    const newObject: PhysicsObject = {
      id: Date.now(),
      x: x - 15,
      y: y - 15,
      width: 30,
      height: 30,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      mass: 1 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      colliding: false,
      isStatic: false,
    };

    setObjects(prev => [...prev, newObject]);
  };

  return {
    createObjectAtPosition,
  };
}
