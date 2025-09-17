/**
 * Info Panel Component
 *
 * Displays metadata about the current visualization state
 */
import { Component } from "solid-js";
interface InfoPanelProps {
    searchQuery: string;
    searchResultsCount: number;
    reductionMethod: "tsne" | "umap" | "pca";
    pointsCount: number;
}
export declare const InfoPanel: Component<InfoPanelProps>;
export {};
