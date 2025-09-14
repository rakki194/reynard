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

export const InfoPanel: Component<InfoPanelProps> = (props) => {
  return (
    <div class="rag-3d-info">
      <div class="info-item">
        <strong>Search Query:</strong> {props.searchQuery}
      </div>
      <div class="info-item">
        <strong>Results:</strong> {props.searchResultsCount} items
      </div>
      <div class="info-item">
        <strong>Method:</strong> {props.reductionMethod.toUpperCase()}
      </div>
      <div class="info-item">
        <strong>Points:</strong> {props.pointsCount}
      </div>
    </div>
  );
};
