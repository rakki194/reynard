/**
 * Embedding Visualization Content Component
 *
 * Handles the main visualization content area with different tabs.
 */
import { Component } from "solid-js";
export interface EmbeddingVisualizationContentProps {
    /** Active tab */
    activeTab: "distribution" | "pca" | "quality" | "3d";
    /** Embedding data */
    embeddingData: any;
    /** PCA data */
    pcaData: any;
    /** Quality data */
    qualityData: any;
    /** Reduction result */
    reductionResult: any;
    /** Dashboard width */
    width?: number;
    /** Dashboard height */
    height?: number;
    /** Theme */
    theme?: string;
    /** Error message */
    error: string;
    /** Loading state */
    isLoading: boolean;
    /** Retry handler */
    onRetry: () => void;
}
export declare const EmbeddingVisualizationContent: Component<EmbeddingVisualizationContentProps>;
