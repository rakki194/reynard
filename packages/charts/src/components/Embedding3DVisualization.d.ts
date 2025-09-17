/**
 * 3D Embedding Visualization Component
 *
 * Interactive 3D visualization of embeddings using Three.js.
 * Integrates with existing Reynard 3D package for advanced visualization.
 */
import { Component } from "solid-js";
import { EmbeddingReductionResponse } from "../composables/useEmbeddingVisualization";
export interface Embedding3DVisualizationProps {
    /** Width of the visualization */
    width?: number;
    /** Height of the visualization */
    height?: number;
    /** Embedding reduction result data */
    data?: EmbeddingReductionResponse;
    /** Whether to show loading state */
    loading?: boolean;
    /** Point size for the visualization */
    pointSize?: number;
    /** Whether to enable highlighting */
    enableHighlighting?: boolean;
    /** Whether to show similarity paths */
    showSimilarityPaths?: boolean;
    /** Similarity threshold for highlighting */
    similarityThreshold?: number;
    /** Theme for the visualization */
    theme?: string;
    /** Custom class name */
    class?: string;
    /** Callback when point is clicked */
    onPointClick?: (pointIndex: number, data: any) => void;
    /** Callback when point is hovered */
    onPointHover?: (pointIndex: number, data: any) => void;
}
export declare const Embedding3DVisualization: Component<Embedding3DVisualizationProps>;
