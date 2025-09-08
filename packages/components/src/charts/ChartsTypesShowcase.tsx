/**
 * Chart Types Showcase
 * Displays different chart types with sample data
 */

import { Component } from "solid-js";
import { Chart } from "reynard-charts";

interface ChartsTypesShowcaseProps {
  sampleData: {
    sales: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
      }>;
    };
    revenue: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
      }>;
    };
    distribution: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
      }>;
    };
  };
  selectedTheme: string;
}

export const ChartsTypesShowcase: Component<ChartsTypesShowcaseProps> = (props) => {
  return (
    <div class="chart-types-section">
      <h2>Chart Types</h2>
      <div class="charts-grid">
        <div class="chart-card">
          <h3>Line Chart</h3>
          <Chart
            type="line"
            labels={props.sampleData.sales.labels}
            datasets={props.sampleData.sales.datasets}
            width={300}
            height={200}
            title="Sales Trend"
            useOKLCH={true}
            colorTheme={props.selectedTheme}
          />
        </div>

        <div class="chart-card">
          <h3>Bar Chart</h3>
          <Chart
            type="bar"
            labels={props.sampleData.revenue.labels}
            datasets={props.sampleData.revenue.datasets}
            width={300}
            height={200}
            title="Quarterly Revenue"
            useOKLCH={true}
            colorTheme={props.selectedTheme}
          />
        </div>

        <div class="chart-card">
          <h3>Doughnut Chart</h3>
          <Chart
            type="doughnut"
            labels={props.sampleData.distribution.labels}
            datasets={props.sampleData.distribution.datasets}
            width={300}
            height={200}
            title="Traffic Distribution"
            useOKLCH={true}
            colorTheme={props.selectedTheme}
          />
        </div>

        <div class="chart-card">
          <h3>Pie Chart</h3>
          <Chart
            type="pie"
            labels={['Desktop', 'Mobile', 'Tablet']}
            datasets={[{
              label: 'Users',
              data: [60, 30, 10],
            }]}
            width={300}
            height={200}
            title="User Devices"
            useOKLCH={true}
            colorTheme={props.selectedTheme}
          />
        </div>
      </div>
    </div>
  );
};
