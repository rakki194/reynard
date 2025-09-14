/**
 * 🦊 3D Phyllotactic Performance Panel
 * Performance metrics display for 3D phyllotactic system
 */

import { Component } from "solid-js";
import { Card } from "reynard-components";

interface PerformanceMetrics {
  currentFPS?: number;
  frameTime?: number;
  renderTime?: number;
}

interface Phyllotactic3DPerformancePanelProps {
  performanceMetrics: () => PerformanceMetrics | null;
}

export const Phyllotactic3DPerformancePanel: Component<
  Phyllotactic3DPerformancePanelProps
> = (props) => {
  return (
    <Card class="performance-panel">
      <h3>Performance Metrics</h3>
      <div class="performance-info">
        <div class="performance-item">
          <span class="performance-label">FPS:</span>
          <span class="performance-value">
            {props.performanceMetrics()?.currentFPS?.toFixed(1) || "0.0"}
          </span>
        </div>
        <div class="performance-item">
          <span class="performance-label">Frame Time:</span>
          <span class="performance-value">
            {props.performanceMetrics()?.frameTime?.toFixed(2) || "0.00"}ms
          </span>
        </div>
        <div class="performance-item">
          <span class="performance-label">Render Time:</span>
          <span class="performance-value">
            {props.performanceMetrics()?.renderTime?.toFixed(2) || "0.00"}ms
          </span>
        </div>
      </div>
    </Card>
  );
};
