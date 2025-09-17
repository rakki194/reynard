/**
 * Editor Info Panel Component
 *
 * Displays bounding box information and statistics
 */
import type { Component } from "solid-js";
import type { BoundingBox, EditorConfig } from "../types";
export interface EditorInfoPanelProps {
    boundingBoxes: BoundingBox[];
    selectedBoxId: string | null;
    selectedBox: BoundingBox | null;
    onBoxSelect: (boxId: string | null) => void;
    onBoxDelete: (boxId: string) => void;
    onEditingStart: (boxId: string, operation: string) => void;
    onEditingEnd: (boxId: string, operation: string) => void;
    onEditingCancel: (boxId: string) => void;
    config: EditorConfig;
    className?: string;
}
export declare const EditorInfoPanel: Component<EditorInfoPanelProps>;
