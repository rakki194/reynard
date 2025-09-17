/**
 * Embedding Visualization Dashboard
 *
 * Comprehensive dashboard for embedding analysis and visualization.
 * Integrates all embedding visualization components with real-time data.
 */
import { Component } from "solid-js";
export interface EmbeddingVisualizationDashboardProps {
    /** Whether the dashboard is visible */
    isVisible?: boolean;
    /** Width of the dashboard */
    width?: number;
    /** Height of the dashboard */
    height?: number;
    /** Whether to show loading states */
    showLoading?: boolean;
    /** Theme for the dashboard */
    theme?: string;
    /** Custom class name */
    class?: string;
}
export declare const EmbeddingVisualizationDashboard: Component<EmbeddingVisualizationDashboardProps>;
