/**
 * Bar Chart Configuration Utilities
 * Handles chart options and configuration for bar charts
 */
import { ChartConfig, ReynardTheme } from "../types";
export interface BarChartConfigOptions {
    title?: string;
    showGrid: boolean;
    showLegend: boolean;
    responsive: boolean;
    maintainAspectRatio: boolean;
    horizontal: boolean;
    stacked: boolean;
    xAxis?: ChartConfig["xAxis"];
    yAxis?: ChartConfig["yAxis"];
    animation?: ChartConfig["animation"];
    tooltip?: ChartConfig["tooltip"];
    theme?: ReynardTheme;
}
export declare const createBarChartOptions: (options: BarChartConfigOptions) => {
    indexAxis: "x" | "y";
    responsive: boolean;
    maintainAspectRatio: boolean;
    animation: any;
    plugins: {
        title: {
            display: boolean;
            text: string | undefined;
            color: string;
            font: {
                size: number;
                weight: "bold";
            };
            padding: {
                top: number;
                bottom: number;
            };
        };
        legend: {
            display: boolean;
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        } | {
            display: boolean;
            position: "right";
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        };
        tooltip: {
            enabled?: boolean;
            backgroundColor: string;
            titleColor: string;
            bodyColor: string;
            borderColor: string;
            borderWidth: number;
            cornerRadius: number;
            displayColors: boolean;
        };
    } | {
        title: {
            display: boolean;
            text: string | undefined;
            color: string;
            font: {
                size: number;
                weight: "bold";
            };
            padding: {
                top: number;
                bottom: number;
            };
        };
        legend: {
            display: boolean;
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        } | {
            display: boolean;
            position: "right";
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        };
        tooltip: {
            enabled?: boolean;
            backgroundColor: string;
            titleColor: string;
            bodyColor: string;
            borderColor: string;
            borderWidth: number;
            cornerRadius: number;
            displayColors: boolean;
        };
    };
    scales: {
        [x: string]: {
            type: "category";
            display: boolean;
            title: {
                display: boolean;
                text: string | undefined;
                color: string;
            };
            grid: {
                display: boolean;
                color?: undefined;
                lineWidth?: undefined;
            };
            ticks: {
                display?: boolean;
                color: string;
                font?: {
                    size?: number;
                    family?: string;
                    weight?: "normal" | "bold" | "lighter" | "bolder" | number;
                };
                callback?: (value: any, index: number, values: any[]) => string;
            };
            stacked: boolean;
            position?: undefined;
            beginAtZero?: undefined;
            min?: undefined;
            max?: undefined;
        } | {
            type: "linear";
            display: boolean;
            position: "left" | "right" | "top" | "bottom";
            title: {
                display: boolean;
                text: string | undefined;
                color: string;
            };
            grid: {
                display: boolean;
                color: string;
                lineWidth: number;
            };
            ticks: {
                display?: boolean;
                color: string;
                font?: {
                    size?: number;
                    family?: string;
                    weight?: "normal" | "bold" | "lighter" | "bolder" | number;
                };
                callback?: (value: any, index: number, values: any[]) => string;
            };
            beginAtZero: boolean;
            stacked: boolean;
            min: number | undefined;
            max: number | undefined;
        };
    };
} | {
    indexAxis: "x" | "y";
    responsive: boolean;
    maintainAspectRatio: boolean;
    animation: any;
    plugins: {
        title: {
            display: boolean;
            text: string | undefined;
            color: string;
            font: {
                size: number;
                weight: "bold";
            };
            padding: {
                top: number;
                bottom: number;
            };
        };
        legend: {
            display: boolean;
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        } | {
            display: boolean;
            position: "right";
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        };
        tooltip: {
            enabled?: boolean;
            backgroundColor: string;
            titleColor: string;
            bodyColor: string;
            borderColor: string;
            borderWidth: number;
            cornerRadius: number;
            displayColors: boolean;
        };
    } | {
        title: {
            display: boolean;
            text: string | undefined;
            color: string;
            font: {
                size: number;
                weight: "bold";
            };
            padding: {
                top: number;
                bottom: number;
            };
        };
        legend: {
            display: boolean;
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        } | {
            display: boolean;
            position: "right";
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        };
        tooltip: {
            enabled?: boolean;
            backgroundColor: string;
            titleColor: string;
            bodyColor: string;
            borderColor: string;
            borderWidth: number;
            cornerRadius: number;
            displayColors: boolean;
        };
    };
    scales: {
        [x: string]: {
            type: "category";
            display: boolean;
            title: {
                display: boolean;
                text: string | undefined;
                color: string;
            };
            grid: {
                display: boolean;
                color?: undefined;
                lineWidth?: undefined;
            };
            ticks: {
                display?: boolean;
                color: string;
                font?: {
                    size?: number;
                    family?: string;
                    weight?: "normal" | "bold" | "lighter" | "bolder" | number;
                };
                callback?: (value: any, index: number, values: any[]) => string;
            };
            stacked: boolean;
            position?: undefined;
            beginAtZero?: undefined;
            min?: undefined;
            max?: undefined;
        } | {
            type: "linear";
            display: boolean;
            position: "left" | "right" | "top" | "bottom";
            title: {
                display: boolean;
                text: string | undefined;
                color: string;
            };
            grid: {
                display: boolean;
                color: string;
                lineWidth: number;
            };
            ticks: {
                display?: boolean;
                color: string;
                font?: {
                    size?: number;
                    family?: string;
                    weight?: "normal" | "bold" | "lighter" | "bolder" | number;
                };
                callback?: (value: any, index: number, values: any[]) => string;
            };
            beginAtZero: boolean;
            stacked: boolean;
            min: number | undefined;
            max: number | undefined;
        };
    };
    elements: {
        line: {
            tension: number;
        };
        point: {
            radius: number;
            hoverRadius: number;
        };
    };
} | {
    indexAxis: "x" | "y";
    responsive: boolean;
    maintainAspectRatio: boolean;
    animation: any;
    plugins: {
        title: {
            display: boolean;
            text: string | undefined;
            color: string;
            font: {
                size: number;
                weight: "bold";
            };
            padding: {
                top: number;
                bottom: number;
            };
        };
        legend: {
            display: boolean;
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        } | {
            display: boolean;
            position: "right";
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        };
        tooltip: {
            enabled?: boolean;
            backgroundColor: string;
            titleColor: string;
            bodyColor: string;
            borderColor: string;
            borderWidth: number;
            cornerRadius: number;
            displayColors: boolean;
        };
    } | {
        title: {
            display: boolean;
            text: string | undefined;
            color: string;
            font: {
                size: number;
                weight: "bold";
            };
            padding: {
                top: number;
                bottom: number;
            };
        };
        legend: {
            display: boolean;
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        } | {
            display: boolean;
            position: "right";
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        };
        tooltip: {
            enabled?: boolean;
            backgroundColor: string;
            titleColor: string;
            bodyColor: string;
            borderColor: string;
            borderWidth: number;
            cornerRadius: number;
            displayColors: boolean;
        };
    };
    scales: {
        [x: string]: {
            type: "category";
            display: boolean;
            title: {
                display: boolean;
                text: string | undefined;
                color: string;
            };
            grid: {
                display: boolean;
                color?: undefined;
                lineWidth?: undefined;
            };
            ticks: {
                display?: boolean;
                color: string;
                font?: {
                    size?: number;
                    family?: string;
                    weight?: "normal" | "bold" | "lighter" | "bolder" | number;
                };
                callback?: (value: any, index: number, values: any[]) => string;
            };
            stacked: boolean;
            position?: undefined;
            beginAtZero?: undefined;
            min?: undefined;
            max?: undefined;
        } | {
            type: "linear";
            display: boolean;
            position: "left" | "right" | "top" | "bottom";
            title: {
                display: boolean;
                text: string | undefined;
                color: string;
            };
            grid: {
                display: boolean;
                color: string;
                lineWidth: number;
            };
            ticks: {
                display?: boolean;
                color: string;
                font?: {
                    size?: number;
                    family?: string;
                    weight?: "normal" | "bold" | "lighter" | "bolder" | number;
                };
                callback?: (value: any, index: number, values: any[]) => string;
            };
            beginAtZero: boolean;
            stacked: boolean;
            min: number | undefined;
            max: number | undefined;
        };
    };
} | {
    indexAxis: "x" | "y";
    responsive: boolean;
    maintainAspectRatio: boolean;
    animation: any;
    plugins: {
        title: {
            display: boolean;
            text: string | undefined;
            color: string;
            font: {
                size: number;
                weight: "bold";
            };
            padding: {
                top: number;
                bottom: number;
            };
        };
        legend: {
            display: boolean;
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        } | {
            display: boolean;
            position: "right";
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        };
        tooltip: {
            enabled?: boolean;
            backgroundColor: string;
            titleColor: string;
            bodyColor: string;
            borderColor: string;
            borderWidth: number;
            cornerRadius: number;
            displayColors: boolean;
        };
    } | {
        title: {
            display: boolean;
            text: string | undefined;
            color: string;
            font: {
                size: number;
                weight: "bold";
            };
            padding: {
                top: number;
                bottom: number;
            };
        };
        legend: {
            display: boolean;
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        } | {
            display: boolean;
            position: "right";
            labels: {
                color: string;
                usePointStyle: boolean;
                padding: number;
            };
        };
        tooltip: {
            enabled?: boolean;
            backgroundColor: string;
            titleColor: string;
            bodyColor: string;
            borderColor: string;
            borderWidth: number;
            cornerRadius: number;
            displayColors: boolean;
        };
    };
    scales: {
        [x: string]: {
            type: "category";
            display: boolean;
            title: {
                display: boolean;
                text: string | undefined;
                color: string;
            };
            grid: {
                display: boolean;
                color?: undefined;
                lineWidth?: undefined;
            };
            ticks: {
                display?: boolean;
                color: string;
                font?: {
                    size?: number;
                    family?: string;
                    weight?: "normal" | "bold" | "lighter" | "bolder" | number;
                };
                callback?: (value: any, index: number, values: any[]) => string;
            };
            stacked: boolean;
            position?: undefined;
            beginAtZero?: undefined;
            min?: undefined;
            max?: undefined;
        } | {
            type: "linear";
            display: boolean;
            position: "left" | "right" | "top" | "bottom";
            title: {
                display: boolean;
                text: string | undefined;
                color: string;
            };
            grid: {
                display: boolean;
                color: string;
                lineWidth: number;
            };
            ticks: {
                display?: boolean;
                color: string;
                font?: {
                    size?: number;
                    family?: string;
                    weight?: "normal" | "bold" | "lighter" | "bolder" | number;
                };
                callback?: (value: any, index: number, values: any[]) => string;
            };
            beginAtZero: boolean;
            stacked: boolean;
            min: number | undefined;
            max: number | undefined;
        };
    };
};
