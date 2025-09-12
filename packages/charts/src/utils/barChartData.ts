/**
 * Bar Chart Data Processing Utilities
 * Handles data validation and processing for bar charts
 */

import { Dataset } from "../types";
import { prepareDatasets, validateChartData } from "./chartUtils";

export interface BarChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface BarChartDataOptions {
  labels: string[];
  datasets: Dataset[];
}

export const processBarChartData = (options: BarChartDataOptions): BarChartData | null => {
  if (!options.labels || !options.datasets) {
    return null;
  }

  if (!validateChartData(options.datasets, options.labels)) {
    return null;
  }

  const processedDatasets = prepareDatasets(options.datasets);
  
  return {
    labels: options.labels,
    datasets: processedDatasets,
  };
};
