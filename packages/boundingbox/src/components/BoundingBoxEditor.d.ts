/**
 * BoundingBoxEditor Component
 *
 * Main component for editing bounding box annotations on images.
 * Provides a complete interface for creating, editing, and managing bounding boxes.
 */
import type { BoundingBox, ImageInfo, EditorConfig, AnnotationEventHandlers } from "../types";
export interface BoundingBoxEditorProps {
    imageInfo: ImageInfo;
    config: EditorConfig;
    eventHandlers?: AnnotationEventHandlers;
    initialBoxes?: BoundingBox[];
    className?: string;
    containerWidth?: number;
    containerHeight?: number;
}
export declare function BoundingBoxEditor(props: BoundingBoxEditorProps): any;
