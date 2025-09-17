/**
 * Segmentation Editor Composable
 *
 * Core composable for managing segmentation editor state and operations.
 * Integrates with the Reynard annotation system and provides comprehensive
 * state management for polygon segmentation workflows.
 */
import { type Polygon } from "reynard-algorithms";
import { SegmentationData, SegmentationEditorConfig, SegmentationEditorState } from "../types/index.js";
export interface UseSegmentationEditorOptions {
    config: SegmentationEditorConfig;
    state: SegmentationEditorState;
    onStateChange?: (state: SegmentationEditorState) => void;
    onSegmentationCreate?: (segmentation: SegmentationData) => void;
    onSegmentationUpdate?: (segmentation: SegmentationData) => void;
    onSegmentationDelete?: (segmentationId: string) => void;
}
export interface UseSegmentationEditorReturn {
    state: () => SegmentationEditorState;
    updateState: (updates: Partial<SegmentationEditorState>) => void;
    segmentations: () => SegmentationData[];
    createSegmentation: (segmentation: SegmentationData) => void;
    updateSegmentation: (segmentation: SegmentationData) => void;
    deleteSegmentation: (segmentationId: string) => void;
    selectSegmentation: (segmentationId: string | undefined) => void;
    startCreating: () => void;
    stopCreating: () => void;
    startEditing: (segmentationId: string) => void;
    stopEditing: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    validateSegmentation: (segmentation: SegmentationData) => boolean;
    validatePolygon: (polygon: Polygon) => boolean;
    getSegmentation: (id: string) => SegmentationData | undefined;
    getSelectedSegmentation: () => SegmentationData | undefined;
    clearAll: () => void;
    cleanup: () => void;
}
/**
 * Segmentation editor composable with comprehensive state management
 */
export declare function useSegmentationEditor(options: UseSegmentationEditorOptions): UseSegmentationEditorReturn;
