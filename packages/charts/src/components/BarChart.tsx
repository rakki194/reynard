/**
 * Bar Chart Component
 * A responsive bar chart for categorical data
 */

import { Component, Show, splitProps } from "solid-js";
import { Bar } from "solid-chartjs";
import { Dataset, ChartConfig, ReynardTheme } from "../types";
import { useBarChart } from "../composables/useBarChart";
import { BarChartData } from "../utils/barChartData";
import { createBarChartOptions } from "../utils/barChartConfig";
import "./BarChart.css";

export interface BarChartProps extends ChartConfig {
  /** Chart labels */
  labels: string[];
  /** Chart datasets */
  datasets: Dataset[];
  /** Whether bars are horizontal */
  horizontal?: boolean;
  /** Whether bars are stacked */
  stacked?: boolean;
  /** Custom class name */
  class?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Theme for the chart */
  theme?: ReynardTheme;
}

const defaultProps = {
  width: 400,
  height: 300,
  showGrid: true,
  showLegend: true,
  responsive: true,
  maintainAspectRatio: false,
  horizontal: false,
  stacked: false,
  emptyMessage: "No data available",
  theme: "light" as ReynardTheme,
};

const getContainerClasses = (
  horizontal: boolean,
  stacked: boolean,
  customClass?: string,
) => {
  const classes = ["reynard-bar-chart"];
  if (horizontal) classes.push("reynard-bar-chart--horizontal");
  if (stacked) classes.push("reynard-bar-chart--stacked");
  if (customClass) classes.push(customClass);
  return classes.join(" ");
};

const BarChartContent: Component<{
  chartData: BarChartData | null;
  isRegistered: boolean;
  loading: boolean;
  emptyMessage: string;
  width: number;
  height: number;
  options: ReturnType<typeof createBarChartOptions>;
}> = (props) => {
  return (
    <>
      <Show when={props.loading}>
        <div class="reynard-chart-loading">
          <div class="reynard-chart-spinner" />
          <span>Loading chart...</span>
        </div>
      </Show>

      <Show when={!props.loading && !props.chartData}>
        <div class="reynard-chart-empty">
          <span>{props.emptyMessage}</span>
        </div>
      </Show>

      <Show when={!props.loading && props.chartData && props.isRegistered}>
        <Bar
          data={props.chartData!}
          options={props.options}
          width={props.width}
          height={props.height}
        />
      </Show>
    </>
  );
};

export const BarChart: Component<BarChartProps> = (props) => {
  const merged = { ...defaultProps, ...props };
  const [local, others] = splitProps(merged, [
    "labels",
    "datasets",
    "title",
    "width",
    "height",
    "showGrid",
    "showLegend",
    "responsive",
    "maintainAspectRatio",
    "horizontal",
    "stacked",
    "xAxis",
    "yAxis",
    "colors",
    "class",
    "loading",
    "emptyMessage",
    "animation",
    "tooltip",
    "theme",
  ]);

  const { isRegistered, chartData, chartOptions } = useBarChart(merged);

  return (
    <div
      class={getContainerClasses(local.horizontal, local.stacked, local.class)}
      classList={{
        "reynard-bar-chart--responsive": local.responsive,
        "reynard-bar-chart--fixed-width": !local.responsive,
      }}
      data-width={local.width}
      data-height={local.height}
      role="img"
      aria-label={local.title || "bar chart"}
      {...others}
    >
      <BarChartContent
        chartData={chartData()}
        isRegistered={isRegistered()}
        loading={local.loading || false}
        emptyMessage={local.emptyMessage}
        width={local.width}
        height={local.height}
        options={chartOptions()!}
      />
    </div>
  );
};
