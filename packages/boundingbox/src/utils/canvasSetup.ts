/**
 * Canvas Setup Utilities for BoundingBoxEditor
 *
 * Handles canvas initialization, configuration, and cleanup
 */

import type { BoundingBox, EditorConfig } from "../types";
import { boundingBoxToDisplayCoords } from "./coordinateTransform";
import * as fabric from "fabric";

export interface CanvasSetupConfig {
  containerWidth: number;
  containerHeight: number;
  imageInfo: {
    width: number;
    height: number;
  };
  config: EditorConfig;
  boundingBoxes: BoundingBox[];
  // Additional properties for canvas configuration
  selectionColor?: string;
  selectionBorderColor?: string;
  selectionLineWidth?: number;
  boxStrokeColor?: string;
  boxStrokeWidth?: number;
  showLabels?: boolean;
  labelFontSize?: number;
  labelColor?: string;
  scale?: number;
}

export function createCanvas(canvasElement: HTMLCanvasElement, config: CanvasSetupConfig): fabric.Canvas {
  const canvas = new fabric.Canvas(canvasElement, {
    width: config.containerWidth,
    height: config.containerHeight,
    backgroundColor: "transparent",
    selection: true,
    preserveObjectStacking: true,
  });

  // Configure canvas settings
  canvas.selectionColor = config.selectionColor || "rgba(100, 100, 255, 0.3)";
  canvas.selectionBorderColor = config.selectionBorderColor || "#6464ff";
  canvas.selectionLineWidth = config.selectionLineWidth || 2;

  return canvas;
}

export function addBoundingBoxesToCanvas(
  canvas: fabric.Canvas,
  boundingBoxes: BoundingBox[],
  config: CanvasSetupConfig
) {
  // Clear existing objects
  canvas.clear();

  // Add each bounding box as a fabric rectangle
  boundingBoxes.forEach(box => {
    const displayCoords = boundingBoxToDisplayCoords(
      box,
      config.imageInfo,
      config.containerWidth,
      config.containerHeight
    );

    const rect = new fabric.Rect({
      left: displayCoords.x,
      top: displayCoords.y,
      width: displayCoords.width,
      height: displayCoords.height,
      fill: "transparent",
      stroke: config.boxStrokeColor || "#ff0000",
      strokeWidth: config.boxStrokeWidth || 2,
      selectable: true,
      evented: true,
      data: { boxId: box.id },
    });

    // Add label text if enabled
    if (config.showLabels && box.label) {
      const label = new fabric.Text(box.label, {
        left: displayCoords.x,
        top: displayCoords.y - 20,
        fontSize: config.labelFontSize || 12,
        fill: config.labelColor || "#000000",
        selectable: false,
        evented: false,
      });
      canvas.add(label);
    }

    canvas.add(rect);
  });

  canvas.renderAll();
}

export function cleanupCanvas(canvas: fabric.Canvas) {
  canvas.dispose();
}
