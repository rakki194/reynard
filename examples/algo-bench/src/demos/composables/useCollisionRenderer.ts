import { createSignal, type Accessor } from "solid-js";
import type { PhysicsObject, CollisionData } from "../types";

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

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw objects
    objects().forEach(obj => {
      ctx.fillStyle = obj.colliding ? "#ff4757" : obj.color;
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

      // Draw border
      ctx.strokeStyle = obj.colliding ? "#ffffff" : "#333333";
      ctx.lineWidth = 2;
      ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
    });

    // Draw collision lines
    ctx.strokeStyle = "#ff4757";
    ctx.lineWidth = 2;
    collisions().forEach(collision => {
      const obj1 = objects()[collision.index1];
      const obj2 = objects()[collision.index2];
      if (obj1 && obj2) {
        ctx.beginPath();
        ctx.moveTo(obj1.x + obj1.width / 2, obj1.y + obj1.height / 2);
        ctx.lineTo(obj2.x + obj2.width / 2, obj2.y + obj2.height / 2);
        ctx.stroke();
      }
    });

    // Draw mouse cursor
    const mouse = mousePos();
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
    ctx.fill();
  };

  /**
   * Handle mouse movement on canvas
   */
  const handleMouseMove = (e: MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  /**
   * Handle mouse click on canvas
   */
  const handleMouseClick = (e: MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onAddObject(x, y);
  };

  return {
    mousePos,
    render,
    handleMouseMove,
    handleMouseClick,
  };
}
