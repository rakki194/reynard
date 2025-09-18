import { type Accessor } from "solid-js";
import type { PhysicsObject } from "../types";
import type { CollisionResult } from "reynard-algorithms";
import { drawPhysicsObjects, drawCollisionLines, drawMouseCursor, type MousePosition } from "./physicsDrawingUtils";

/**
 * Canvas rendering composable for physics demos
 * Handles all canvas drawing operations and visual effects
 */
export function useCanvasRenderer(
  canvasRef: Accessor<HTMLCanvasElement | undefined>,
  objects: Accessor<PhysicsObject[]>,
  collisions: Accessor<Array<{ index1: number; index2: number; result: CollisionResult }>>,
  mousePos: Accessor<MousePosition>
) {
  // Render a single frame to the canvas
  const render = () => {
    const canvas = canvasRef();
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw objects
    drawPhysicsObjects(ctx, objects());

    // Draw collision lines
    drawCollisionLines(ctx, objects(), collisions());

    // Draw mouse cursor
    drawMouseCursor(ctx, mousePos());
  };

  return {
    render,
  };
}
