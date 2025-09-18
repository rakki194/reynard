import { Component } from "solid-js";
import { type PerformanceStats } from "../composables/usePerformanceStats";

interface PerformanceComparisonProps {
  stats: PerformanceStats;
}

/**
 * Performance comparison display component
 * Shows side-by-side comparison of naive vs spatial hash algorithms
 */
export const PerformanceComparison: Component<PerformanceComparisonProps> = props => {
  const efficiencyGain = () => ((props.stats.speedup - 1) * 100).toFixed(1);

  return (
    <div class="performance-comparison">
      <div class="comparison-card">
        <h3>Naive O(n²) Algorithm</h3>
        <div class="metric">
          <span class="metric-label">Execution Time:</span>
          <span class="metric-value">{props.stats.naiveTime.toFixed(2)}ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">Complexity:</span>
          <span class="metric-value">O(n²)</span>
        </div>
      </div>

      <div class="comparison-card">
        <h3>Spatial Hash Algorithm</h3>
        <div class="metric">
          <span class="metric-label">Execution Time:</span>
          <span class="metric-value">{props.stats.spatialTime.toFixed(2)}ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">Complexity:</span>
          <span class="metric-value">O(n)</span>
        </div>
      </div>

      <div class="comparison-card highlight">
        <h3>Performance Improvement</h3>
        <div class="metric">
          <span class="metric-label">Speedup:</span>
          <span class="metric-value">{props.stats.speedup.toFixed(2)}x</span>
        </div>
        <div class="metric">
          <span class="metric-label">Efficiency Gain:</span>
          <span class="metric-value">{efficiencyGain()}%</span>
        </div>
      </div>
    </div>
  );
};
