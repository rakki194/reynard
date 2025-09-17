/**
 * Segmentation Canvas Component
 *
 * Interactive canvas for displaying and editing polygon segmentations.
 * Integrates with the Reynard algorithms package for geometric operations
 * and provides comprehensive rendering capabilities with real-time updates.
 */
import { Component } from "solid-js";
import { type Point, type Polygon } from "reynard-algorithms";
import { SegmentationData, SegmentationEditorConfig, SegmentationEditorState } from "../types/index.js";
import "./SegmentationCanvas.css";
export interface SegmentationCanvasProps {
    /** Image source */
    imageSrc: string;
    /** Segmentations to display */
    segmentations: SegmentationData[];
    /** Editor configuration */
    config: SegmentationEditorConfig;
    /** Editor state */
    state: SegmentationEditorState;
    /** Mouse move handler */
    onMouseMove?: (position: Point) => void;
    /** Zoom change handler */
    onZoomChange?: (zoom: number) => void;
    /** Pan change handler */
    onPanChange?: (offset: Point) => void;
    /** Segmentation selection handler */
    onSegmentationSelect?: (segmentationId: string) => void;
    /** Segmentation creation handler */
    onSegmentationCreate?: (polygon: Polygon) => void;
    /** Segmentation update handler */
    onSegmentationUpdate?: (segmentationId: string, polygon: Polygon) => void;
    /** Additional CSS class */
    class?: string;
}
/**
 * Segmentation Canvas Component with comprehensive rendering capabilities
 */
export declare const SegmentationCanvas: Component<SegmentationCanvasProps>;
