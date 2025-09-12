/**
 * Embedding Stats Panel Component
 * 
 * Displays embedding statistics and metrics.
 */

import { Component } from "solid-js";

export interface EmbeddingStatsPanelProps {
  /** Embedding statistics data */
  stats: any;
}

export const EmbeddingStatsPanel: Component<EmbeddingStatsPanelProps> = (props) => {
  if (!props.stats) return null;

  return (
    <div class="stats-panel">
      <h3>Embedding Statistics</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Total Embeddings:</div>
          <div class="stat-value">
            {props.stats.total_embeddings.toLocaleString()}
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Dimensions:</div>
          <div class="stat-value">{props.stats.embedding_dimension}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Quality Score:</div>
          <div class="stat-value">
            {(props.stats.quality_score * 100).toFixed(1)}%
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Last Updated:</div>
          <div class="stat-value">
            {new Date(props.stats.last_updated).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};
