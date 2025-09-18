import { createSignal, type Accessor } from "solid-js";
import type { PhysicsObject } from "../types";

/**
 * Object dragging composable
 * Handles drag state and object manipulation during drag operations
 */
export function useObjectDragging(
  objects: Accessor<PhysicsObject[]>,
  setObjects: (updater: (prev: PhysicsObject[]) => PhysicsObject[]) => void
) {
  const [isDragging, setIsDragging] = createSignal(false);
  const [draggedObject, setDraggedObject] = createSignal<number | null>(null);

  const startDragging = (objectId: number) => {
    setIsDragging(true);
    setDraggedObject(objectId);
  };

  const stopDragging = () => {
    setIsDragging(false);
    setDraggedObject(null);
  };

  const updateDraggedObject = (x: number, y: number) => {
    if (!isDragging() || draggedObject() === null) return;

    const objId = draggedObject()!;
    setObjects(prev =>
      prev.map(obj =>
        obj.id === objId && !obj.isStatic
          ? {
              ...obj,
              x: x - obj.width / 2,
              y: y - obj.height / 2,
              vx: 0,
              vy: 0,
            }
          : obj
      )
    );
  };

  const findObjectAtPosition = (x: number, y: number): PhysicsObject | undefined => {
    return objects().find(
      obj => x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height && !obj.isStatic
    );
  };

  return {
    isDragging,
    draggedObject,
    startDragging,
    stopDragging,
    updateDraggedObject,
    findObjectAtPosition,
  };
}
