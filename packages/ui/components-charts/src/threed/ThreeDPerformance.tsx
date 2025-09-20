/**
 * 3D Performance Monitoring Component
 * Performance metrics and color generation display
 */
import { For, createEffect, Component } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";

interface ThreeDPerformanceProps {
  theme?: string;
  class?: string;
  pointCount?: number;
}

export const ThreeDPerformance: Component<ThreeDPerformanceProps> = props => {
  // Mock visualization engine for now
  const visualization = {
    generateColors: (count: number) => {
      // Generate mock OKLCH colors
      const colors = [];
      for (let i = 0; i < count; i++) {
        const hue = (i * 360) / count;
        colors.push(`oklch(0.7 0.15 ${hue})`);
      }
      return colors;
    },
    getMemoryUsage: () => {
      // Mock memory usage
      return Math.random() * 100 + 50;
    },
  };
  // Color swatch refs
  const colorSwatchRefs: HTMLElement[] = [];
  // Update color swatch backgrounds
  createEffect(() => {
    const colors = visualization.generateColors(8);
    colorSwatchRefs.forEach((ref, index) => {
      if (ref && colors[index]) {
        ref.style.backgroundColor = colors[index];
      }
    });
  });
  return (
    <div class="performance-section">
      <h2>Performance Monitoring</h2>
      <div class="performance-grid">
        <div class="performance-card">
          <h3>3D Engine Statistics</h3>
          <div class="stats-display">
            <div class="stat-item">
              <span class="stat-label">FPS:</span>
              <span class="stat-value">60</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Triangles:</span>
              <span class="stat-value">~{(props.pointCount || 1000) * 2}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Memory:</span>
              <span class="stat-value">{visualization.getMemoryUsage().toFixed(1)}MB</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">GPU:</span>
              <span class="stat-value">WebGL</span>
            </div>
          </div>
        </div>

        <div class="performance-card">
          <h3>Color Generation</h3>
          <div class="color-demo">
            <div class="color-palette">
              <For each={visualization.generateColors(8)}>
                {(color, index) => (
                  <div
                    class="color-swatch"
                    ref={el => {
                      if (el) colorSwatchRefs[index()] = el;
                    }}
                  />
                )}
              </For>
            </div>
            <p>OKLCH 3D Color Palette</p>
          </div>
        </div>

        <div class="performance-card">
          <h3>Interaction Features</h3>
          <div class="features-list">
            <div class="feature-item">
              {fluentIconsPackage.getIcon("hand") && (
                <span class="feature-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("hand")?.outerHTML}
                  />
                </span>
              )}
              <span>Pan & Zoom</span>
            </div>
            <div class="feature-item">
              {fluentIconsPackage.getIcon("target") && (
                <span class="feature-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("target")?.outerHTML}
                  />
                </span>
              )}
              <span>Point Selection</span>
            </div>
            <div class="feature-item">
              {fluentIconsPackage.getIcon("color") && (
                <span class="feature-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("color")?.outerHTML}
                  />
                </span>
              )}
              <span>Color Mapping</span>
            </div>
            <div class="feature-item">
              {fluentIconsPackage.getIcon("play") && (
                <span class="feature-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("play")?.outerHTML}
                  />
                </span>
              )}
              <span>Animations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
