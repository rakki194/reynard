/**
 * 🦊 Enhanced Metrics Component
 * Performance metrics panel for the integration demo
 */

import { Component } from "solid-js";
import { Card } from "reynard-components";

export interface MetricsProps {
  performanceMetrics: () => any;
}

export const EnhancedMetrics: Component<MetricsProps> = props => {
  return (
    <Card class="metrics-panel">
      <h3>Performance Metrics</h3>
      <div class="metrics-info">
        <div class="metrics-item">
          <span class="metrics-label">FPS:</span>
          <span class="metrics-value">{props.performanceMetrics()?.currentFPS?.toFixed(1) || "0.0"}</span>
        </div>
        <div class="metrics-item">
          <span class="metrics-label">Frame Time:</span>
          <span class="metrics-value">{props.performanceMetrics()?.frameTime?.toFixed(2) || "0.00"}ms</span>
        </div>
        <div class="metrics-item">
          <span class="metrics-label">Render Time:</span>
          <span class="metrics-value">{props.performanceMetrics()?.renderTime?.toFixed(2) || "0.00"}ms</span>
        </div>
        <div class="metrics-item">
          <span class="metrics-label">Memory:</span>
          <span class="metrics-value">{props.performanceMetrics()?.memoryUsage?.toFixed(1) || "0.0"}MB</span>
        </div>
      </div>
    </Card>
  );
};
