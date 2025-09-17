/**
 * Direct Chart.js Integration Utilities
 * Provides a clean interface for integrating Chart.js directly with SolidJS
 */
import { ChartData, Chart as ChartJS, ChartOptions } from "chart.js";
import "chartjs-adapter-date-fns";
export interface ChartIntegrationConfig {
    /** Chart type */
    type: "line" | "bar" | "pie" | "doughnut";
    /** Chart data */
    data: ChartData;
    /** Chart options */
    options?: ChartOptions;
    /** Canvas width */
    width?: number;
    /** Canvas height */
    height?: number;
    /** Whether to destroy chart on cleanup */
    destroyOnCleanup?: boolean;
}
export interface ChartIntegrationResult {
    /** Chart instance */
    chart: () => ChartJS | null;
    /** Canvas ref */
    canvasRef: (el: HTMLCanvasElement) => void;
    /** Update chart data */
    updateData: (data: ChartData) => void;
    /** Update chart options */
    updateOptions: (options: ChartOptions) => void;
    /** Destroy chart */
    destroy: () => void;
}
/**
 * Create a direct Chart.js integration with SolidJS
 */
export declare function createChartIntegration(config: ChartIntegrationConfig): ChartIntegrationResult;
/**
 * Create a responsive chart container
 */
export declare function createResponsiveChart(config: ChartIntegrationConfig, containerClass?: string): {
    containerClass: string;
    /** Chart instance */
    chart: () => ChartJS | null;
    /** Canvas ref */
    canvasRef: (el: HTMLCanvasElement) => void;
    /** Update chart data */
    updateData: (data: ChartData) => void;
    /** Update chart options */
    updateOptions: (options: ChartOptions) => void;
    /** Destroy chart */
    destroy: () => void;
};
/**
 * Default chart options for different chart types
 */
export declare const getDefaultChartOptions: (type: string) => ChartOptions;
