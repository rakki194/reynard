/**
 * Technical Information Section
 * Displays technical excellence information about the charts system
 */

import { Component } from "solid-js";

export const ChartsTechnicalInfo: Component = () => {
  return (
    <div class="technical-info">
      <h2>Technical Excellence</h2>
      <div class="info-grid">
        <div class="info-card">
          <h3>OKLCH Integration</h3>
          <p>Seamless integration with Reynard's OKLCH color system ensures perceptually uniform colors across all chart types.</p>
        </div>
        <div class="info-card">
          <h3>Real-time Performance</h3>
          <p>Optimized for live data streaming with automatic memory management and performance monitoring.</p>
        </div>
        <div class="info-card">
          <h3>Statistical Analysis</h3>
          <p>Advanced statistical visualization tools including histograms, box plots, and quality metrics.</p>
        </div>
        <div class="info-card">
          <h3>Theme Integration</h3>
          <p>Automatic adaptation to Reynard themes with intelligent color generation and caching.</p>
        </div>
      </div>
    </div>
  );
};
