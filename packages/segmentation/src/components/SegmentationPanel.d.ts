/**
 * Segmentation Panel Component
 *
 * Comprehensive panel for managing segmentations with list view, search,
 * sorting, and controls. Integrates with TagBubble components for enhanced
 * user experience and follows Reynard design patterns.
 */
import { Component } from "solid-js";
import { SegmentationData } from "../types/index.js";
import "./SegmentationPanel.css";
export interface SegmentationPanelProps {
    /** Segmentations to display */
    segmentations: SegmentationData[];
    /** Selected segmentation ID */
    selectedSegmentation?: string;
    /** Segmentation selection handler */
    onSegmentationSelect?: (segmentationId: string) => void;
    /** Segmentation creation handler */
    onSegmentationCreate?: () => void;
    /** Segmentation deletion handler */
    onSegmentationDelete?: (segmentationId: string) => void;
    /** Additional CSS class */
    class?: string;
}
/**
 * Segmentation Panel Component with comprehensive management capabilities
 */
export declare const SegmentationPanel: Component<SegmentationPanelProps>;
