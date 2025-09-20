/**
 * Visualization Engine Core
 * Central engine for managing all visualization types with OKLCH color integration
 */
import { createTagColorGenerator, formatOKLCH, generateColorsWithCache, oklchToCSSWithAlpha, } from "reynard-colors";
import { createEffect, createSignal, onCleanup } from "solid-js";
export class VisualizationEngine {
    constructor(config = {}) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "colorCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "tagColorGenerator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: createTagColorGenerator()
        });
        Object.defineProperty(this, "stats", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "performanceMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
    static getInstance(config) {
        if (!VisualizationEngine.instance) {
            VisualizationEngine.instance = new VisualizationEngine(config);
        }
        return VisualizationEngine.instance;
    }
    /**
     * Generate a color palette with specified number of colors
     */
    generateColors(count, opacity = 1) {
        const colors = generateColorsWithCache(count, this.config.baseHue, this.config.saturation, this.config.lightness, opacity, this.config.useOKLCH, this.colorCache);
        // Update cache stats for performance monitoring
        const cacheKey = `${count}-${this.config.baseHue}-${this.config.saturation}-${this.config.lightness}-${opacity}-${this.config.useOKLCH}`;
        this.updateCacheStats(this.colorCache.has(cacheKey));
        return colors;
    }
    /**
     * Generate colors for a specific tag/label
     */
    generateTagColors(tags, opacity = 1) {
        const result = {};
        for (const tag of tags) {
            const oklchColor = this.tagColorGenerator.getTagColor(this.config.theme, tag, 1.0);
            if (opacity < 1) {
                result[tag] = oklchToCSSWithAlpha(formatOKLCH(oklchColor), opacity);
            }
            else {
                result[tag] = formatOKLCH(oklchColor);
            }
        }
        return result;
    }
    /**
     * Generate a complete color palette for a visualization
     */
    generatePalette(count) {
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
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.colorCache.clear(); // Clear cache when config changes
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get current statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Register a visualization
     */
    registerVisualization() {
        this.stats.activeVisualizations++;
    }
    /**
     * Unregister a visualization
     */
    unregisterVisualization() {
        this.stats.activeVisualizations = Math.max(0, this.stats.activeVisualizations - 1);
    }
    /**
     * Update cache statistics
     */
    updateCacheStats(hit) {
        // Simple cache hit rate calculation
        const totalRequests = this.stats.activeVisualizations * 10; // Estimate
        const hits = (this.stats.cacheHitRate * totalRequests) / 100;
        const newHits = hit ? hits + 1 : hits;
        this.stats.cacheHitRate = (newHits / (totalRequests + 1)) * 100;
    }
    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        if (typeof window !== "undefined" && "performance" in window) {
            setInterval(() => {
                this.updatePerformanceStats();
            }, 1000);
        }
    }
    /**
     * Update performance statistics
     */
    updatePerformanceStats() {
        if (typeof window !== "undefined" && "performance" in window) {
            const memory = performance.memory;
            if (memory) {
                this.stats.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
            }
        }
    }
    /**
     * Clear all caches
     */
    clearCache() {
        this.colorCache.clear();
        this.stats.cacheHitRate = 0;
    }
    /**
     * Get memory usage
     */
    getMemoryUsage() {
        if (typeof window !== "undefined" && "performance" in window) {
            const memory = performance.memory;
            if (memory) {
                return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
            }
        }
        return 0;
    }
    /**
     * Check if memory limit is exceeded
     */
    isMemoryLimitExceeded() {
        const memoryUsage = this.getMemoryUsage();
        return memoryUsage > (this.config.performance?.memoryLimit || 512);
    }
}
/**
 * Performance Monitor for tracking visualization performance
 */
class PerformanceMonitor {
    constructor() {
        Object.defineProperty(this, "frameCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lastTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "fps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 60
        });
    }
    startFrame() {
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
        }
    }
    getFPS() {
        return this.fps;
    }
}
/**
 * Hook for using the visualization engine in SolidJS components
 */
export function useVisualizationEngine(config) {
    const engine = VisualizationEngine.getInstance(config);
    const [stats, setStats] = createSignal(engine.getStats());
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
        generateColors: (count, opacity) => engine.generateColors(count, opacity),
        generateOKLCHColors: (count, theme) => engine.generateColors(count, 0.8), // Use existing method with default opacity
        generateTagColors: (tags, opacity) => engine.generateTagColors(tags, opacity),
        generatePalette: (count) => engine.generatePalette(count),
        updateConfig: (newConfig) => engine.updateConfig(newConfig),
        getConfig: () => engine.getConfig(),
        registerVisualization: () => engine.registerVisualization(),
        unregisterVisualization: () => engine.unregisterVisualization(),
        clearCache: () => engine.clearCache(),
        getMemoryUsage: () => engine.getMemoryUsage(),
        isMemoryLimitExceeded: () => engine.isMemoryLimitExceeded(),
    };
}
