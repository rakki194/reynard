/**
 * Canvas Interaction Composable
 *
 * Handles mouse and touch interactions for the segmentation canvas.
 * Leverages patterns from reynard-3d for robust event handling.
 */
import { type Point } from "reynard-algorithms";
import { SegmentationEditorConfig, SegmentationEditorState } from "../types/index.js";
export interface UseCanvasInteractionOptions {
    canvas: () => HTMLCanvasElement | undefined;
    config: SegmentationEditorConfig;
    state: SegmentationEditorState;
    onMouseMove?: (position: Point) => void;
    onZoomChange?: (zoom: number) => void;
    onPanChange?: (offset: Point) => void;
    onPolygonComplete?: (polygon: Point[]) => void;
    onPolygonUpdate?: (polygon: Point[], segmentationId?: string) => void;
}
export interface UseCanvasInteractionReturn {
    handleMouseMove: (event: MouseEvent) => void;
    handleWheel: (event: WheelEvent) => void;
    handleMouseDown: (event: MouseEvent) => void;
    handleMouseUp: (event: MouseEvent) => void;
    handleDoubleClick: (event: MouseEvent) => void;
    handleTouchStart: (event: TouchEvent) => void;
    handleTouchMove: (event: TouchEvent) => void;
    handleTouchEnd: (event: TouchEvent) => void;
}
/**
 * Canvas interaction composable with robust event handling
 */
export declare function useCanvasInteraction(options: UseCanvasInteractionOptions): UseCanvasInteractionReturn;
