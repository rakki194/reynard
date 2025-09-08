/**
 * Charts Hero Section
 * Hero component for the charts showcase with preview visualization
 */

import { Component } from "solid-js";
import { Chart } from "reynard-charts";

interface ChartsHeroProps {
  selectedTheme: string;
  sampleData: {
    sales: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
      }>;
    };
  };
  performanceMonitoring: boolean;
}

export const ChartsHero: Component<ChartsHeroProps> = (props) => {
  return (
    <div class="showcase-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Charts Showcase
        </h1>
        <p class="hero-subtitle">
          Experience the power of professional data visualization with Reynard's advanced charting system.
          Featuring OKLCH color integration, real-time capabilities, and statistical analysis tools.
        </p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">8+</span>
            <span class="stat-label">Chart Types</span>
          </div>
          <div class="stat">
            <span class="stat-number">Real-time</span>
            <span class="stat-label">Live Data</span>
          </div>
          <div class="stat">
            <span class="stat-number">OKLCH</span>
            <span class="stat-label">Colors</span>
          </div>
        </div>
      </div>
      <div class="hero-visualization">
        <div class="chart-preview">
          <Chart
            type="line"
            labels={props.sampleData.sales.labels}
            datasets={props.sampleData.sales.datasets}
            width={400}
            height={200}
            title="Live Performance"
            useOKLCH={true}
            colorTheme={props.selectedTheme}
            enablePerformanceMonitoring={props.performanceMonitoring}
          />
        </div>
      </div>
    </div>
  );
};
