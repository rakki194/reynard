/**
 * Chart Utilities
 * Helper functions for chart configuration and data processing
 */
import { ChartType, ChartTheme, Dataset } from "../types";
/**
 * Generate a color palette for datasets
 */
export declare function generateColors(
  count: number,
  opacity?: number,
): string[];
/**
 * Apply theme colors to chart configuration
 */
export declare function applyTheme(theme?: Partial<ChartTheme>): ChartTheme;
/**
 * Format number values for display
 */
export declare function formatValue(
  value: number,
  type?: "number" | "currency" | "percentage",
): string;
/**
 * Format timestamp for display
 */
export declare function formatTimestamp(
  timestamp: number,
  format?: "time" | "date" | "datetime",
): string;
/**
 * Prepare datasets with automatic color assignment
 */
export declare function prepareDatasets(
  datasets: Partial<Dataset>[],
): Dataset[];
/**
 * Get default chart configuration for a given type
 */
export declare function getDefaultConfig(
  type: ChartType,
  theme?: Partial<ChartTheme>,
):
  | {
      responsive: boolean;
      maintainAspectRatio: boolean;
      plugins: {
        legend: {
          display: boolean;
          labels: {
            color: string;
            usePointStyle: boolean;
            padding: number;
          };
        };
        tooltip: {
          backgroundColor: string;
          titleColor: string;
          bodyColor: string;
          borderColor: string;
          borderWidth: number;
          cornerRadius: number;
          displayColors: boolean;
        };
      };
    }
  | {
      elements: {
        line: {
          tension: number;
        };
        point: {
          radius: number;
          hoverRadius: number;
        };
      };
      scales: {
        x: {
          grid: {
            color: string;
            display: boolean;
          };
          ticks: {
            color: string;
          };
        };
        y: {
          grid: {
            color: string;
            display: boolean;
          };
          ticks: {
            color: string;
          };
          beginAtZero?: undefined;
        };
      };
      responsive: boolean;
      maintainAspectRatio: boolean;
      plugins: {
        legend: {
          display: boolean;
          labels: {
            color: string;
            usePointStyle: boolean;
            padding: number;
          };
        };
        tooltip: {
          backgroundColor: string;
          titleColor: string;
          bodyColor: string;
          borderColor: string;
          borderWidth: number;
          cornerRadius: number;
          displayColors: boolean;
        };
      };
    }
  | {
      scales: {
        x: {
          grid: {
            display: boolean;
            color?: undefined;
          };
          ticks: {
            color: string;
          };
        };
        y: {
          grid: {
            color: string;
            display: boolean;
          };
          ticks: {
            color: string;
          };
          beginAtZero: boolean;
        };
      };
      responsive: boolean;
      maintainAspectRatio: boolean;
      plugins: {
        legend: {
          display: boolean;
          labels: {
            color: string;
            usePointStyle: boolean;
            padding: number;
          };
        };
        tooltip: {
          backgroundColor: string;
          titleColor: string;
          bodyColor: string;
          borderColor: string;
          borderWidth: number;
          cornerRadius: number;
          displayColors: boolean;
        };
      };
    }
  | {
      plugins: {
        legend: {
          position: "right";
          display: boolean;
          labels: {
            color: string;
            usePointStyle: boolean;
            padding: number;
          };
        };
        tooltip: {
          backgroundColor: string;
          titleColor: string;
          bodyColor: string;
          borderColor: string;
          borderWidth: number;
          cornerRadius: number;
          displayColors: boolean;
        };
      };
      responsive: boolean;
      maintainAspectRatio: boolean;
    };
/**
 * Debounce function for chart updates
 */
export declare function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void;
/**
 * Calculate chart dimensions based on container
 */
export declare function calculateDimensions(
  container: HTMLElement,
  aspectRatio?: number,
): {
  width: number;
  height: number;
};
/**
 * Validate chart data
 */
export declare function validateChartData(
  datasets: Dataset[],
  labels?: string[],
): boolean;
/**
 * Process time series data for line charts
 */
export declare function processTimeSeriesData(
  data: Array<{
    timestamp: number;
    value: number;
    label?: string;
  }>,
  maxPoints?: number,
): {
  labels: string[];
  data: number[];
};
/**
 * Aggregate data by time intervals
 */
export declare function aggregateByInterval(
  data: Array<{
    timestamp: number;
    value: number;
  }>,
  intervalMs: number,
): Array<{
  timestamp: number;
  value: number;
  count: number;
}>;
