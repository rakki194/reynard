/**
 * Mouse Event Handlers for Canvas
 *
 * Handles mouse down, move, and up events for drawing and selection
 */

import type { BoundingBox } from "../types";
import type { CanvasEventHandlersConfig } from "./canvasEventHandlers";
import * as fabric from "fabric";

export function setupMouseHandlers(
  canvas: fabric.Canvas,
  config: CanvasEventHandlersConfig,
) {
  // Mouse down - start drawing or select box
  canvas.on("mouse:down", (event) => {
    if (!config.config.enableCreation) return;

    const pointer = canvas.getPointer(event.e);
    const startX = pointer.x;
    const startY = pointer.y;

    // Check if clicking on existing box
    const clickedObject = canvas.findTarget(event.e);
    if (clickedObject && (clickedObject as any).data?.boxId) {
      const boxId = (clickedObject as any).data.boxId;
      config.boundingBoxes.selectBox(boxId);
      config.eventHandlers.onAnnotationSelect?.(boxId);
      return;
    }

    // Start drawing new box
    config.setIsDrawing(true);
    config.setStartPoint({ x: startX, y: startY });
    config.setNewBox({
      id: `box-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: config.selectedLabelClass(),
      x: startX,
      y: startY,
      width: 0,
      height: 0,
    });
  });

  // Mouse move - update drawing box
  canvas.on("mouse:move", (event) => {
    if (!config.isDrawing() || !config.newBox() || !config.startPoint()) return;

    const pointer = canvas.getPointer(event.e);
    const start = config.startPoint()!;
    const newBox = config.newBox()!;

    const width = pointer.x - start.x;
    const height = pointer.y - start.y;

    config.setNewBox({
      ...newBox,
      width: Math.abs(width),
      height: Math.abs(height),
      x: width < 0 ? pointer.x : start.x,
      y: height < 0 ? pointer.y : start.y,
    });
  });

  // Mouse up - finish drawing
  canvas.on("mouse:up", () => {
    if (!config.isDrawing() || !config.newBox()) return;

    const newBox = config.newBox()!;
    if (newBox.width! > 5 && newBox.height! > 5) {
      // Convert to image coordinates
      const imageCoords = config.displayToImageCoords(newBox.x!, newBox.y!);
      const imageBox: BoundingBox = {
        id: newBox.id!,
        label: newBox.label!,
        x: imageCoords.x,
        y: imageCoords.y,
        width: newBox.width! / (config.scale || 1),
        height: newBox.height! / (config.scale || 1),
      };

      const clampedBox = config.clampBoundingBoxToImage(imageBox);
      config.boundingBoxes.addBox(clampedBox);
      config.eventHandlers.onAnnotationCreate?.(clampedBox);
    }

    config.setIsDrawing(false);
    config.setNewBox(null);
    config.setStartPoint(null);
  });
}
