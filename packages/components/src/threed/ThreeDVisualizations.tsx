/**
 * 3D Visualizations Component
 * Main visualization components for different 3D data types
 */

import { Component, Show } from "solid-js";
import { PointCloudVisualization } from "./PointCloudVisualization";
import { ClusterVisualization } from "./ClusterVisualization";
import { EmbeddingVisualization } from "./EmbeddingVisualization";

interface ThreeDVisualizationsProps {
  selectedVisualization: string;
  theme: string;
}

export const ThreeDVisualizations: Component<ThreeDVisualizationsProps> = (props) => {

  return (
    <div class="visualizations-section">
      <h2>3D Visualizations</h2>
      
      {/* Point Cloud Visualization */}
      <Show when={props.selectedVisualization === "point-cloud"}>
        <div class="viz-card">
          <h3>Interactive Point Cloud</h3>
          <p>Explore 3D data points with real-time interaction and OKLCH color mapping.</p>
          <div class="viz-container">
            <PointCloudVisualization
              width={600}
              height={400}
              theme={props.theme}
              pointCount={1000}
            />
          </div>
          <div class="viz-info">
            <div class="info-item">
              <span class="info-label">Points:</span>
              <span class="info-value">1000</span>
            </div>
            <div class="info-item">
              <span class="info-label">Clusters:</span>
              <span class="info-value">8</span>
            </div>
            <div class="info-item">
              <span class="info-label">Colors:</span>
              <span class="info-value">OKLCH</span>
            </div>
          </div>
        </div>
      </Show>

      {/* Cluster Visualization */}
      <Show when={props.selectedVisualization === "clusters"}>
        <div class="viz-card">
          <h3>Cluster Analysis</h3>
          <p>Visualize data clusters with OKLCH color mapping and statistical information.</p>
          <div class="viz-container">
            <ClusterVisualization
              width={600}
              height={400}
              theme={props.theme}
              clusterCount={4}
            />
          </div>
          <div class="viz-info">
            <div class="info-item">
              <span class="info-label">Clusters:</span>
              <span class="info-value">4</span>
            </div>
            <div class="info-item">
              <span class="info-label">Total Points:</span>
              <span class="info-value">200</span>
            </div>
            <div class="info-item">
              <span class="info-label">Analysis:</span>
              <span class="info-value">Active</span>
            </div>
          </div>
        </div>
      </Show>

      {/* Embedding Visualization */}
      <Show when={props.selectedVisualization === "embeddings"}>
        <div class="viz-card">
          <h3>High-Dimensional Embeddings</h3>
          <p>Explore embedding spaces with similarity-based color mapping and interactive exploration.</p>
          <div class="viz-container">
            <EmbeddingVisualization
              width={600}
              height={400}
              theme={props.theme}
              embeddingCount={800}
            />
          </div>
          <div class="viz-info">
            <div class="info-item">
              <span class="info-label">Embeddings:</span>
              <span class="info-value">800</span>
            </div>
            <div class="info-item">
              <span class="info-label">Dimensions:</span>
              <span class="info-value">3D</span>
            </div>
            <div class="info-item">
              <span class="info-label">Similarity:</span>
              <span class="info-value">Color-mapped</span>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};
