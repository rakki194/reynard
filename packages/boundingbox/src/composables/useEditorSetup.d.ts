/**
 * Editor Setup Composable
 *
 * Orchestrates the complete editor setup and configuration
 */
import { useDrawingState } from "./useDrawingState";
import { useLabelManagement } from "./useLabelManagement";
import { useBoundingBoxSetup } from "./useBoundingBoxSetup";
import type { BoundingBox, ImageInfo, EditorConfig, AnnotationEventHandlers } from "../types";
export interface EditorSetupConfig {
    imageInfo: ImageInfo;
    config: EditorConfig;
    eventHandlers: AnnotationEventHandlers;
    initialBoxes: BoundingBox[];
    containerWidth: number;
    containerHeight: number;
}
export interface EditorSetup {
    drawingState: ReturnType<typeof useDrawingState>;
    labelManagement: ReturnType<typeof useLabelManagement>;
    boundingBoxSetup: ReturnType<typeof useBoundingBoxSetup>;
    canvasRef: (element: HTMLCanvasElement) => void;
    handleClearAll: () => void;
}
export declare const useEditorSetup: (setupConfig: EditorSetupConfig) => EditorSetup;
