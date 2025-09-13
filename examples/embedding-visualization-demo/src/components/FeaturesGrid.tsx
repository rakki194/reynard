/**
 * Features Grid Component
 *
 * Displays the key features of the embedding visualization system.
 */

import { Component } from "solid-js";

export const FeaturesGrid: Component = () => {
  return (
    <div class="features-grid">
      <div class="feature-card">
        <h3>📊 Statistical Analysis</h3>
        <p>
          Distribution charts, box plots, and statistical overlays for embedding
          value analysis
        </p>
      </div>

      <div class="feature-card">
        <h3>🔬 PCA Analysis</h3>
        <p>
          Principal component analysis with explained variance and
          recommendations
        </p>
      </div>

      <div class="feature-card">
        <h3>⭐ Quality Metrics</h3>
        <p>
          Comprehensive quality assessment with coherence, separation, and
          density scores
        </p>
      </div>

      <div class="feature-card">
        <h3>🌐 3D Visualization</h3>
        <p>
          Interactive 3D point cloud visualization with Three.js integration
        </p>
      </div>
    </div>
  );
};
