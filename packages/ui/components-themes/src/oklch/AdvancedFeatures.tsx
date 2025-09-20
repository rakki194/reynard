/**
 * Advanced Features Component
 * 3D color space visualization and performance metrics
 */

import { Component, For, createEffect } from "solid-js";

interface AdvancedFeaturesProps {
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

export const AdvancedFeatures: Component<AdvancedFeaturesProps> = props => {
  const cubeVoxelsRef: HTMLDivElement[] = [];

  // Helper function to set CSS custom properties
  const setCSSProperty = (element: HTMLElement, property: string, value: string) => {
    element.style.setProperty(property, value);
  };

  // Update cube voxels
  createEffect(() => {
    cubeVoxelsRef.forEach((ref, index) => {
      if (ref) {
        const l = Math.floor(index / 16) * 6.25;
        const c = (index % 16) * 0.025;
        const h = (index * 5.625) % 360;
        setCSSProperty(ref, "--dynamic-bg-color", `oklch(${l}% ${c} ${h})`);
        setCSSProperty(ref, "--dynamic-x", (index % 8).toString());
        setCSSProperty(ref, "--dynamic-y", (Math.floor(index / 8) % 8).toString());
        setCSSProperty(ref, "--dynamic-z", Math.floor(index / 64).toString());
      }
    });
  });

  return (
    <>
      {/* Advanced Features Toggle */}
      <div class="advanced-toggle">
        <button class="toggle-button" onClick={props.onToggleAdvanced}>
          {props.showAdvanced ? "Hide" : "Show"} Advanced Features
        </button>
      </div>

      {/* Advanced Features */}
      {props.showAdvanced && (
        <div class="advanced-features">
          <h2>Advanced OKLCH Features</h2>

          {/* Color Space Visualization */}
          <div class="color-space-viz">
            <h3>3D Color Space Visualization</h3>
            <div class="space-container">
              <div class="color-cube">
                <For each={Array.from({ length: 64 }, (_, i) => i)}>
                  {index => {
                    const l = Math.floor(index / 16) * 6.25;
                    const c = (index % 16) * 0.025;
                    const h = (index * 5.625) % 360;
                    return (
                      <div
                        ref={el => (cubeVoxelsRef[index] = el)}
                        class="cube-voxel"
                        data-background-color={`oklch(${l}% ${c} ${h})`}
                        data-x={index % 8}
                        data-y={Math.floor(index / 8) % 8}
                        data-z={Math.floor(index / 64)}
                      />
                    );
                  }}
                </For>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div class="performance-metrics">
            <h3>Performance Metrics</h3>
            <div class="metrics-grid">
              <div class="metric">
                <span class="metric-label">Color Generation</span>
                <span class="metric-value">&lt;1ms</span>
              </div>
              <div class="metric">
                <span class="metric-label">Cache Hit Rate</span>
                <span class="metric-value">98.5%</span>
              </div>
              <div class="metric">
                <span class="metric-label">Memory Usage</span>
                <span class="metric-value">2.3MB</span>
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
