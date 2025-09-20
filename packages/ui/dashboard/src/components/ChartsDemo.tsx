/**
 * Charts Demo Component
 * Integration component that uses both reynard-charts and reynard-components
 */
import { createSignal, createMemo, onMount, onCleanup } from "solid-js";
import { Chart, RealTimeChart, useVisualizationEngine, type RealTimeDataPoint } from "reynard-charts";
import { Button } from "reynard-components-core";
import { fluentIconsPackage } from "reynard-fluent-icons";

export const ChartsDemo = () => {
  const [realTimeData, setRealTimeData] = createSignal<RealTimeDataPoint[]>([]);
  let realTimeInterval: ReturnType<typeof setInterval> | undefined;
  // Initialize visualization engine
  const visualization = useVisualizationEngine({
    theme: "dark",
    useOKLCH: true,
  });
  // Sample data
  const sampleData = createMemo(() => ({
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Performance",
        data: [12, 19, 3, 5, 2],
      },
    ],
  }));
  // Generate real-time data
  const generateRealTimeData = () => {
    const now = Date.now();
    const newPoint = {
      timestamp: now,
      value: Math.random() * 100,
      label: new Date(now).toLocaleTimeString(),
    };
    setRealTimeData(prev => [...prev, newPoint].slice(-10));
  };
  onMount(() => {
    realTimeInterval = setInterval(generateRealTimeData, 2000);
  });
  onCleanup(() => {
    if (realTimeInterval) {
      clearInterval(realTimeInterval);
    }
  });
  const goToChartsShowcase = () => {
    window.location.hash = "charts-showcase";
  };
  return (
    <div class="dashboard-card charts-demo">
      <div class="card-header">
        <h3>
          {fluentIconsPackage.getIcon("chart-multiple") && (
            <span class="card-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("chart-multiple")?.outerHTML}
              />
            </span>
          )}
          Charts Demo
        </h3>
        <Button variant="secondary" onClick={goToChartsShowcase}>
          View Full Showcase
        </Button>
      </div>

      <div class="charts-preview">
        <div class="chart-mini">
          <Chart
            type="line"
            labels={sampleData().labels}
            datasets={sampleData().datasets}
            width={200}
            height={120}
            title="Performance"
          />
        </div>

        <div class="chart-mini">
          <RealTimeChart
            type="line"
            data={realTimeData()}
            title="Live Data"
            maxDataPoints={10}
            updateInterval={2000}
            autoScroll={true}
            width={200}
            height={120}
          />
        </div>
      </div>

      <div class="card-footer">
        <div class="stats-row">
          <span class="stat">
            <strong>{visualization.stats().activeVisualizations}</strong> Active Charts
          </span>
          <span class="stat">
            <strong>{visualization.stats().fps}</strong> FPS
          </span>
        </div>
      </div>
    </div>
  );
};
