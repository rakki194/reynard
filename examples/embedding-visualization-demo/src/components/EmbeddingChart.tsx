/**
 * Embedding Chart Component
 * 
 * A simple placeholder chart component for the demo.
 */

import { Component } from "solid-js";
import "./EmbeddingChart.css";

interface EmbeddingChartProps {
  theme: "light" | "dark";
  width?: number;
  height?: number;
  class?: string;
}

export const EmbeddingChart: Component<EmbeddingChartProps> = (props) => {
  return (
    <div 
      class={`embedding-chart ${props.theme} ${props.width && props.height ? `size-${props.width}x${props.height}` : "size-default"} ${props.class || ""}`}
    >
      <div class="embedding-chart-content">
        <div class="embedding-chart-icon">📊</div>
        <div class="embedding-chart-title">Embedding Visualization Dashboard</div>
        <div class="embedding-chart-subtitle">
          Advanced 3D point cloud visualization with statistical analysis
        </div>
      </div>
    </div>
  );
};
