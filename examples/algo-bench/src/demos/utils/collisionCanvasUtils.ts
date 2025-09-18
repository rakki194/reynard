import type { PhysicsObject, CollisionData } from "../types";

/**
 * Canvas rendering utilities for collision detection visualization
 */

/**
 * Clear the canvas with dark background
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw a physics object with collision highlighting
 */
export function drawPhysicsObject(ctx: CanvasRenderingContext2D, obj: PhysicsObject): void {
  // Draw object body
  ctx.fillStyle = obj.colliding ? "#ff4757" : obj.color;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

  // Draw border
  ctx.strokeStyle = obj.colliding ? "#ffffff" : "#333333";
  ctx.lineWidth = 2;
  ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
}

/**
 * Draw collision connection line between two objects
 */
export function drawCollisionLine(ctx: CanvasRenderingContext2D, obj1: PhysicsObject, obj2: PhysicsObject): void {
  ctx.beginPath();
  ctx.moveTo(obj1.x + obj1.width / 2, obj1.y + obj1.height / 2);
  ctx.lineTo(obj2.x + obj2.width / 2, obj2.y + obj2.height / 2);
  ctx.stroke();
}

/**
 * Draw mouse cursor indicator
 */
export function drawMouseCursor(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Render complete collision scene to canvas
 */
export function renderCollisionScene(
  ctx: CanvasRenderingContext2D,
  objects: PhysicsObject[],
  collisions: CollisionData[],
  mousePos: { x: number; y: number }
): void {
  // Clear canvas
  clearCanvas(ctx, ctx.canvas.width, ctx.canvas.height);

  // Draw all objects
  objects.forEach(obj => drawPhysicsObject(ctx, obj));

  // Draw collision lines
  ctx.strokeStyle = "#ff4757";
  ctx.lineWidth = 2;
  collisions.forEach(collision => {
    const obj1 = objects[collision.index1];
    const obj2 = objects[collision.index2];
    if (obj1 && obj2) {
      drawCollisionLine(ctx, obj1, obj2);
    }
  });

  // Draw mouse cursor
  drawMouseCursor(ctx, mousePos.x, mousePos.y);
}
