/**
 * Direct Chart.js Integration Utilities
 * Provides a clean interface for integrating Chart.js directly with SolidJS
 */
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, TimeScale, TimeSeriesScale, Title, Tooltip, } from "chart.js";
import "chartjs-adapter-date-fns";
import { createEffect, createSignal, onCleanup } from "solid-js";
// Ensure Chart.js is properly loaded
if (typeof window !== "undefined") {
    console.log("🦊 chartIntegration: ChartJS import check", {
        ChartJS: !!ChartJS,
        version: ChartJS?.version,
        register: typeof ChartJS?.register,
    });
}
// Register Chart.js components
console.log("🦊 chartIntegration: ChartJS available?", !!ChartJS);
console.log("🦊 chartIntegration: ChartJS version", ChartJS?.version);
if (ChartJS && ChartJS.register) {
    try {
        ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler, TimeScale, TimeSeriesScale);
        console.log("🦊 chartIntegration: Chart.js components registered successfully");
    }
    catch (error) {
        console.error("🦊 chartIntegration: Error registering Chart.js components", error);
    }
}
else {
    console.error("🦊 chartIntegration: ChartJS or register function not available");
}
/**
 * Create a direct Chart.js integration with SolidJS
 */
export function createChartIntegration(config) {
    const [chart, setChart] = createSignal(null);
    let canvasElement = null;
    let chartCreated = false;
    const canvasRef = (el) => {
        console.log("🦊 createChartIntegration: canvasRef called with element", el);
        canvasElement = el;
        if (el) {
            // Canvas is now available, try to create the chart
            createChart();
        }
    };
    const createChart = () => {
        console.log("🦊 createChartIntegration: createChart called", {
            canvasElement: !!canvasElement,
            window: typeof window !== "undefined",
            chartCreated,
        });
        if (chartCreated) {
            console.log("🦊 createChartIntegration: Chart already created, skipping");
            return;
        }
        if (!canvasElement) {
            console.log("🦊 createChartIntegration: No canvas element");
            return;
        }
        // Ensure canvas has proper document context for Chart.js
        if (!canvasElement.ownerDocument || !canvasElement.ownerDocument.defaultView) {
            console.log("🦊 createChartIntegration: Fixing canvas document context");
            // Force the canvas to have a proper document context
            if (typeof window !== "undefined" && window.document) {
                // This is a workaround for environments where ownerDocument.defaultView is null
                Object.defineProperty(canvasElement, "ownerDocument", {
                    value: window.document,
                    writable: false,
                    configurable: false,
                });
            }
        }
        // Patch getComputedStyle to prevent Chart.js DOM errors
        let originalGetComputedStyle;
        if (typeof window !== "undefined" && window.getComputedStyle) {
            originalGetComputedStyle = window.getComputedStyle;
            window.getComputedStyle = (element, pseudoElt) => {
                try {
                    return originalGetComputedStyle.call(window, element, pseudoElt);
                }
                catch (error) {
                    console.log("🦊 createChartIntegration: getComputedStyle failed, returning mock styles");
                    // Return a mock CSSStyleDeclaration with default values
                    return {
                        width: "600px",
                        height: "400px",
                        padding: "0px",
                        margin: "0px",
                        border: "0px",
                        boxSizing: "border-box",
                    };
                }
            };
        }
        console.log("🦊 createChartIntegration: Attempting chart creation directly");
        if (typeof window === "undefined") {
            console.log("🦊 createChartIntegration: No window object");
            return;
        }
        const ctx = canvasElement.getContext("2d");
        if (!ctx) {
            console.log("🦊 createChartIntegration: No 2D context");
            return;
        }
        console.log("🦊 createChartIntegration: Canvas context obtained", ctx);
        const chartConfig = {
            type: config.type,
            data: config.data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                ...config.options,
            },
        };
        console.log("🦊 createChartIntegration: Chart config", chartConfig);
        // Only create chart on client side
        if (typeof window !== "undefined" && ChartJS) {
            try {
                console.log("🦊 createChartIntegration: About to create ChartJS instance");
                // Add a timeout to prevent hanging
                const timeoutId = setTimeout(() => {
                    console.error("🦊 createChartIntegration: Chart creation timed out after 5 seconds");
                }, 5000);
                const chartInstance = new ChartJS(ctx, chartConfig);
                clearTimeout(timeoutId);
                console.log("🦊 createChartIntegration: Chart instance created successfully", chartInstance);
                setChart(chartInstance);
                chartCreated = true;
                console.log("🦊 createChartIntegration: Chart creation completed");
            }
            catch (error) {
                console.error("🦊 createChartIntegration: Error creating chart", error);
                console.error("🦊 createChartIntegration: Error details:", {
                    message: error.message,
                    stack: error.stack,
                    config: chartConfig,
                    canvasElement: canvasElement,
                    ctx: ctx,
                });
            }
            finally {
                // Restore original getComputedStyle function
                if (originalGetComputedStyle) {
                    window.getComputedStyle = originalGetComputedStyle;
                }
            }
        }
        else {
            console.log("🦊 createChartIntegration: Not in browser environment or ChartJS not available", {
                window: typeof window !== "undefined",
                ChartJS: !!ChartJS,
            });
        }
    };
    const updateData = (data) => {
        const chartInstance = chart();
        if (chartInstance) {
            chartInstance.data = data;
            chartInstance.update();
        }
    };
    const updateOptions = (options) => {
        const chartInstance = chart();
        if (chartInstance) {
            chartInstance.options = { ...chartInstance.options, ...options };
            chartInstance.update();
        }
    };
    const destroy = () => {
        const chartInstance = chart();
        if (chartInstance) {
            chartInstance.destroy();
            setChart(null);
        }
    };
    // Chart creation is now handled in canvasRef when canvas is available
    onCleanup(() => {
        if (config.destroyOnCleanup !== false) {
            destroy();
        }
    });
    // Update chart when config changes
    createEffect(() => {
        const chartInstance = chart();
        if (chartInstance && canvasElement) {
            updateData(config.data);
            if (config.options) {
                updateOptions(config.options);
            }
        }
    });
    return {
        chart,
        canvasRef,
        updateData,
        updateOptions,
        destroy,
    };
}
/**
 * Create a responsive chart container
 */
export function createResponsiveChart(config, containerClass = "reynard-chart-container") {
    const integration = createChartIntegration(config);
    return {
        ...integration,
        containerClass,
    };
}
/**
 * Default chart options for different chart types
 */
export const getDefaultChartOptions = (type) => {
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top",
            },
            tooltip: {
                enabled: true,
                mode: "index",
                intersect: false,
            },
        },
    };
    switch (type) {
        case "line":
            return {
                ...baseOptions,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: "X Axis",
                        },
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: "Y Axis",
                        },
                        beginAtZero: true,
                    },
                },
            };
        case "bar":
            return {
                ...baseOptions,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: "Category",
                        },
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: "Value",
                        },
                        beginAtZero: true,
                    },
                },
            };
        case "pie":
        case "doughnut":
            return {
                ...baseOptions,
                plugins: {
                    ...baseOptions.plugins,
                    legend: {
                        ...baseOptions.plugins?.legend,
                        position: "right",
                    },
                },
            };
        default:
            return baseOptions;
    }
};
