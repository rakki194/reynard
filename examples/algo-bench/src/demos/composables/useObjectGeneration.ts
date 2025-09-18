import { createSignal } from "solid-js";
import { type AABB } from "reynard-algorithms";

/**
 * Composable for generating and managing AABB objects for spatial optimization demos
 * Handles random object generation with configurable parameters
 */
export function useObjectGeneration() {
  const [objects, setObjects] = createSignal<AABB[]>([]);

  const generateObjects = (count: number): AABB[] => {
    const newObjects: AABB[] = [];
    for (let i = 0; i < count; i++) {
      newObjects.push({
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 50,
        width: 20 + Math.random() * 30,
        height: 20 + Math.random() * 30,
      });
    }
    setObjects(newObjects);
    return newObjects;
  };

  const regenerateObjects = (count: number) => {
    return generateObjects(count);
  };

  const getObjects = () => objects();

  return {
    objects,
    generateObjects,
    regenerateObjects,
    getObjects,
  };
}
