/**
 * Canvas Setup Utilities for BoundingBoxEditor
 *
 * Handles canvas initialization, configuration, and cleanup
 */
import { boundingBoxToDisplayCoords } from "./coordinateTransform";
import * as fabric from "fabric";
export function createCanvas(canvasElement, config) {
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
export function addBoundingBoxesToCanvas(canvas, boundingBoxes, config) {
    // Clear existing objects
    canvas.clear();
    // Add each bounding box as a fabric rectangle
    boundingBoxes.forEach((box) => {
        const displayCoords = boundingBoxToDisplayCoords(box, config.imageInfo, config.containerWidth, config.containerHeight);
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
export function cleanupCanvas(canvas) {
    canvas.dispose();
}
