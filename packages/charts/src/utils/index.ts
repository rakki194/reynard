/**
 * Chart Utilities
 * Helper functions for chart configuration and data processing
 */

import { ChartType, ChartTheme, Dataset, DEFAULT_COLORS, DEFAULT_THEME } from "../types";

/**
 * Generate a color palette for datasets
 */
export function generateColors(count: number, opacity: number = 1): string[] {
  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    if (i < DEFAULT_COLORS.length) {
      // Use predefined colors with custom opacity
      const color = DEFAULT_COLORS[i];
      const rgba = color.replace(/rgba?\(([^)]+)\)/, (_, values) => {
        const [r, g, b] = values.split(',').map((v: string) => v.trim());
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      });
      colors.push(rgba);
    } else {
      // Generate additional colors using HSL
      const hue = (i * 137.508) % 360; // Golden angle approximation
      colors.push(`hsla(${hue}, 70%, 50%, ${opacity})`);
    }
  }
  
  return colors;
}

/**
 * Apply theme colors to chart configuration
 */
export function applyTheme(theme: Partial<ChartTheme> = {}): ChartTheme {
  return { ...DEFAULT_THEME, ...theme };
}

/**
 * Format number values for display
 */
export function formatValue(value: number, type: "number" | "currency" | "percentage" = "number"): string {
  switch (type) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    case "percentage":
      return `${(value * 100).toFixed(1)}%`;
    default:
      return new Intl.NumberFormat("en-US").format(value);
  }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number, format: "time" | "date" | "datetime" = "datetime"): string {
  const date = new Date(timestamp);
  
  switch (format) {
    case "time":
      return date.toLocaleTimeString();
    case "date":
      return date.toLocaleDateString();
    default:
      return date.toLocaleString();
  }
}

/**
 * Prepare datasets with automatic color assignment
 */
export function prepareDatasets(datasets: Partial<Dataset>[]): Dataset[] {
  const colors = generateColors(datasets.length);
  const backgroundColors = generateColors(datasets.length, 0.6);
  
  return datasets.map((dataset, index) => ({
    label: dataset.label || `Dataset ${index + 1}`,
    data: dataset.data || [],
    ...dataset,
    backgroundColor: dataset.backgroundColor || backgroundColors[index],
    borderColor: dataset.borderColor || colors[index],
    borderWidth: dataset.borderWidth || 2,
  } as Dataset));
}

/**
 * Get default chart configuration for a given type
 */
export function getDefaultConfig(type: ChartType, theme?: Partial<ChartTheme>) {
  const appliedTheme = applyTheme(theme);
  
  const baseConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: appliedTheme.text,
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: appliedTheme.background,
        titleColor: appliedTheme.text,
        bodyColor: appliedTheme.text,
        borderColor: appliedTheme.grid,
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
      },
    },
  };

  // Type-specific configurations
  switch (type) {
    case "line":
      return {
        ...baseConfig,
        elements: {
          line: {
            tension: 0.4,
          },
          point: {
            radius: 4,
            hoverRadius: 6,
          },
        },
        scales: {
          x: {
            grid: {
              color: appliedTheme.grid,
              display: true,
            },
            ticks: {
              color: appliedTheme.text,
            },
          },
          y: {
            grid: {
              color: appliedTheme.grid,
              display: true,
            },
            ticks: {
              color: appliedTheme.text,
            },
          },
        },
      };
      
    case "bar":
      return {
        ...baseConfig,
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: appliedTheme.text,
            },
          },
          y: {
            grid: {
              color: appliedTheme.grid,
              display: true,
            },
            ticks: {
              color: appliedTheme.text,
            },
            beginAtZero: true,
          },
        },
      };
      
    case "doughnut":
    case "pie":
      return {
        ...baseConfig,
        plugins: {
          ...baseConfig.plugins,
          legend: {
            ...baseConfig.plugins.legend,
            position: "right" as const,
          },
        },
      };
      
    default:
      return baseConfig;
  }
}

/**
 * Debounce function for chart updates
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Calculate chart dimensions based on container
 */
export function calculateDimensions(
  container: HTMLElement,
  aspectRatio: number = 2
): { width: number; height: number } {
  const containerWidth = container.clientWidth;
  const width = Math.max(containerWidth, 300);
  const height = Math.max(width / aspectRatio, 200);
  
  return { width, height };
}

/**
 * Validate chart data
 */
export function validateChartData(datasets: Dataset[], labels?: string[]): boolean {
  if (!Array.isArray(datasets) || datasets.length === 0) {
    return false;
  }
  
  for (const dataset of datasets) {
    if (!Array.isArray(dataset.data) || dataset.data.length === 0) {
      return false;
    }
    
    if (labels && dataset.data.length !== labels.length) {
      return false;
    }
  }
  
  return true;
}

/**
 * Process time series data for line charts
 */
export function processTimeSeriesData(
  data: Array<{ timestamp: number; value: number; label?: string }>,
  maxPoints: number = 100
): { labels: string[]; data: number[] } {
  // Sort by timestamp
  const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
  
  // Limit data points for performance
  const limitedData = sortedData.slice(-maxPoints);
  
  return {
    labels: limitedData.map(item => item.label || formatTimestamp(item.timestamp, "time")),
    data: limitedData.map(item => item.value),
  };
}

/**
 * Aggregate data by time intervals
 */
export function aggregateByInterval(
  data: Array<{ timestamp: number; value: number }>,
  intervalMs: number
): Array<{ timestamp: number; value: number; count: number }> {
  const aggregated = new Map<number, { sum: number; count: number }>();
  
  for (const item of data) {
    const intervalStart = Math.floor(item.timestamp / intervalMs) * intervalMs;
    const existing = aggregated.get(intervalStart) || { sum: 0, count: 0 };
    
    aggregated.set(intervalStart, {
      sum: existing.sum + item.value,
      count: existing.count + 1,
    });
  }
  
  return Array.from(aggregated.entries())
    .map(([timestamp, { sum, count }]) => ({
      timestamp,
      value: sum / count, // Average
      count,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}
