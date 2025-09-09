/**
 * Visualization Engine Core
 * Central engine for managing all visualization types with OKLCH color integration
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import {
  formatOKLCH,
  createTagColorGenerator,
  generateColorsWithCache,
  oklchToCSSWithAlpha,
  type ThemeName,
} from "reynard-color-media";

export interface VisualizationConfig {
  /** Theme for color generation */
  theme?: ThemeName;
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
  /** Performance settings */
  performance?: {
    /** Enable lazy loading */
    lazyLoading?: boolean;
    /** Memory limit in MB */
    memoryLimit?: number;
    /** Frame rate target */
    targetFPS?: number;
  };
}

export interface VisualizationStats {
  /** Total render time in ms */
  renderTime: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** Frame rate */
  fps: number;
  /** Number of active visualizations */
  activeVisualizations: number;
  /** Cache hit rate */
  cacheHitRate: number;
}

export interface ColorPalette {
  /** Primary colors */
  primary: string[];
  /** Secondary colors */
  secondary: string[];
  /** Background colors */
  background: string[];
  /** Text colors */
  text: string[];
  /** Accent colors */
  accent: string[];
}

export class VisualizationEngine {
  private static instance: VisualizationEngine;
  private config: VisualizationConfig;
  private colorCache = new Map<string, string[]>();
  private tagColorGenerator = createTagColorGenerator();
  private stats: VisualizationStats;
  private performanceMonitor: PerformanceMonitor;

  private constructor(config: VisualizationConfig = {}) {
    this.config = {
      theme: "dark",
      baseHue: 0,
      saturation: 0.3,
      lightness: 0.6,
      useOKLCH: true,
      performance: {
        lazyLoading: true,
        memoryLimit: 512,
        targetFPS: 60,
      },
      ...config,
    };

    this.stats = {
      renderTime: 0,
      memoryUsage: 0,
      fps: 60,
      activeVisualizations: 0,
      cacheHitRate: 0,
    };

    this.performanceMonitor = new PerformanceMonitor();
    this.initializePerformanceMonitoring();
  }

  public static getInstance(config?: VisualizationConfig): VisualizationEngine {
    if (!VisualizationEngine.instance) {
      VisualizationEngine.instance = new VisualizationEngine(config);
    }
    return VisualizationEngine.instance;
  }

  /**
   * Generate a color palette with specified number of colors
   */
  public generateColors(count: number, opacity: number = 1): string[] {
    const colors = generateColorsWithCache(
      count,
      this.config.baseHue!,
      this.config.saturation!,
      this.config.lightness!,
      opacity,
      this.config.useOKLCH,
      this.colorCache,
    );

    // Update cache stats for performance monitoring
    const cacheKey = `${count}-${this.config.baseHue}-${this.config.saturation}-${this.config.lightness}-${opacity}-${this.config.useOKLCH}`;
    this.updateCacheStats(this.colorCache.has(cacheKey));

    return colors;
  }

  /**
   * Generate colors for a specific tag/label
   */
  public generateTagColors(
    tags: string[],
    opacity: number = 1,
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const tag of tags) {
      const oklchColor = this.tagColorGenerator.getTagColor(
        this.config.theme!,
        tag,
        1.0,
      );

      if (opacity < 1) {
        result[tag] = oklchToCSSWithAlpha(formatOKLCH(oklchColor), opacity);
      } else {
        result[tag] = formatOKLCH(oklchColor);
      }
    }

    return result;
  }

  /**
   * Generate a complete color palette for a visualization
   */
  public generatePalette(count: number): ColorPalette {
    const primary = this.generateColors(count, 1);
    const secondary = this.generateColors(count, 0.6);
    const background = this.generateColors(3, 0.1);
    const text = this.generateColors(2, 1);
    const accent = this.generateColors(count, 0.8);

    return {
      primary,
      secondary,
      background,
      text,
      accent,
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<VisualizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.colorCache.clear(); // Clear cache when config changes
  }

  /**
   * Get current configuration
   */
  public getConfig(): VisualizationConfig {
    return { ...this.config };
  }

  /**
   * Get current statistics
   */
  public getStats(): VisualizationStats {
    return { ...this.stats };
  }

  /**
   * Register a visualization
   */
  public registerVisualization(): void {
    this.stats.activeVisualizations++;
  }

  /**
   * Unregister a visualization
   */
  public unregisterVisualization(): void {
    this.stats.activeVisualizations = Math.max(
      0,
      this.stats.activeVisualizations - 1,
    );
  }

  /**
   * Update cache statistics
   */
  private updateCacheStats(hit: boolean): void {
    // Simple cache hit rate calculation
    const totalRequests = this.stats.activeVisualizations * 10; // Estimate
    const hits = (this.stats.cacheHitRate * totalRequests) / 100;
    const newHits = hit ? hits + 1 : hits;
    this.stats.cacheHitRate = (newHits / (totalRequests + 1)) * 100;
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window !== "undefined" && "performance" in window) {
      setInterval(() => {
        this.updatePerformanceStats();
      }, 1000);
    }
  }

  /**
   * Update performance statistics
   */
  private updatePerformanceStats(): void {
    if (typeof window !== "undefined" && "performance" in window) {
      const memory = (performance as any).memory;
      if (memory) {
        this.stats.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
      }
    }
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.colorCache.clear();
    this.stats.cacheHitRate = 0;
  }

  /**
   * Get memory usage
   */
  public getMemoryUsage(): number {
    if (typeof window !== "undefined" && "performance" in window) {
      const memory = (performance as any).memory;
      if (memory) {
        return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
      }
    }
    return 0;
  }

  /**
   * Check if memory limit is exceeded
   */
  public isMemoryLimitExceeded(): boolean {
    const memoryUsage = this.getMemoryUsage();
    return memoryUsage > (this.config.performance?.memoryLimit || 512);
  }
}

/**
 * Performance Monitor for tracking visualization performance
 */
class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;

  public startFrame(): void {
    this.frameCount++;
    const now = performance.now();

    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;
    }
  }

  public getFPS(): number {
    return this.fps;
  }
}

/**
 * Hook for using the visualization engine in SolidJS components
 */
export function useVisualizationEngine(config?: VisualizationConfig) {
  const engine = VisualizationEngine.getInstance(config);

  const [stats, setStats] = createSignal<VisualizationStats>(engine.getStats());

  // Update stats periodically
  createEffect(() => {
    const interval = setInterval(() => {
      setStats(engine.getStats());
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  return {
    engine,
    stats,
    generateColors: (count: number, opacity?: number) =>
      engine.generateColors(count, opacity),
    generateTagColors: (tags: string[], opacity?: number) =>
      engine.generateTagColors(tags, opacity),
    generatePalette: (count: number) => engine.generatePalette(count),
    updateConfig: (newConfig: Partial<VisualizationConfig>) =>
      engine.updateConfig(newConfig),
    getConfig: () => engine.getConfig(),
    registerVisualization: () => engine.registerVisualization(),
    unregisterVisualization: () => engine.unregisterVisualization(),
    clearCache: () => engine.clearCache(),
    getMemoryUsage: () => engine.getMemoryUsage(),
    isMemoryLimitExceeded: () => engine.isMemoryLimitExceeded(),
  };
}
