/**
 * Canvas Event Handlers for BoundingBoxEditor
 *
 * Orchestrates all canvas interaction events by delegating to specialized handlers:
 * - Mouse events handled by mouseHandlers
 * - Object events handled by objectHandlers
 */
import type { BoundingBox, EditorConfig, AnnotationEventHandlers } from "../types";
import type { Setter, Accessor } from "solid-js";
import * as fabric from "fabric";
export interface CanvasEventHandlersConfig {
    config: EditorConfig;
    eventHandlers: AnnotationEventHandlers;
    scale?: number;
    boundingBoxes: {
        selectBox: (id: string) => void;
        addBox: (box: BoundingBox) => void;
        updateBox: (id: string, updates: Partial<BoundingBox>) => void;
        removeBox: (id: string) => void;
        getBox: (id: string) => BoundingBox | undefined;
    };
    isDrawing: Accessor<boolean>;
    setIsDrawing: Setter<boolean>;
    newBox: Accessor<Partial<BoundingBox> | null>;
    setNewBox: Setter<Partial<BoundingBox> | null>;
    startPoint: Accessor<{
        x: number;
        y: number;
    } | null>;
    setStartPoint: Setter<{
        x: number;
        y: number;
    } | null>;
    selectedLabelClass: Accessor<string>;
    displayToImageCoords: (x: number, y: number) => {
        x: number;
        y: number;
    };
    clampBoundingBoxToImage: (box: BoundingBox) => BoundingBox;
}
export declare function setupCanvasEventHandlers(canvas: fabric.Canvas, config: CanvasEventHandlersConfig): void;
