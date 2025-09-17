/**
 * Segmentation Editor Component
 *
 * Advanced polygon segmentation editor that integrates with the Reynard
 * floating panel system and provides comprehensive segmentation editing
 * capabilities. Features sophisticated UI with floating panels, real-time
 * editing, and seamless integration with the Reynard ecosystem.
 */
import { Component } from "solid-js";
import { SegmentationData, SegmentationEditorConfig, SegmentationEditorEvents, SegmentationEditorState } from "../types/index.js";
import "./SegmentationEditor.css";
export interface SegmentationEditorProps {
    /** Image source for segmentation */
    imageSrc: string;
    /** Initial segmentations */
    segmentations?: SegmentationData[];
    /** Editor configuration */
    config?: Partial<SegmentationEditorConfig>;
    /** Editor state */
    state?: SegmentationEditorState;
    /** Event handlers */
    events?: SegmentationEditorEvents;
    /** Whether the editor is enabled */
    enabled?: boolean;
    /** Additional CSS class */
    class?: string;
}
/**
 * Segmentation Editor Component with sophisticated floating panel integration
 */
export declare const SegmentationEditor: Component<SegmentationEditorProps>;
