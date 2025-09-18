import { type Accessor } from "solid-js";
import type { PhysicsObject } from "../types";
import { useMousePosition, type MousePosition } from "./useMousePosition";
import { useObjectDragging } from "./useObjectDragging";
import { useObjectCreation } from "./useObjectCreation";

/**
 * Mouse interaction composable for physics demos
 * Orchestrates mouse events, dragging, and object creation
 */
export function useMouseInteractions(
  canvasRef: Accessor<HTMLCanvasElement | undefined>,
  objects: Accessor<PhysicsObject[]>,
  setObjects: (updater: (prev: PhysicsObject[]) => PhysicsObject[]) => void
) {
  const { mousePos, updateMousePosition } = useMousePosition(canvasRef);
  const { isDragging, startDragging, stopDragging, updateDraggedObject, findObjectAtPosition } = useObjectDragging(
    objects,
    setObjects
  );
  const { createObjectAtPosition } = useObjectCreation(setObjects);

  const handleMouseMove = (e: MouseEvent) => {
    updateMousePosition(e);
    updateDraggedObject(mousePos().x, mousePos().y);
  };

  const handleMouseDown = (e: MouseEvent) => {
    const canvas = canvasRef();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedObject = findObjectAtPosition(x, y);
    if (clickedObject) {
      startDragging(clickedObject.id);
    }
  };

  const handleMouseUp = () => {
    stopDragging();
  };

  const handleMouseClick = (e: MouseEvent) => {
    if (isDragging()) return;

    const canvas = canvasRef();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    createObjectAtPosition(x, y);
  };

  return {
    mousePos,
    isDragging,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleMouseClick,
  };
}

export type { MousePosition };
