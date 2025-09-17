/**
 * Chart Engine Core
 * Central engine for managing chart instances and configurations
 */

// SolidJS imports removed as they're not used in this class
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  registerables,
} from "chart.js";
import { generateColorsWithCache } from "reynard-colors";
import { ChartTheme, Dataset, ChartType } from "../types";

export interface ChartEngineConfig {
  /** Theme for color generation */
  theme?: string;
  /** Base hue for color palette generation */
  baseHue?: number;
  /** Saturation for generated colors */
  saturation?: number;
  /** Lightness for generated colors */
  lightness?: number;
  /** Whether to use OKLCH colors */
  useOKLCH?: boolean;
  /** Custom color palette */
  customColors?: string[];
}

export class ChartEngine {
  private static instance: ChartEngine;
  private isRegistered = false;
  private colorCache = new Map<string, string[]>();
  private config: ChartEngineConfig;

  private constructor(config: ChartEngineConfig = {}) {
    this.config = {
      theme: "dark",
      baseHue: 0,
      saturation: 0.3,
      lightness: 0.6,
      useOKLCH: true,
      ...config,
    };
  }

  public static getInstance(config?: ChartEngineConfig): ChartEngine {
    if (!ChartEngine.instance) {
      ChartEngine.instance = new ChartEngine(config);
    }
    return ChartEngine.instance;
  }

  public register(): void {
    if (!this.isRegistered) {
      ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Title,
        Tooltip,
        Legend,
        Filler,
        ...registerables
      );
      this.isRegistered = true;
    }
  }

  public generateColors(count: number, opacity: number = 1): string[] {
    return generateColorsWithCache(
      count,
      this.config.baseHue!,
      this.config.saturation!,
      this.config.lightness!,
      opacity,
      this.config.useOKLCH,
      this.colorCache
    );
  }

  public prepareDatasets(datasets: Partial<Dataset>[]): Dataset[] {
    const colors = this.generateColors(datasets.length);
    const backgroundColors = this.generateColors(datasets.length, 0.6);

    return datasets.map((dataset, index) => ({
      label: dataset.label || `Dataset ${index + 1}`,
      data: dataset.data || [],
      ...dataset,
      backgroundColor: dataset.backgroundColor || backgroundColors[index],
      borderColor: dataset.borderColor || colors[index],
      borderWidth: dataset.borderWidth || 2,
    })) as Dataset[];
  }

  public getDefaultConfig(type: ChartType, theme?: Partial<ChartTheme>) {
    const appliedTheme = theme || {};
    const colors = this.generateColors(1);

    const baseConfig = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: appliedTheme.text || colors[0],
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          backgroundColor: appliedTheme.background || "rgba(0, 0, 0, 0.8)",
          titleColor: appliedTheme.text || "#ffffff",
          bodyColor: appliedTheme.text || "#ffffff",
          borderColor: appliedTheme.grid || "rgba(255, 255, 255, 0.2)",
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
                color: appliedTheme.grid || "rgba(255, 255, 255, 0.1)",
                display: true,
              },
              ticks: {
                color: appliedTheme.text || "#ffffff",
              },
            },
            y: {
              grid: {
                color: appliedTheme.grid || "rgba(255, 255, 255, 0.1)",
                display: true,
              },
              ticks: {
                color: appliedTheme.text || "#ffffff",
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
                color: appliedTheme.text || "#ffffff",
              },
            },
            y: {
              grid: {
                color: appliedTheme.grid || "rgba(255, 255, 255, 0.1)",
                display: true,
              },
              ticks: {
                color: appliedTheme.text || "#ffffff",
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

  public updateConfig(newConfig: Partial<ChartEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.colorCache.clear(); // Clear cache when config changes
  }

  public getConfig(): ChartEngineConfig {
    return { ...this.config };
  }
}
