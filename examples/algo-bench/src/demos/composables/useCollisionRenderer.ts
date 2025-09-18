import { createSignal, type Accessor } from "solid-js";
import type { PhysicsObject, CollisionData } from "../types";
import { renderCollisionScene } from "../utils/collisionCanvasUtils";
import { createMouseMoveHandler, createMouseClickHandler } from "../utils/mouseInteractionUtils";

/**
 * Collision renderer composable for canvas rendering and mouse interaction
 */
export function useCollisionRenderer(
  objects: Accessor<PhysicsObject[]>,
  collisions: Accessor<CollisionData[]>,
  onAddObject: (x: number, y: number) => void
) {
  const [mousePos, setMousePos] = createSignal({ x: 0, y: 0 });

  /**
   * Render the physics simulation to canvas
   */
  const render = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    renderCollisionScene(ctx, objects(), collisions(), mousePos());
  };

  /**
   * Handle mouse movement on canvas
   */
  const handleMouseMove = createMouseMoveHandler(setMousePos);

  /**
   * Handle mouse click on canvas
   */
  const handleMouseClick = createMouseClickHandler(onAddObject);

  return {
    mousePos,
    render,
    handleMouseMove,
    handleMouseClick,
  };
}
