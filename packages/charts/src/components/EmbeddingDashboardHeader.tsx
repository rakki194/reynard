/**
 * Embedding Dashboard Header Component
 *
 * Handles the dashboard header with tab navigation.
 */

import { Component } from "solid-js";

export interface EmbeddingDashboardHeaderProps {
  /** Active tab */
  activeTab: "distribution" | "pca" | "quality" | "3d";
  /** Tab change handler */
  onTabChange: (tab: "distribution" | "pca" | "quality" | "3d") => void;
}

export const EmbeddingDashboardHeader: Component<EmbeddingDashboardHeaderProps> = props => {
  return (
    <div class="dashboard-header">
      <h2>Embedding Visualization Dashboard</h2>
      <div class="dashboard-controls">
        <button
          class={`tab-button ${props.activeTab === "distribution" ? "active" : ""}`}
          onClick={() => props.onTabChange("distribution")}
        >
          Distribution
        </button>
        <button
          class={`tab-button ${props.activeTab === "pca" ? "active" : ""}`}
          onClick={() => props.onTabChange("pca")}
        >
          PCA Analysis
        </button>
        <button
          class={`tab-button ${props.activeTab === "quality" ? "active" : ""}`}
          onClick={() => props.onTabChange("quality")}
        >
          Quality Metrics
        </button>
        <button
          class={`tab-button ${props.activeTab === "3d" ? "active" : ""}`}
          onClick={() => props.onTabChange("3d")}
        >
          3D Visualization
        </button>
      </div>
    </div>
  );
};
