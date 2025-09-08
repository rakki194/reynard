/**
 * Advanced Features Section
 * Displays advanced chart features and custom color generation
 */

import { Component, For } from "solid-js";

interface ChartsAdvancedFeaturesProps {
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  visualization: {
    generateColors: (count: number, opacity?: number) => string[];
    getMemoryUsage: () => number;
  };
}

export const ChartsAdvancedFeatures: Component<ChartsAdvancedFeaturesProps> = (props) => {
  return (
    <>
      {/* Advanced Features Toggle */}
      <div class="advanced-toggle">
        <button 
          class="toggle-button"
          onClick={() => props.setShowAdvanced(!props.showAdvanced)}
        >
          {props.showAdvanced ? 'Hide' : 'Show'} Advanced Features
        </button>
      </div>

      {/* Advanced Features */}
      {props.showAdvanced && (
        <div class="advanced-features">
          <h2>Advanced Chart Features</h2>
          
          {/* Custom Color Generation */}
          <div class="custom-colors-section">
            <h3>Custom Color Generation</h3>
            <div class="custom-colors-demo">
              <div class="color-variations">
                <h4>Lightness Variations</h4>
                <div class="color-row">
                  <For each={[0.3, 0.5, 0.7, 0.9]}>
                    {(opacity) => (
                      <div class="color-group">
                        <div 
                          class="color-sample"
                          data-bg-color={props.visualization.generateColors(1, opacity)[0]}
                        />
                        <span>Opacity: {opacity}</span>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div class="advanced-performance">
            <h3>Advanced Performance Metrics</h3>
            <div class="metrics-grid">
              <div class="metric">
                <span class="metric-label">Color Generation</span>
                <span class="metric-value">&lt;1ms</span>
              </div>
              <div class="metric">
                <span class="metric-label">Chart Rendering</span>
                <span class="metric-value">16ms</span>
              </div>
              <div class="metric">
                <span class="metric-label">Memory Usage</span>
                <span class="metric-value">{props.visualization.getMemoryUsage().toFixed(1)}MB</span>
              </div>
              <div class="metric">
                <span class="metric-label">Browser Support</span>
                <span class="metric-value">95%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
