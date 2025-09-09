/**
 * 3D Technical Information Component
 * Technical details and use cases for 3D visualization
 */

import { Component, Show, createSignal } from "solid-js";

export const ThreeDTechnicalInfo: Component = () => {
  const [showAdvanced, setShowAdvanced] = createSignal(false);

  return (
    <>
      {/* Advanced Features Toggle */}
      <div class="advanced-toggle">
        <button
          class="toggle-button"
          onClick={() => setShowAdvanced(!showAdvanced())}
        >
          {showAdvanced() ? "Hide" : "Show"} Advanced Features
        </button>
      </div>

      {/* Advanced Features */}
      <Show when={showAdvanced()}>
        <div class="advanced-features">
          <h2>Advanced 3D Features</h2>

          {/* Technical Details */}
          <div class="technical-details">
            <h3>Technical Implementation</h3>
            <div class="details-grid">
              <div class="detail-card">
                <h4>Three.js Integration</h4>
                <p>
                  Full Three.js integration with WebGL rendering, camera
                  controls, and scene management.
                </p>
              </div>
              <div class="detail-card">
                <h4>OKLCH Color Space</h4>
                <p>
                  Perceptually uniform colors for consistent visual
                  representation across all 3D elements.
                </p>
              </div>
              <div class="detail-card">
                <h4>Performance Optimization</h4>
                <p>
                  Level-of-detail rendering, frustum culling, and efficient
                  memory management.
                </p>
              </div>
              <div class="detail-card">
                <h4>Interactive Controls</h4>
                <p>
                  OrbitControls for camera manipulation, raycasting for point
                  selection, and real-time updates.
                </p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div class="use-cases">
            <h3>Use Cases</h3>
            <div class="use-cases-grid">
              <div class="use-case">
                <h4>Machine Learning</h4>
                <p>
                  Visualize high-dimensional embeddings, cluster analysis, and
                  model outputs in 3D space.
                </p>
              </div>
              <div class="use-case">
                <h4>Scientific Visualization</h4>
                <p>
                  Explore complex datasets, molecular structures, and scientific
                  simulations.
                </p>
              </div>
              <div class="use-case">
                <h4>Data Analytics</h4>
                <p>
                  Interactive exploration of multi-dimensional data with
                  intuitive 3D navigation.
                </p>
              </div>
              <div class="use-case">
                <h4>Real-time Monitoring</h4>
                <p>
                  Live 3D visualization of streaming data with performance
                  optimization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Technical Information */}
      <div class="technical-info">
        <h2>Technical Excellence</h2>
        <div class="info-grid">
          <div class="info-card">
            <h3>WebGL Rendering</h3>
            <p>
              Hardware-accelerated 3D graphics with efficient GPU utilization
              and modern WebGL features.
            </p>
          </div>
          <div class="info-card">
            <h3>OKLCH Integration</h3>
            <p>
              Seamless integration with Reynard's OKLCH color system for
              consistent, accessible 3D visualizations.
            </p>
          </div>
          <div class="info-card">
            <h3>Performance Optimization</h3>
            <p>
              Advanced optimization techniques including LOD, instancing, and
              memory management for smooth 60fps rendering.
            </p>
          </div>
          <div class="info-card">
            <h3>Interactive Controls</h3>
            <p>
              Intuitive camera controls, point selection, and real-time
              interaction for immersive data exploration.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
