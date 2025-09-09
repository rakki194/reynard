/**
 * Real-time Charts Section
 * Displays live data visualization charts
 */

import { Component } from "solid-js";
import { RealTimeChart, type RealTimeDataPoint } from "reynard-charts";

interface ChartsRealtimeSectionProps {
  realTimeData: RealTimeDataPoint[];
  performanceData: RealTimeDataPoint[];
  memoryData: RealTimeDataPoint[];
  selectedTheme: string;
  performanceMonitoring: boolean;
}

export const ChartsRealtimeSection: Component<ChartsRealtimeSectionProps> = (
  props,
) => {
  return (
    <div class="realtime-section">
      <h2>Real-time Data Visualization</h2>
      <div class="realtime-grid">
        <div class="realtime-card">
          <h3>Live Performance Metrics</h3>
          <RealTimeChart
            type="line"
            data={props.realTimeData}
            title="System Performance"
            maxDataPoints={30}
            updateInterval={1000}
            autoScroll={true}
            enablePerformanceMonitoring={props.performanceMonitoring}
          />
        </div>

        <div class="realtime-card">
          <h3>FPS Monitoring</h3>
          <RealTimeChart
            type="line"
            data={props.performanceData}
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
            data={props.memoryData}
            title="Memory Consumption"
            maxDataPoints={15}
            updateInterval={3000}
            autoScroll={true}
            yAxisLabel="MB"
          />
        </div>
      </div>
    </div>
  );
};
