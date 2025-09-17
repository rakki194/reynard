/**
 * Drawing State Composable
 *
 * Manages drawing state for new bounding boxes
 */
import type { BoundingBox } from "../types";
import type { Setter } from "solid-js";
export interface DrawingState {
    isDrawing: () => boolean;
    setIsDrawing: Setter<boolean>;
    newBox: () => Partial<BoundingBox> | null;
    setNewBox: Setter<Partial<BoundingBox> | null>;
    startPoint: () => {
        x: number;
        y: number;
    } | null;
    setStartPoint: Setter<{
        x: number;
        y: number;
    } | null>;
}
export declare const useDrawingState: () => DrawingState;
