/**
 * Canvas Setup Utilities for BoundingBoxEditor
 *
 * Handles canvas initialization, configuration, and cleanup
 */
import type { BoundingBox, EditorConfig } from "../types";
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
export declare function createCanvas(canvasElement: HTMLCanvasElement, config: CanvasSetupConfig): fabric.Canvas;
export declare function addBoundingBoxesToCanvas(canvas: fabric.Canvas, boundingBoxes: BoundingBox[], config: CanvasSetupConfig): void;
export declare function cleanupCanvas(canvas: fabric.Canvas): void;
