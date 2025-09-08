/**
 * Object Event Handlers for Canvas
 * 
 * Handles object selection, modification, and keyboard events
 */

import type { BoundingBox } from '../types';
import type { CanvasEventHandlersConfig } from './canvasEventHandlers';
import * as fabric from 'fabric';

export function setupObjectHandlers(
  canvas: fabric.Canvas,
  config: CanvasEventHandlersConfig
) {
  // Object selection
  canvas.on('selection:created', (event) => {
    const activeObject = event.selected?.[0];
    if (activeObject && (activeObject as any).data?.boxId) {
      const boxId = (activeObject as any).data.boxId;
      config.boundingBoxes.selectBox(boxId);
      config.eventHandlers.onAnnotationSelect?.(boxId);
    }
  });

  // Object modification
  canvas.on('object:modified', (event) => {
    const object = event.target;
    if (object && (object as any).data?.boxId) {
      const boxId = (object as any).data.boxId;
      const box = object as fabric.Rect;
      
      const imageCoords = config.displayToImageCoords(box.left!, box.top!);
      const updates: Partial<BoundingBox> = {
        x: imageCoords.x,
        y: imageCoords.y,
        width: (box.width! * box.scaleX!) / (config.config.scale || 1),
        height: (box.height! * box.scaleY!) / (config.config.scale || 1),
      };

      config.boundingBoxes.updateBox(boxId, updates);
      config.eventHandlers.onAnnotationUpdate?.(boxId, updates);
    }
  });

  // Keyboard shortcuts
  canvas.on('key:down', (event) => {
    if (event.e.key === 'Delete' || event.e.key === 'Backspace') {
      const activeObjects = canvas.getActiveObjects();
      activeObjects.forEach((obj) => {
        if ((obj as any).data?.boxId) {
          const boxId = (obj as any).data.boxId;
          config.boundingBoxes.removeBox?.(boxId);
          config.eventHandlers.onAnnotationDelete?.(boxId);
          canvas.remove(obj);
        }
      });
      canvas.discardActiveObject();
    }
  });
}
