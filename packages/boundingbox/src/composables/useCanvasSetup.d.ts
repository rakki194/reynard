/**
 * Canvas Setup Composable
 *
 * Handles canvas initialization and lifecycle management
 */
import type { BoundingBox, ImageInfo, EditorConfig } from "../types";
import type { Setter } from "solid-js";
import * as fabric from "fabric";
export interface CanvasSetupConfig {
    containerWidth: number;
    containerHeight: number;
    imageInfo: ImageInfo;
    config: EditorConfig;
    boundingBoxes: BoundingBox[];
    eventHandlers: any;
    selectedLabelClass: () => string;
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
    boundingBoxActions: {
        selectBox: (id: string) => void;
        addBox: (box: BoundingBox) => void;
        updateBox: (id: string, updates: Partial<BoundingBox>) => void;
        removeBox: (id: string) => void;
        getBox: (id: string) => BoundingBox | undefined;
    };
}
export declare const useCanvasSetup: (config: CanvasSetupConfig) => {
    canvasRef: Setter<HTMLCanvasElement | undefined>;
    fabricCanvas: fabric.Canvas | undefined;
};
