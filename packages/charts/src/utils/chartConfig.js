/**
 * Chart Configuration Utilities
 * Handles Chart.js registration and configuration setup
 */
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler, registerables, } from "chart.js";
/**
 * Register all Chart.js components
 */
export function registerChartComponents() {
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler, ...registerables);
}
/**
 * Check if Chart.js components are registered
 */
export function isChartRegistered() {
    return ChartJS.registry.getScale("category") !== undefined;
}
/**
 * Default chart props configuration
 */
export const defaultChartProps = {
    width: 400,
    height: 300,
    showGrid: true,
    showLegend: true,
    useOKLCH: true,
    colorTheme: "dark",
    realTime: false,
    updateInterval: 1000,
    loading: false,
    emptyMessage: "No data available",
    enablePerformanceMonitoring: true,
};
/**
 * Chart props that should be split from others
 */
export const chartPropsToSplit = [
    "type",
    "labels",
    "datasets",
    "useOKLCH",
    "colorTheme",
    "realTime",
    "updateInterval",
    "colorGenerator",
    "loading",
    "emptyMessage",
    "enablePerformanceMonitoring",
    "showLegend",
    "showGrid",
    "xAxisLabel",
    "yAxisLabel",
];
