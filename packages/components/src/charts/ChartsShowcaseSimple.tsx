/**
 * Charts Showcase - Simplified Version
 * A comprehensive demonstration of Reynard's advanced charting capabilities
 */

import {
  Component,
  For,
  createSignal,
  createMemo,
  onMount,
  onCleanup,
  createEffect,
} from "solid-js";
import { useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";
import {
  Chart,
  RealTimeChart,
  StatisticalChart,
  useVisualizationEngine,
  type RealTimeDataPoint,
  type StatisticalData,
  type QualityData,
} from "reynard-charts";
import { useChartsData } from "./useChartsData";
import { useChartsLifecycle } from "./useChartsLifecycle";

export const ChartsShowcaseSimple: Component = () => {
  const themeContext = useTheme();

  // Interactive state
  const [selectedTheme, setSelectedTheme] = createSignal(themeContext.theme);
  const [realTimeEnabled, setRealTimeEnabled] = createSignal(true);

  // Use centralized data management
  const chartsData = useChartsData();

  // Animation state
  let colorSwatchRefs: HTMLDivElement[] = [];

  // Initialize visualization engine
  const visualization = useVisualizationEngine({
    theme: selectedTheme() as
      | "light"
      | "dark"
      | "gray"
      | "banana"
      | "strawberry"
      | "peanut",
    useOKLCH: true,
    performance: {
      lazyLoading: true,
      memoryLimit: 512,
      targetFPS: 60,
    },
  });

  // Available themes for demonstration
  const availableThemes = getAvailableThemes().map(
    (theme) => theme.name as ThemeName,
  );

  // Sample data for different chart types
  const sampleData = createMemo(() => ({
    sales: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Sales",
          data: [12, 19, 3, 5, 2, 3],
        },
        {
          label: "Marketing",
          data: [2, 3, 20, 5, 1, 4],
        },
      ],
    },
    revenue: {
      labels: ["Q1", "Q2", "Q3", "Q4"],
      datasets: [
        {
          label: "Revenue",
          data: [65, 59, 80, 81],
        },
      ],
    },
    distribution: {
      labels: ["Desktop", "Mobile", "Tablet", "Other"],
      datasets: [
        {
          label: "Traffic",
          data: [45, 35, 15, 5],
        },
      ],
    },
  }));

  // Statistical data for analysis
  const statisticalData = createMemo(
    (): StatisticalData => ({
      values: Array.from({ length: 100 }, () => Math.random() * 100),
      statistics: {
        min: 0,
        q1: 25,
        median: 50,
        q3: 75,
        max: 100,
        mean: 50,
        std: 28.87,
      },
    }),
  );

  // Quality metrics data
  const qualityData = createMemo(
    (): QualityData => ({
      overallScore: 87,
      metrics: [
        {
          name: "Performance",
          value: 92,
          unit: "%",
          higherIsBetter: true,
          goodThreshold: 80,
          warningThreshold: 60,
        },
        {
          name: "Accessibility",
          value: 88,
          unit: "%",
          higherIsBetter: true,
          goodThreshold: 85,
          warningThreshold: 70,
        },
        {
          name: "SEO",
          value: 76,
          unit: "%",
          higherIsBetter: true,
          goodThreshold: 80,
          warningThreshold: 60,
        },
        {
          name: "Security",
          value: 95,
          unit: "%",
          higherIsBetter: true,
          goodThreshold: 90,
          warningThreshold: 75,
        },
      ],
      assessment: {
        status: "good",
        issues: ["SEO score could be improved"],
        recommendations: ["Optimize meta tags", "Implement lazy loading"],
      },
    }),
  );

  // Set up lifecycle management for real-time data
  useChartsLifecycle({
    realTimeEnabled,
    generateRealTimeData: chartsData.generateRealTimeData,
    generatePerformanceData: chartsData.generatePerformanceData,
    generateMemoryData: chartsData.generateMemoryData,
    animationSpeed: () => 1,
    setAnimationFrame: chartsData.setAnimationFrame,
    animationId: chartsData.animationId,
    setAnimationId: chartsData.setAnimationId,
    realTimeInterval: chartsData.realTimeInterval,
    setRealTimeInterval: chartsData.setRealTimeInterval,
    performanceInterval: chartsData.performanceInterval,
    setPerformanceInterval: chartsData.setPerformanceInterval,
    memoryInterval: chartsData.memoryInterval,
    setMemoryInterval: chartsData.setMemoryInterval,
  });

  // Update color swatches when colors change
  createEffect(() => {
    const colors = visualization.generateColors(8);
    colorSwatchRefs.forEach((ref, index) => {
      if (ref && colors[index]) {
        ref.style.backgroundColor = colors[index];
      }
    });
  });

  return (
    <section class="charts-showcase">
      {/* Hero Section */}
      <div class="showcase-hero">
        <div class="hero-content">
          <h1 class="hero-title">Charts Showcase</h1>
          <p class="hero-subtitle">
            Experience the power of professional data visualization with
            Reynard's advanced charting system. Featuring OKLCH color
            integration, real-time capabilities, and statistical analysis tools.
          </p>
        </div>
        <div class="hero-visualization">
          <div class="chart-preview">
            <Chart
              type="line"
              labels={sampleData().sales.labels}
              datasets={sampleData().sales.datasets}
              width={400}
              height={200}
              title="Live Performance"
            />
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div class="controls-section">
        <h2>Interactive Controls</h2>
        <div class="controls-grid">
          <div class="control-group">
            <label>Theme Selection</label>
            <div class="theme-buttons">
              <For each={availableThemes}>
                {(theme) => (
                  <button
                    class={`theme-button ${selectedTheme() === theme ? "active" : ""}`}
                    onClick={() => {
                      setSelectedTheme(
                        theme as
                          | "light"
                          | "dark"
                          | "gray"
                          | "banana"
                          | "strawberry"
                          | "peanut",
                      );
                      themeContext.setTheme(
                        theme as
                          | "light"
                          | "dark"
                          | "gray"
                          | "banana"
                          | "strawberry"
                          | "peanut",
                      );
                    }}
                  >
                    {theme}
                  </button>
                )}
              </For>
            </div>
          </div>

          <div class="control-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                checked={realTimeEnabled()}
                onChange={(e) => setRealTimeEnabled(e.target.checked)}
              />
              Enable Real-time Data
            </label>
          </div>
        </div>
      </div>

      {/* Chart Types Showcase */}
      <div class="chart-types-section">
        <h2>Chart Types</h2>
        <div class="charts-grid">
          <div class="chart-card">
            <h3>Line Chart</h3>
            <Chart
              type="line"
              labels={sampleData().sales.labels}
              datasets={sampleData().sales.datasets}
              width={300}
              height={200}
              title="Sales Trend"
            />
          </div>

          <div class="chart-card">
            <h3>Bar Chart</h3>
            <Chart
              type="bar"
              labels={sampleData().revenue.labels}
              datasets={sampleData().revenue.datasets}
              width={300}
              height={200}
              title="Quarterly Revenue"
            />
          </div>

          <div class="chart-card">
            <h3>Doughnut Chart</h3>
            <Chart
              type="doughnut"
              labels={sampleData().distribution.labels}
              datasets={sampleData().distribution.datasets}
              width={300}
              height={200}
              title="Traffic Distribution"
            />
          </div>
        </div>
      </div>

      {/* Real-time Charts */}
      <div class="realtime-section">
        <h2>Real-time Data Visualization</h2>
        <div class="realtime-grid">
          <div class="realtime-card">
            <h3>Live Performance Metrics</h3>
            <RealTimeChart
              type="line"
              data={chartsData.realTimeData()}
              title="System Performance"
              maxDataPoints={30}
              updateInterval={1000}
              autoScroll={true}
              enablePerformanceMonitoring={true}
            />
          </div>

          <div class="realtime-card">
            <h3>FPS Monitoring</h3>
            <RealTimeChart
              type="line"
              data={chartsData.performanceData()}
              title="Frame Rate"
              maxDataPoints={20}
              updateInterval={2000}
              autoScroll={true}
              yAxisLabel="FPS"
            />
          </div>

          <div class="realtime-card">
            <h3>Memory Usage</h3>
            <RealTimeChart
              type="bar"
              data={chartsData.memoryData()}
              title="Memory Consumption"
              maxDataPoints={15}
              updateInterval={3000}
              autoScroll={true}
              yAxisLabel="MB"
            />
          </div>
        </div>
      </div>

      {/* Statistical Analysis */}
      <div class="statistical-section">
        <h2>Statistical Analysis</h2>
        <div class="statistical-grid">
          <div class="statistical-card">
            <h3>Data Distribution</h3>
            <StatisticalChart
              type="histogram"
              data={statisticalData()}
              title="Value Distribution"
              numBins={15}
              showStatistics={true}
            />
          </div>

          <div class="statistical-card">
            <h3>Quality Metrics</h3>
            <StatisticalChart
              type="quality-bar"
              data={qualityData()}
              title="Quality Assessment"
              showAssessment={true}
            />
          </div>
        </div>
      </div>

      {/* Performance Monitoring */}
      <div class="performance-section">
        <h2>Performance Monitoring</h2>
        <div class="performance-grid">
          <div class="performance-card">
            <h3>Engine Statistics</h3>
            <div class="stats-display">
              <div class="stat-item">
                <span class="stat-label">Active Charts:</span>
                <span class="stat-value">
                  {visualization.stats().activeVisualizations}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">FPS:</span>
                <span class="stat-value">{visualization.stats().fps}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Memory:</span>
                <span class="stat-value">
                  {visualization.stats().memoryUsage.toFixed(1)}MB
                </span>
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
                      ref={(el) => (colorSwatchRefs[index()] = el)}
                      class="color-swatch"
                    />
                  )}
                </For>
              </div>
              <p>OKLCH Color Palette</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Information */}
      <div class="technical-info">
        <h2>Technical Excellence</h2>
        <div class="info-grid">
          <div class="info-card">
            <h3>OKLCH Integration</h3>
            <p>
              Seamless integration with Reynard's OKLCH color system ensures
              perceptually uniform colors across all chart types.
            </p>
          </div>
          <div class="info-card">
            <h3>Real-time Performance</h3>
            <p>
              Optimized for live data streaming with automatic memory management
              and performance monitoring.
            </p>
          </div>
          <div class="info-card">
            <h3>Statistical Analysis</h3>
            <p>
              Advanced statistical visualization tools including histograms, box
              plots, and quality metrics.
            </p>
          </div>
          <div class="info-card">
            <h3>Theme Integration</h3>
            <p>
              Automatic adaptation to Reynard themes with intelligent color
              generation and caching.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
