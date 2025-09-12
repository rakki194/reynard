/**
 * Embedding Visualization Demo Application
 *
 * Demonstrates the comprehensive embedding visualization system
 * with all components and features.
 */

import { Component, createSignal } from "solid-js";
import { EmbeddingVisualizationDashboard } from "reynard-charts";

export const App: Component = () => {
  const [theme, setTheme] = createSignal<"light" | "dark">("dark");

  return (
    <div class={`app ${theme()}`}>
      <header class="app-header">
        <h1>🦊 Reynard Embedding Visualization Demo</h1>
        <div class="header-controls">
          <button
            class="theme-toggle"
            onClick={() => setTheme(theme() === "dark" ? "light" : "dark")}
          >
            {theme() === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <main class="app-main">
        <div class="demo-description">
          <h2>Comprehensive Embedding Analysis & Visualization</h2>
          <p>
            This demo showcases the complete embedding visualization system
            ported from Yipyap, featuring dimensionality reduction, statistical
            analysis, quality metrics, and 3D visualization.
          </p>

          <div class="features-grid">
            <div class="feature-card">
              <h3>📊 Statistical Analysis</h3>
              <p>
                Distribution charts, box plots, and statistical overlays for
                embedding value analysis
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
                Interactive 3D point cloud visualization with Three.js
                integration
              </p>
            </div>
          </div>
        </div>

        <div class="dashboard-container">
          <EmbeddingVisualizationDashboard
            isVisible={true}
            width={1200}
            height={800}
            theme={theme()}
            class="demo-dashboard"
          />
        </div>

        <div class="demo-info">
          <h3>🎯 Key Features Demonstrated</h3>
          <ul>
            <li>
              <strong>Backend Integration:</strong> Complete API endpoints for
              embedding visualization
            </li>
            <li>
              <strong>Dimensionality Reduction:</strong> PCA, t-SNE, and UMAP
              with parameter controls
            </li>
            <li>
              <strong>Real-time Processing:</strong> WebSocket progress updates
              and caching
            </li>
            <li>
              <strong>Interactive 3D:</strong> Three.js-based point cloud
              visualization
            </li>
            <li>
              <strong>Quality Analysis:</strong> Automated embedding quality
              assessment
            </li>
            <li>
              <strong>Statistical Visualization:</strong> Advanced charts with
              OKLCH color integration
            </li>
            <li>
              <strong>Responsive Design:</strong> Adaptive layout with theme
              support
            </li>
          </ul>

          <h3>🦊 Technical Implementation</h3>
          <ul>
            <li>
              <strong>Backend Services:</strong> FastAPI endpoints with
              scikit-learn integration
            </li>
            <li>
              <strong>Frontend Components:</strong> SolidJS components with
              Chart.js and Three.js
            </li>
            <li>
              <strong>State Management:</strong> Reactive composables with
              real-time updates
            </li>
            <li>
              <strong>Performance:</strong> Caching, WebSocket streaming, and
              optimized rendering
            </li>
            <li>
              <strong>Integration:</strong> Seamless integration with existing
              Reynard architecture
            </li>
          </ul>
        </div>
      </main>

      <footer class="app-footer">
        <p>
          🦊 Reynard Embedding Visualization System - Powered by cunning agile
          development
        </p>
      </footer>
    </div>
  );
};
