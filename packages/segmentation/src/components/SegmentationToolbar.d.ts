/**
 * Segmentation Toolbar Component
 *
 * Comprehensive toolbar for segmentation editor with zoom, pan, and editing controls.
 * Features sophisticated UI patterns inspired by the Reynard caption system.
 */
import { Component } from "solid-js";
import { SegmentationEditorConfig, SegmentationEditorState } from "../types/index.js";
import "./SegmentationToolbar.css";
export interface SegmentationToolbarProps {
    /** Editor configuration */
    config: SegmentationEditorConfig;
    /** Editor state */
    state: SegmentationEditorState;
    /** Toggle editor handler */
    onToggleEditor?: () => void;
    /** Zoom change handler */
    onZoomChange?: (zoom: number) => void;
    /** Pan change handler */
    onPanChange?: (offset: {
        x: number;
        y: number;
    }) => void;
    /** Config change handler */
    onConfigChange?: (config: Partial<SegmentationEditorConfig>) => void;
    /** Additional CSS class */
    class?: string;
}
/**
 * Segmentation Toolbar Component with comprehensive controls
 */
export declare const SegmentationToolbar: Component<SegmentationToolbarProps>;
