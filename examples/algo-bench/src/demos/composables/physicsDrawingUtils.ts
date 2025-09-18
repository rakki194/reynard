import type { PhysicsObject } from "../types";
import type { CollisionResult } from "reynard-algorithms";

export interface MousePosition {
  x: number;
  y: number;
}

/**
 * Utility functions for physics demo canvas drawing
 * Separated to keep individual functions under 50 lines
 */

/**
 * Draw physics objects with collision highlighting and velocity vectors
 */
export function drawPhysicsObjects(ctx: CanvasRenderingContext2D, objects: PhysicsObject[]) {
  objects.forEach(obj => {
    ctx.fillStyle = obj.colliding ? "#ff4757" : obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

    // Draw border
    ctx.strokeStyle = obj.colliding ? "#ffffff" : "#333333";
    ctx.lineWidth = 2;
    ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

    // Draw velocity vector
    if (!obj.isStatic && (Math.abs(obj.vx) > 0.1 || Math.abs(obj.vy) > 0.1)) {
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(obj.x + obj.width / 2, obj.y + obj.height / 2);
      ctx.lineTo(obj.x + obj.width / 2 + obj.vx * 5, obj.y + obj.height / 2 + obj.vy * 5);
      ctx.stroke();
    }
  });
}

/**
 * Draw collision lines between colliding objects
 */
export function drawCollisionLines(
  ctx: CanvasRenderingContext2D,
  objects: PhysicsObject[],
  collisions: Array<{ index1: number; index2: number; result: CollisionResult }>
) {
  ctx.strokeStyle = "#ff4757";
  ctx.lineWidth = 2;
  const dynamicObjects = objects.filter(obj => !obj.isStatic);

  collisions.forEach(collision => {
    const obj1 = dynamicObjects[collision.index1];
    const obj2 = dynamicObjects[collision.index2];
    if (obj1 && obj2) {
      ctx.beginPath();
      ctx.moveTo(obj1.x + obj1.width / 2, obj1.y + obj1.height / 2);
      ctx.lineTo(obj2.x + obj2.width / 2, obj2.y + obj2.height / 2);
      ctx.stroke();
    }
  });
}

/**
 * Draw mouse cursor indicator
 */
export function drawMouseCursor(ctx: CanvasRenderingContext2D, mousePos: MousePosition) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(mousePos.x, mousePos.y, 10, 0, Math.PI * 2);
  ctx.fill();
}
