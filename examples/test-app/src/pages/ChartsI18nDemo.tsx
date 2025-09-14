/**
 * Charts i18n Demo Page
 * Demonstrates the optional i18n system for charts package
 */

import { Component, createSignal, Show, For } from "solid-js";
import { Chart } from "reynard-charts";
import {
  t,
  getChartTypeName,
  getAxisLabel,
  getLoadingMessage,
  getQualityText,
  getStatisticsLabel,
  isI18nAvailable,
  getI18nModule
} from "reynard-charts";

// Sample data for demonstrations
const sampleLineData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [{
    label: "Sales",
    data: [12, 19, 3, 5, 2, 3],
    borderColor: "rgb(75, 192, 192)",
    backgroundColor: "rgba(75, 192, 192, 0.2)",
    tension: 0.1
  }]
};

const sampleBarData = {
  labels: ["Product A", "Product B", "Product C", "Product D"],
  datasets: [{
    label: "Revenue",
    data: [65, 59, 80, 81],
    backgroundColor: [
      "rgba(255, 99, 132, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      "rgba(255, 205, 86, 0.8)",
      "rgba(75, 192, 192, 0.8)"
    ],
    borderColor: [
      "rgba(255, 99, 132, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 205, 86, 1)",
      "rgba(75, 192, 192, 1)"
    ],
    borderWidth: 1
  }]
};

const chartTypes = ["line", "bar", "pie", "doughnut", "histogram", "boxplot"];

const translationExamples = [
  { key: "loading", label: "Basic Loading" },
  { key: "loadingData", label: "Chart Loading" },
  { key: "loadingStatisticalData", label: "Statistical Loading" },
  { key: "noData", label: "No Data Message" },
  { key: "exportImage", label: "Export Image" },
  { key: "showLegend", label: "Show Legend" }
];

const qualityLevels = ["excellent", "good", "fair", "poor"] as const;

const statisticsLabels = ["mean", "median", "mode", "standardDeviation", "variance", "range"];

export const ChartsI18nDemo: Component = () => {
  const [selectedChartType, setSelectedChartType] = createSignal("line");
  const [showI18nInfo, setShowI18nInfo] = createSignal(false);

  return (
    <div class="charts-i18n-demo">
      <div class="demo-header">
        <h1>🦊 Charts Optional i18n Demo</h1>
        <p>Demonstrating the new optional i18n system for the charts package</p>
        
        <div class="i18n-status">
          <button 
            class="info-button"
            onClick={() => setShowI18nInfo(!showI18nInfo())}
          >
            {showI18nInfo() ? "Hide" : "Show"} i18n Status
          </button>
          
          <Show when={showI18nInfo()}>
            <div class="i18n-info">
              <h3>i18n System Status</h3>
              <p><strong>i18n Available:</strong> {isI18nAvailable() ? "Yes" : "No"}</p>
              <p><strong>i18n Module:</strong> {getI18nModule() ? "Loaded" : "Not Available"}</p>
              <p><strong>Fallback Mode:</strong> {!isI18nAvailable() ? "Active" : "Inactive"}</p>
            </div>
          </Show>
        </div>
      </div>

      <div class="demo-sections">
        {/* Translation Function Demo */}
        <section class="demo-section">
          <h2>Translation Function Demo</h2>
          <div class="translation-grid">
            <For each={translationExamples}>
              {(example) => (
                <div class="translation-item">
                  <strong>{example.label}:</strong> {t(example.key)}
                </div>
              )}
            </For>
          </div>
        </section>

        {/* Chart Type Names Demo */}
        <section class="demo-section">
          <h2>Chart Type Names</h2>
          <div class="chart-types">
            <For each={chartTypes}>
              {(type) => (
                <div class="chart-type-item">
                  <strong>{type}:</strong> {getChartTypeName(type)}
                </div>
              )}
            </For>
          </div>
        </section>

        {/* Quality Assessments Demo */}
        <section class="demo-section">
          <h2>Quality Assessments</h2>
          <div class="quality-assessments">
            <For each={qualityLevels}>
              {(quality) => (
                <div class={`quality-item ${quality}`}>
                  <strong>{quality}:</strong> {getQualityText(quality)}
                </div>
              )}
            </For>
          </div>
        </section>

        {/* Statistics Labels Demo */}
        <section class="demo-section">
          <h2>Statistics Labels</h2>
          <div class="statistics-labels">
            <For each={statisticsLabels}>
              {(stat) => (
                <div class="stat-item">
                  <strong>{stat}:</strong> {getStatisticsLabel(stat)}
                </div>
              )}
            </For>
          </div>
        </section>

        {/* Interactive Chart Demo */}
        <section class="demo-section">
          <h2>Interactive Chart Demo</h2>
          <div class="chart-controls">
            <label for="chart-type">Select Chart Type:</label>
            <select 
              id="chart-type"
              value={selectedChartType()}
              onChange={(e) => setSelectedChartType(e.target.value)}
            >
              <For each={chartTypes}>
                {(type) => (
                  <option value={type}>{getChartTypeName(type)}</option>
                )}
              </For>
            </select>
          </div>
          
          <div class="chart-container">
            <Show when={selectedChartType() === "line"}>
              <Chart
                type="line"
                labels={sampleLineData.labels}
                datasets={sampleLineData.datasets}
                title="Sales Data"
                xAxisLabel={getAxisLabel("x", "Month")}
                yAxisLabel={getAxisLabel("y", "Sales")}
                showLegend={true}
                showGrid={true}
                width={600}
                height={400}
              />
            </Show>
            
            <Show when={selectedChartType() === "bar"}>
              <Chart
                type="bar"
                labels={sampleBarData.labels}
                datasets={sampleBarData.datasets}
                title="Product Revenue"
                xAxisLabel={getAxisLabel("x", "Products")}
                yAxisLabel={getAxisLabel("y", "Revenue ($)")}
                showLegend={true}
                showGrid={true}
                width={600}
                height={400}
              />
            </Show>
          </div>
        </section>
      </div>
    </div>
  );
};