/**
 * Statistical Analysis Section
 * Displays statistical charts and analysis tools
 */

import { Component } from "solid-js";
import {
  StatisticalChart,
  type StatisticalData,
  type QualityData,
} from "reynard-charts";

interface ChartsStatisticalSectionProps {
  statisticalData: StatisticalData;
  qualityData: QualityData;
  selectedTheme: string;
}

export const ChartsStatisticalSection: Component<
  ChartsStatisticalSectionProps
> = (props) => {
  return (
    <div class="statistical-section">
      <h2>Statistical Analysis</h2>
      <div class="statistical-grid">
        <div class="statistical-card">
          <h3>Data Distribution</h3>
          <StatisticalChart
            type="histogram"
            data={props.statisticalData}
            title="Value Distribution"
            numBins={15}
            showStatistics={true}
          />
        </div>

        <div class="statistical-card">
          <h3>Box Plot Analysis</h3>
          <StatisticalChart
            type="boxplot"
            data={props.statisticalData}
            title="Statistical Summary"
            showStatistics={true}
          />
        </div>

        <div class="statistical-card">
          <h3>Quality Metrics</h3>
          <StatisticalChart
            type="quality-bar"
            data={props.qualityData}
            title="Quality Assessment"
            showAssessment={true}
          />
        </div>

        <div class="statistical-card">
          <h3>Overall Quality Score</h3>
          <StatisticalChart
            type="quality-gauge"
            data={props.qualityData}
            title="Quality Score"
          />
        </div>
      </div>
    </div>
  );
};
