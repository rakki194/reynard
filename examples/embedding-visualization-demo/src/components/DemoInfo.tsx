/**
 * Demo Information Component
 *
 * Displays technical details and implementation information.
 */

import { Component } from "solid-js";

export const DemoInfo: Component = () => {
  return (
    <div class="demo-info">
      <h3>🎯 Key Features Demonstrated</h3>
      <ul>
        <li>
          <strong>Backend Integration:</strong> Complete API endpoints for embedding visualization
        </li>
        <li>
          <strong>Dimensionality Reduction:</strong> PCA, t-SNE, and UMAP with parameter controls
        </li>
        <li>
          <strong>Real-time Processing:</strong> WebSocket progress updates and caching
        </li>
        <li>
          <strong>Interactive 3D:</strong> Three.js-based point cloud visualization
        </li>
        <li>
          <strong>Quality Analysis:</strong> Automated embedding quality assessment
        </li>
        <li>
          <strong>Statistical Visualization:</strong> Advanced charts with OKLCH color integration
        </li>
        <li>
          <strong>Responsive Design:</strong> Adaptive layout with theme support
        </li>
      </ul>

      <h3>🦊 Technical Implementation</h3>
      <ul>
        <li>
          <strong>Backend Services:</strong> FastAPI endpoints with scikit-learn integration
        </li>
        <li>
          <strong>Frontend Components:</strong> SolidJS components with Chart.js and Three.js
        </li>
        <li>
          <strong>State Management:</strong> Reactive composables with real-time updates
        </li>
        <li>
          <strong>Performance:</strong> Caching, WebSocket streaming, and optimized rendering
        </li>
        <li>
          <strong>Integration:</strong> Seamless integration with existing Reynard architecture
        </li>
      </ul>
    </div>
  );
};
