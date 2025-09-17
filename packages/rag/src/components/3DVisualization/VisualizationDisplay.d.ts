/**
 * Visualization Display Component
 *
 * Renders the 3D point cloud visualization and related UI elements
 */
import { Component } from "solid-js";
import type { EmbeddingPoint } from "../../types";
interface VisualizationDisplayProps {
    isLoading: boolean;
    error: string | null;
    embeddingPoints: EmbeddingPoint[];
    reductionMethod: "tsne" | "umap" | "pca";
    searchQuery: string;
    searchResultsCount: number;
    onRetry: () => void;
}
export declare const VisualizationDisplay: Component<VisualizationDisplayProps>;
export {};
