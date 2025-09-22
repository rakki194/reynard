/**
 * Chart Data Processor
 * Handles dataset processing and color generation for charts
 */

import { Dataset } from "../types";

export interface ColorGenerator {
  generateColors: (count: number, alpha?: number) => string[];
}

export interface ChartInstance {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[] | Array<{ x: number | string; y: number }> | any[];
      label?: string;
    }>;
  };
  update: (mode?: string) => void;
}

export interface DataProcessorConfig {
  datasets: Dataset[];
  useOKLCH: boolean;
  colorTheme: string;
  colorGenerator?: (theme: string, label: string) => string;
  visualization: ColorGenerator;
}

/**
 * Get default color palette
 */
function getDefaultColors(): string[] {
  return [
    "rgba(54, 162, 235, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(255, 205, 86, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
  ];
}

/**
 * Generate colors for a dataset
 */
function generateDatasetColors(
  index: number,
  colorGenerator: ((theme: string, label: string) => string) | undefined,
  colorTheme: string,
  datasetLabel: string,
  useOKLCH: boolean,
  visualization: ColorGenerator,
  datasetsLength: number
): { backgroundColor: string; borderColor: string } {
  if (colorGenerator) {
    const color = colorGenerator(colorTheme, datasetLabel);
    return { backgroundColor: color, borderColor: color };
  }

  if (useOKLCH) {
    const colors = visualization.generateColors(datasetsLength);
    if (colors && colors.length > index) {
      return {
        backgroundColor: colors[index]?.replace("1)", "0.6)") || "rgba(54, 162, 235, 0.6)",
        borderColor: colors[index] || "rgba(54, 162, 235, 1)",
      };
    }
    if (colors && colors.length > 0) {
      return {
        backgroundColor: colors[0]?.replace("1)", "0.6)") || "rgba(54, 162, 235, 0.6)",
        borderColor: colors[0] || "rgba(54, 162, 235, 1)",
      };
    }
  }

  const defaultColors = getDefaultColors();
  return {
    backgroundColor: defaultColors[index]?.replace("1)", "0.6)") || "rgba(54, 162, 235, 0.6)",
    borderColor: defaultColors[index] || "rgba(54, 162, 235, 1)",
  };
}

/**
 * Process datasets with enhanced color generation
 */
export function processDatasets(config: DataProcessorConfig): Dataset[] {
  const { datasets, useOKLCH, colorTheme, colorGenerator, visualization } = config;

  return datasets.map((dataset, index) => {
    const { backgroundColor, borderColor } = generateDatasetColors(
      index,
      colorGenerator,
      colorTheme,
      dataset.label,
      useOKLCH,
      visualization,
      datasets.length
    );

    return {
      ...dataset,
      backgroundColor: dataset.backgroundColor || backgroundColor,
      borderColor: dataset.borderColor || borderColor,
      borderWidth: dataset.borderWidth || 2,
      pointBackgroundColor: dataset.pointBackgroundColor || borderColor,
      pointBorderColor: dataset.pointBorderColor || "#fff",
      pointBorderWidth: dataset.pointBorderWidth || 1,
      pointRadius: dataset.pointRadius || 4,
      pointHoverRadius: dataset.pointHoverRadius || 6,
      tension: dataset.tension || 0.1,
      fill: dataset.fill || false,
    };
  });
}

/**
 * Create chart data object
 */
export function createChartData(labels: string[], datasets: Dataset[]) {
  return {
    labels,
    datasets,
  };
}

/**
 * Update chart data incrementally for real-time updates
 */
export function updateChartDataIncremental(chart: ChartInstance, labels: string[], datasets: Dataset[]) {
  // Update labels directly
  if (labels && labels.length > 0) {
    chart.data.labels = [...labels];
  }

  // Update datasets directly
  if (datasets && datasets.length > 0) {
    datasets.forEach((dataset, datasetIndex) => {
      if (chart.data.datasets[datasetIndex]) {
        // Update data array directly
        chart.data.datasets[datasetIndex].data = [...dataset.data];

        // Update other properties if they changed
        if (dataset.label) {
          chart.data.datasets[datasetIndex].label = dataset.label;
        }
      }
    });
  }

  // Update chart without animations to prevent reset-to-zero effect
  chart.update("none");
}
