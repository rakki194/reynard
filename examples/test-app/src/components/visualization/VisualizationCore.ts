/**
 * 🦊 Visualization Core
 * Shared utilities for 2D and 3D data visualization with OKLCH colors
 */

// import { createSignal, createMemo } from "solid-js";
import { formatOKLCH, type OKLCHColor, type ThemeName } from "reynard-colors";

export interface DataPoint {
  id: string;
  x: number;
  y: number;
  z?: number;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface VisualizationConfig {
  theme: ThemeName;
  baseHue: number;
  saturation: number;
  lightness: number;
  useOKLCH: boolean;
  colorMapping: "value" | "cluster" | "category" | "gradient";
  performance: {
    maxPoints: number;
    enableLOD: boolean;
    targetFPS: number;
  };
}

export interface ColorMapping {
  point: OKLCHColor;
  css: string;
  intensity: number;
}

export class VisualizationCore {
  private config: VisualizationConfig;
  private colorCache = new Map<string, ColorMapping[]>();

  constructor(config: Partial<VisualizationConfig> = {}) {
    this.config = {
      theme: "dark",
      baseHue: 200,
      saturation: 0.7,
      lightness: 0.6,
      useOKLCH: true,
      colorMapping: "value",
      performance: {
        maxPoints: 10000,
        enableLOD: true,
        targetFPS: 60,
      },
      ...config,
    };
  }

  /**
   * Generate OKLCH colors for data points
   */
  generateColors(dataPoints: DataPoint[]): ColorMapping[] {
    const cacheKey = this.getCacheKey(dataPoints);

    if (this.colorCache.has(cacheKey)) {
      return this.colorCache.get(cacheKey)!;
    }

    const colors = dataPoints.map((point, index) => {
      const oklch = this.calculatePointColor(point, index, dataPoints);
      return {
        point: oklch,
        css: formatOKLCH(oklch),
        intensity: this.calculateIntensity(point, dataPoints),
      };
    });

    this.colorCache.set(cacheKey, colors);
    return colors;
  }

  /**
   * Calculate color for a specific data point
   */
  private calculatePointColor(point: DataPoint, index: number, allPoints: DataPoint[]): OKLCHColor {
    const { baseHue, saturation, lightness } = this.config;

    switch (this.config.colorMapping) {
      case "value":
        return this.getValueBasedColor(point, allPoints);
      case "cluster":
        return this.getClusterBasedColor(point, index);
      case "category":
        return this.getCategoryBasedColor(point);
      case "gradient":
        return this.getGradientBasedColor(point, allPoints);
      default:
        return {
          l: lightness,
          c: saturation,
          h: (baseHue + index * 30) % 360,
        };
    }
  }

  /**
   * Value-based color mapping
   */
  private getValueBasedColor(point: DataPoint, allPoints: DataPoint[]): OKLCHColor {
    const values = allPoints.map(p => p.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const normalizedValue = (point.value - minValue) / (maxValue - minValue);

    return {
      l: 0.3 + normalizedValue * 0.4, // Lightness from 0.3 to 0.7
      c: this.config.saturation,
      h: this.config.baseHue + normalizedValue * 120, // Hue shift
    };
  }

  /**
   * Cluster-based color mapping
   */
  private getClusterBasedColor(_point: DataPoint, index: number): OKLCHColor {
    const clusterHue = (index * 137.5) % 360; // Golden angle distribution

    return {
      l: this.config.lightness,
      c: this.config.saturation,
      h: clusterHue,
    };
  }

  /**
   * Category-based color mapping
   */
  private getCategoryBasedColor(point: DataPoint): OKLCHColor {
    const category = (point.metadata?.category as string) || "default";
    const categoryHash = this.hashString(category);

    return {
      l: this.config.lightness,
      c: this.config.saturation,
      h: categoryHash % 360,
    };
  }

  /**
   * Gradient-based color mapping
   */
  private getGradientBasedColor(point: DataPoint, allPoints: DataPoint[]): OKLCHColor {
    const centerX = allPoints.reduce((sum, p) => sum + p.x, 0) / allPoints.length;
    const centerY = allPoints.reduce((sum, p) => sum + p.y, 0) / allPoints.length;
    const distance = Math.sqrt((point.x - centerX) ** 2 + (point.y - centerY) ** 2);
    const maxDistance = Math.max(...allPoints.map(p => Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2)));
    const normalizedDistance = distance / maxDistance;

    return {
      l: 0.4 + normalizedDistance * 0.3,
      c: this.config.saturation,
      h: this.config.baseHue + normalizedDistance * 180,
    };
  }

  /**
   * Calculate intensity for visual effects
   */
  private calculateIntensity(point: DataPoint, allPoints: DataPoint[]): number {
    const values = allPoints.map(p => p.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    return (point.value - minValue) / (maxValue - minValue);
  }

  /**
   * Generate cache key for color mapping
   */
  private getCacheKey(dataPoints: DataPoint[]): string {
    return `${this.config.colorMapping}-${dataPoints.length}-${dataPoints[0]?.id || "empty"}`;
  }

  /**
   * Hash string for consistent color generation
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VisualizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.colorCache.clear(); // Clear cache when config changes
  }

  /**
   * Get current configuration
   */
  getConfig(): VisualizationConfig {
    return { ...this.config };
  }

  /**
   * Clear color cache
   */
  clearCache(): void {
    this.colorCache.clear();
  }
}
