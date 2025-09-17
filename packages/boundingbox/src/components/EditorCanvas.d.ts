/**
 * Editor Canvas Component
 *
 * Handles canvas rendering and drawing overlay
 */
import type { Component } from "solid-js";
import type { BoundingBox, ImageInfo, EditorConfig } from "../types";
export interface EditorCanvasProps {
    imageInfo: ImageInfo;
    config: EditorConfig;
    containerWidth: number;
    containerHeight: number;
    boundingBoxes: BoundingBox[];
    selectedBoxId: string | null;
    onBoxSelect: (boxId: string | null) => void;
    onBoxCreate: (box: BoundingBox) => void;
    onBoxUpdate: (boxId: string, updates: Partial<BoundingBox>) => void;
    onBoxDelete: (boxId: string) => void;
    onEditingStart: (boxId: string, operation: string) => void;
    onEditingEnd: (boxId: string, operation: string) => void;
    onEditingCancel: (boxId: string) => void;
    className?: string;
}
export declare const EditorCanvas: Component<EditorCanvasProps>;
