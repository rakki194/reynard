/**
 * Chart Utilities
 * Helper functions for chart configuration and data processing
 */
import { DEFAULT_THEME } from "../types";
import { generateColorsWithCache } from "reynard-colors";
// Export specialized chart utilities
export * from "./barChartConfig";
export * from "./barChartData";
// export * from "./chartIntegration"; // Temporarily disabled for testing
// Export i18n utilities
export * from "./i18n";
/**
 * Apply theme colors to chart configuration
 */
export function applyTheme(theme = {}) {
    return { ...DEFAULT_THEME, ...theme };
}
/**
 * Format number values for display
 */
export function formatValue(value, type = "number") {
    // Handle null/undefined values first
    if (value == null || value === undefined) {
        return "0";
    }
    // Handle special cases
    if (value === Infinity) {
        return "∞";
    }
    if (value === -Infinity) {
        return "-∞";
    }
    if (isNaN(value)) {
        return "NaN";
    }
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
export function formatTimestamp(timestamp, format = "datetime") {
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
export function prepareDatasets(datasets) {
    const colors = generateColorsWithCache(datasets.length, 0, 0.3, 0.6, 1);
    const backgroundColors = generateColorsWithCache(datasets.length, 0, 0.3, 0.6, 0.6);
    return datasets.map((dataset, index) => ({
        label: dataset.label || `Dataset ${index + 1}`,
        data: dataset.data || [],
        ...dataset,
        backgroundColor: dataset.backgroundColor || backgroundColors[index],
        borderColor: dataset.borderColor || colors[index],
        borderWidth: dataset.borderWidth || 2,
    }));
}
/**
 * Get default chart configuration for a given type
 */
export function getDefaultConfig(type, theme) {
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
                        position: "right",
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
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
/**
 * Calculate chart dimensions based on container
 */
export function calculateDimensions(container, aspectRatio = 2) {
    const containerWidth = container.clientWidth;
    const width = Math.max(containerWidth, 300);
    const height = Math.max(width / aspectRatio, 200);
    return { width, height };
}
/**
 * Validate chart data
 */
export function validateChartData(datasets, labels) {
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
export function processTimeSeriesData(data, maxPoints = 100) {
    // Sort by timestamp
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
    // Limit data points for performance
    const limitedData = sortedData.slice(-maxPoints);
    return {
        labels: limitedData.map((item) => item.label || formatTimestamp(item.timestamp, "time")),
        data: limitedData.map((item) => item.value),
    };
}
/**
 * Aggregate data by time intervals
 */
export function aggregateByInterval(data, intervalMs) {
    const aggregated = new Map();
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
