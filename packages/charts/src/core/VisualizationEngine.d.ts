/**
 * Visualization Engine Core
 * Central engine for managing all visualization types with OKLCH color integration
 */
import { type ThemeName } from "reynard-colors";
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
export declare class VisualizationEngine {
    private static instance;
    private config;
    private colorCache;
    private tagColorGenerator;
    private stats;
    private performanceMonitor;
    private constructor();
    static getInstance(config?: VisualizationConfig): VisualizationEngine;
    /**
     * Generate a color palette with specified number of colors
     */
    generateColors(count: number, opacity?: number): string[];
    /**
     * Generate colors for a specific tag/label
     */
    generateTagColors(tags: string[], opacity?: number): Record<string, string>;
    /**
     * Generate a complete color palette for a visualization
     */
    generatePalette(count: number): ColorPalette;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<VisualizationConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): VisualizationConfig;
    /**
     * Get current statistics
     */
    getStats(): VisualizationStats;
    /**
     * Register a visualization
     */
    registerVisualization(): void;
    /**
     * Unregister a visualization
     */
    unregisterVisualization(): void;
    /**
     * Update cache statistics
     */
    private updateCacheStats;
    /**
     * Initialize performance monitoring
     */
    private initializePerformanceMonitoring;
    /**
     * Update performance statistics
     */
    private updatePerformanceStats;
    /**
     * Clear all caches
     */
    clearCache(): void;
    /**
     * Get memory usage
     */
    getMemoryUsage(): number;
    /**
     * Check if memory limit is exceeded
     */
    isMemoryLimitExceeded(): boolean;
}
/**
 * Hook for using the visualization engine in SolidJS components
 */
export declare function useVisualizationEngine(config?: VisualizationConfig): {
    engine: VisualizationEngine;
    stats: import("solid-js").Accessor<VisualizationStats>;
    generateColors: (count: number, opacity?: number) => string[];
    generateOKLCHColors: (count: number, theme?: string) => string[];
    generateTagColors: (tags: string[], opacity?: number) => Record<string, string>;
    generatePalette: (count: number) => ColorPalette;
    updateConfig: (newConfig: Partial<VisualizationConfig>) => void;
    getConfig: () => VisualizationConfig;
    registerVisualization: () => void;
    unregisterVisualization: () => void;
    clearCache: () => void;
    getMemoryUsage: () => number;
    isMemoryLimitExceeded: () => boolean;
};
