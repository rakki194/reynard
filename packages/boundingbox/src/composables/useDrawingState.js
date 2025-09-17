/**
 * Drawing State Composable
 *
 * Manages drawing state for new bounding boxes
 */
import { createSignal } from "solid-js";
export const useDrawingState = () => {
    const [isDrawing, setIsDrawing] = createSignal(false);
    const [newBox, setNewBox] = createSignal(null);
    const [startPoint, setStartPoint] = createSignal(null);
    return {
        isDrawing,
        setIsDrawing,
        newBox,
        setNewBox,
        startPoint,
        setStartPoint,
    };
};
