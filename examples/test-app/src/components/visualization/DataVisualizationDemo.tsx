/**
 * 🦊 Data Visualization Demo
 * Comprehensive demo showcasing 2D and 3D visualizations with shared data processing
 */

import { Component, createSignal, onMount } from "solid-js";
import { Card, Button, Select, Slider } from "reynard-components";
import { getIcon } from "reynard-fluent-icons";
import { Visualization2D } from "./Visualization2D";
import { Visualization3D } from "./Visualization3D";
import { DataProcessor } from "./DataProcessor";
import { type VisualizationConfig, type DataPoint } from "./VisualizationCore";

export const DataVisualizationDemo: Component = () => {
  // State
  const [activeView, setActiveView] = createSignal<"2d" | "3d" | "both">(
    "both",
  );
  const [dataType, setDataType] = createSignal<
    "random" | "spiral" | "clusters"
  >("spiral");
  const [dataPoints, setDataPoints] = createSignal<DataPoint[]>([]);
  const [pointCount, setPointCount] = createSignal(500);
  const [colorMapping, setColorMapping] = createSignal<
    "value" | "cluster" | "category" | "gradient"
  >("value");
  const [theme, setTheme] = createSignal<"dark" | "light" | "gray">("dark");

  // Generate new data
  const generateData = () => {
    const newData = DataProcessor.generateSampleData(pointCount(), dataType());
    setDataPoints(newData);
  };

  // Get visualization config
  const getVisualizationConfig = (): Partial<VisualizationConfig> => ({
    theme: theme(),
    colorMapping: colorMapping(),
    baseHue: 200,
    saturation: 0.7,
    lightness: 0.6,
    useOKLCH: true,
    performance: {
      maxPoints: 10000,
      enableLOD: true,
      targetFPS: 60,
    },
  });

  // Lifecycle
  onMount(() => {
    generateData();
  });

  return (
    <div class="data-visualization-demo">
      <Card class="demo-container">
        <div class="demo-header">
          <h2>🦊 Data Visualization Showcase</h2>
          <p>
            Interactive 2D and 3D visualizations with shared OKLCH color
            processing
          </p>
        </div>

        <div class="demo-controls">
          <div class="control-section">
            <h4>Data Generation</h4>
            <div class="control-row">
              <div class="control-item">
                <label>Data Type:</label>
                <Select
                  value={dataType()}
                  onChange={(value) => setDataType(value as any)}
                  options={[
                    { value: "random", label: "Random Points" },
                    { value: "spiral", label: "Spiral Pattern" },
                    { value: "clusters", label: "Clustered Data" },
                  ]}
                />
              </div>

              <div class="control-item">
                <label for="point-count-slider">Point Count:</label>
                <Slider
                  id="point-count-slider"
                  min={100}
                  max={2000}
                  step={100}
                  value={pointCount()}
                  onChange={(e: any) => setPointCount(parseInt(e.target.value))}
                />
                <span class="value-display">{pointCount()}</span>
              </div>

              <Button
                variant="primary"
                onClick={generateData}
                leftIcon={getIcon("refresh")}
              >
                Generate Data
              </Button>
            </div>
          </div>

          <div class="control-section">
            <h4>Visualization Settings</h4>
            <div class="control-row">
              <div class="control-item">
                <label>View Mode:</label>
                <Select
                  value={activeView()}
                  onChange={(value) => setActiveView(value as any)}
                  options={[
                    { value: "2d", label: "2D Only" },
                    { value: "3d", label: "3D Only" },
                    { value: "both", label: "Side by Side" },
                  ]}
                />
              </div>

              <div class="control-item">
                <label>Color Mapping:</label>
                <Select
                  value={colorMapping()}
                  onChange={(value) => setColorMapping(value as any)}
                  options={[
                    { value: "value", label: "By Value" },
                    { value: "cluster", label: "By Cluster" },
                    { value: "category", label: "By Category" },
                    { value: "gradient", label: "Gradient" },
                  ]}
                />
              </div>

              <div class="control-item">
                <label>Theme:</label>
                <Select
                  value={theme()}
                  onChange={(value) => setTheme(value as any)}
                  options={[
                    { value: "dark", label: "Dark" },
                    { value: "light", label: "Light" },
                    { value: "gray", label: "Gray" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        <div class="demo-content">
          {activeView() === "2d" && (
            <div class="visualization-single">
              <Visualization2D
                data={dataPoints()}
                config={getVisualizationConfig()}
                width={800}
                height={600}
                enableAnimation={true}
                showControls={true}
              />
            </div>
          )}

          {activeView() === "3d" && (
            <div class="visualization-single">
              <Visualization3D
                data={dataPoints()}
                config={getVisualizationConfig()}
                width={800}
                height={600}
                enableAnimation={true}
                showControls={true}
              />
            </div>
          )}

          {activeView() === "both" && (
            <div class="visualization-grid">
              <div class="visualization-item">
                <h4>2D Visualization</h4>
                <Visualization2D
                  data={dataPoints()}
                  config={getVisualizationConfig()}
                  width={400}
                  height={300}
                  enableAnimation={true}
                  showControls={false}
                />
              </div>

              <div class="visualization-item">
                <h4>3D Visualization</h4>
                <Visualization3D
                  data={dataPoints()}
                  config={getVisualizationConfig()}
                  width={400}
                  height={300}
                  enableAnimation={true}
                  showControls={false}
                />
              </div>
            </div>
          )}
        </div>

        <div class="demo-info">
          <div class="info-section">
            <h4>🦊 Features Demonstrated</h4>
            <ul>
              <li>
                <strong>Shared Data Processing:</strong> Both 2D and 3D
                visualizations use the same data processing pipeline
              </li>
              <li>
                <strong>OKLCH Color Management:</strong> Consistent,
                perceptually uniform colors across all visualizations
              </li>
              <li>
                <strong>Real-time Clustering:</strong> Automatic K-means
                clustering with visual cluster representation
              </li>
              <li>
                <strong>Interactive Controls:</strong> Zoom, pan, and camera
                controls for both 2D and 3D views
              </li>
              <li>
                <strong>Performance Optimization:</strong> Efficient rendering
                with animation engines and LOD
              </li>
              <li>
                <strong>Modular Architecture:</strong> Reusable components that
                can be shared between packages
              </li>
            </ul>
          </div>

          <div class="info-section">
            <h4>🎨 Color Mapping Options</h4>
            <ul>
              <li>
                <strong>By Value:</strong> Colors based on data point values
              </li>
              <li>
                <strong>By Cluster:</strong> Colors assigned to clusters using
                golden angle distribution
              </li>
              <li>
                <strong>By Category:</strong> Colors based on categorical
                metadata
              </li>
              <li>
                <strong>Gradient:</strong> Radial gradient from center based on
                distance
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
