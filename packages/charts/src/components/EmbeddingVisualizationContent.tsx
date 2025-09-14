/**
 * Embedding Visualization Content Component
 *
 * Handles the main visualization content area with different tabs.
 */

import { Component, Show } from "solid-js";
import { ReynardTheme } from "../types";
import { Embedding3DVisualization } from "./Embedding3DVisualization";
import { EmbeddingDistributionChart } from "./EmbeddingDistributionChart";
import { EmbeddingQualityChart } from "./EmbeddingQualityChart";
import { PCAVarianceChart } from "./PCAVarianceChart";

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

export const EmbeddingVisualizationContent: Component<EmbeddingVisualizationContentProps> = props => {
  return (
    <div class="dashboard-main">
      <Show when={props.error}>
        <div class="error-message">
          <h4>Error</h4>
          <p>{props.error}</p>
          <button onClick={props.onRetry}>Retry</button>
        </div>
      </Show>

      <Show when={!props.isLoading && !props.error}>
        <div class="visualization-content">
          <Show when={props.activeTab === "distribution" && props.embeddingData}>
            <div class="chart-section">
              <h4>Embedding Value Distribution</h4>
              <div class="chart-grid">
                <EmbeddingDistributionChart
                  title="Embedding Value Histogram"
                  type="histogram"
                  data={props.embeddingData}
                  width={props.width || 400}
                  height={props.height || 300}
                  xAxisLabel="Embedding Value"
                  yAxisLabel="Frequency"
                  showStatistics={true}
                  theme={props.theme as ReynardTheme}
                />
                <EmbeddingDistributionChart
                  title="Embedding Value Box Plot"
                  type="boxplot"
                  data={props.embeddingData}
                  width={props.width || 400}
                  height={props.height || 300}
                  xAxisLabel="Statistic"
                  yAxisLabel="Value"
                  showStatistics={true}
                  theme={props.theme as ReynardTheme}
                />
              </div>
            </div>
          </Show>

          <Show when={props.activeTab === "pca" && props.pcaData}>
            <div class="chart-section">
              <h4>PCA Explained Variance Analysis</h4>
              <PCAVarianceChart
                title="Explained Variance by Principal Components"
                data={props.pcaData}
                width={props.width || 600}
                height={props.height || 400}
                showCumulative={true}
                showRecommendations={true}
                maxComponents={20}
                theme={props.theme as ReynardTheme}
              />
            </div>
          </Show>

          <Show when={props.activeTab === "quality" && props.qualityData}>
            <div class="chart-section">
              <h4>Embedding Quality Analysis</h4>
              <div class="chart-grid">
                <EmbeddingQualityChart
                  title="Quality Metrics"
                  type="quality-bar"
                  data={props.qualityData}
                  width={props.width || 400}
                  height={props.height || 300}
                  showAssessment={true}
                  theme={props.theme as ReynardTheme}
                />
                <EmbeddingQualityChart
                  title="Overall Quality Score"
                  type="quality-gauge"
                  data={props.qualityData}
                  width={props.width || 400}
                  height={props.height || 300}
                  showAssessment={true}
                  theme={props.theme as ReynardTheme}
                />
              </div>
            </div>
          </Show>

          <Show when={props.activeTab === "3d"}>
            <div class="chart-section">
              <h4>3D Embedding Visualization</h4>
              <Show when={props.reductionResult}>
                <Embedding3DVisualization
                  data={props.reductionResult}
                  width={props.width || 800}
                  height={props.height || 600}
                  pointSize={2}
                  enableHighlighting={true}
                  showSimilarityPaths={true}
                  theme={props.theme as ReynardTheme}
                  onPointClick={(index, data) => {
                    console.log("Point clicked:", index, data);
                  }}
                  onPointHover={(index, data) => {
                    console.log("Point hovered:", index, data);
                  }}
                />
              </Show>
              <Show when={!props.reductionResult}>
                <div class="three-d-placeholder">
                  <p>Perform a dimensionality reduction to see 3D visualization</p>
                  <p>Use the controls in the sidebar to reduce embeddings to 3D</p>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};
