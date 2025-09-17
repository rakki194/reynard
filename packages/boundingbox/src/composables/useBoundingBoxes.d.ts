/**
 * useBoundingBoxes composable
 *
 * Manages a collection of bounding boxes with reactive state and manipulation functions.
 * This is the core state management for bounding box annotations.
 */
import type { BoundingBox, ImageInfo } from "../types";
export interface UseBoundingBoxesOptions {
    initialBoxes?: BoundingBox[];
    imageInfo?: ImageInfo;
    enableValidation?: boolean;
}
export interface UseBoundingBoxesReturn {
    boxes: () => BoundingBox[];
    setBoxes: (boxes: BoundingBox[]) => void;
    addBox: (box: BoundingBox) => boolean;
    updateBox: (id: string, updates: Partial<BoundingBox>) => boolean;
    removeBox: (id: string) => boolean;
    selectBox: (id: string | null) => void;
    selectedBoxId: () => string | null;
    clearBoxes: () => void;
    getBox: (id: string) => BoundingBox | undefined;
    hasBox: (id: string) => boolean;
    boxCount: () => number;
    selectedBox: () => BoundingBox | undefined;
    validationErrors: () => Record<string, string[]>;
}
export declare function useBoundingBoxes(options?: UseBoundingBoxesOptions): UseBoundingBoxesReturn;
