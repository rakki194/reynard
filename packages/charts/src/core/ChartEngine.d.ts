/**
 * Chart Engine Core
 * Central engine for managing chart instances and configurations
 */
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
export declare class ChartEngine {
    private static instance;
    private isRegistered;
    private colorCache;
    private config;
    private constructor();
    static getInstance(config?: ChartEngineConfig): ChartEngine;
    register(): void;
    generateColors(count: number, opacity?: number): string[];
    prepareDatasets(datasets: Partial<Dataset>[]): Dataset[];
    getDefaultConfig(type: ChartType, theme?: Partial<ChartTheme>): {
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
    } | {
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
    } | {
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
    } | {
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
    updateConfig(newConfig: Partial<ChartEngineConfig>): void;
    getConfig(): ChartEngineConfig;
}
