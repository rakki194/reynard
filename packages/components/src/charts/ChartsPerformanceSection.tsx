/**
 * Performance Monitoring Section
 * Displays performance metrics and color generation demos
 */

import { Component, For } from "solid-js";

interface ChartsPerformanceSectionProps {
  visualization: {
    stats: () => {
      activeVisualizations: number;
      fps: number;
      memoryUsage: number;
      cacheHitRate: number;
    };
    generateColors: (count: number) => string[];
    generateTagColors: (tags: string[]) => Record<string, string>;
    getMemoryUsage: () => number;
  };
}

export const ChartsPerformanceSection: Component<
  ChartsPerformanceSectionProps
> = (props) => {
  return (
    <div class="performance-section">
      <h2>Performance Monitoring</h2>
      <div class="performance-grid">
        <div class="performance-card">
          <h3>Engine Statistics</h3>
          <div class="stats-display">
            <div class="stat-item">
              <span class="stat-label">Active Charts:</span>
              <span class="stat-value">
                {props.visualization.stats().activeVisualizations}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">FPS:</span>
              <span class="stat-value">{props.visualization.stats().fps}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Memory:</span>
              <span class="stat-value">
                {props.visualization.stats().memoryUsage.toFixed(1)}MB
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Cache Hit Rate:</span>
              <span class="stat-value">
                {props.visualization.stats().cacheHitRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div class="performance-card">
          <h3>Color Generation</h3>
          <div class="color-demo">
            <div class="color-palette">
              <For each={props.visualization.generateColors(8)}>
                {(color) => <div class="color-swatch" data-bg-color={color} />}
              </For>
            </div>
            <p>OKLCH Color Palette</p>
          </div>
        </div>

        <div class="performance-card">
          <h3>Tag Colors</h3>
          <div class="tag-demo">
            <For
              each={["javascript", "typescript", "solidjs", "oklch", "charts"]}
            >
              {(tag) => (
                <div
                  class="tag-item"
                  classList={{
                    "tag-light": props.visualization
                      .generateTagColors([tag])
                      [tag].includes("oklch"),
                    "tag-dark": !props.visualization
                      .generateTagColors([tag])
                      [tag].includes("oklch"),
                  }}
                  data-bg-color={
                    props.visualization.generateTagColors([tag])[tag]
                  }
                >
                  {tag}
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
};
