/**
 * Time Series Chart Component
 * Advanced real-time chart with automatic data management
 */
import { CategoryScale, Chart, Legend, LineController, LineElement, LinearScale, PointElement, TimeScale, Title, Tooltip, } from "chart.js";
import "chartjs-adapter-date-fns";
import { Show, createEffect, createSignal, onCleanup, onMount, splitProps, untrack } from "solid-js";
import { formatTimestamp, getDefaultConfig } from "../utils";
import "./TimeSeriesChart.css";
const defaultProps = {
    width: 400,
    height: 300,
    showGrid: true,
    showLegend: false,
    responsive: true,
    maintainAspectRatio: false,
    maxDataPoints: 100,
    updateInterval: 1000,
    autoScroll: true,
    emptyMessage: "No data available",
    theme: "light",
};
export const TimeSeriesChart = props => {
    const merged = { ...defaultProps, ...props };
    const [local, others] = splitProps(merged, [
        "data",
        "title",
        "width",
        "height",
        "showGrid",
        "showLegend",
        "responsive",
        "maintainAspectRatio",
        "maxDataPoints",
        "updateInterval",
        "autoScroll",
        "timeRange",
        "aggregationInterval",
        "stepped",
        "tension",
        "fill",
        "pointColors",
        "valueFormatter",
        "xAxis",
        "yAxis",
        "class",
        "loading",
        "emptyMessage",
        "animation",
        "tooltip",
        "onDataUpdate",
        "theme",
    ]);
    const [isRegistered, setIsRegistered] = createSignal(false);
    const [processedData, setProcessedData] = createSignal(null);
    let updateTimer = null;
    // Register Chart.js components on mount
    onMount(() => {
        Chart.register(Title, Tooltip, Legend, LineController, CategoryScale, PointElement, LineElement, LinearScale, TimeScale);
        setIsRegistered(true);
    });
    // Cleanup timer on unmount
    onCleanup(() => {
        if (updateTimer) {
            clearInterval(updateTimer);
        }
    });
    // Process time series data
    const processTimeSeriesData = () => {
        if (!local.data || local.data.length === 0) {
            setProcessedData(null);
            return;
        }
        let dataToProcess = [...local.data];
        // Sort by timestamp
        dataToProcess.sort((a, b) => a.timestamp - b.timestamp);
        // Apply time range filter if specified
        if (local.timeRange) {
            const now = Date.now();
            const cutoff = now - local.timeRange;
            dataToProcess = dataToProcess.filter(point => point.timestamp >= cutoff);
        }
        // Limit data points
        if (dataToProcess.length > local.maxDataPoints) {
            dataToProcess = dataToProcess.slice(-local.maxDataPoints);
        }
        // Aggregate data if specified
        if (local.aggregationInterval) {
            dataToProcess = aggregateData(dataToProcess, local.aggregationInterval);
        }
        // Prepare chart data
        const labels = dataToProcess.map(point => formatTimestamp(point.timestamp, "time"));
        const values = dataToProcess.map(point => point.value);
        // Generate point colors if function provided
        let pointBackgroundColors;
        let pointBorderColors;
        if (local.pointColors) {
            pointBackgroundColors = dataToProcess.map(point => local.pointColors(point.value, point.timestamp));
            pointBorderColors = pointBackgroundColors;
        }
        const dataset = {
            label: "Value",
            data: values,
            borderColor: "var(--accent)",
            backgroundColor: "transparent",
            pointBackgroundColor: pointBackgroundColors || "var(--accent)",
            pointBorderColor: pointBorderColors || "var(--accent)",
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2,
            fill: local.fill || false,
            tension: local.tension || 0.4,
            stepped: local.stepped || false,
        };
        setProcessedData({
            labels,
            datasets: [dataset],
        });
        // Trigger data update callback
        local.onDataUpdate?.(dataToProcess);
    };
    // Aggregate data by intervals
    const aggregateData = (data, intervalMs) => {
        const aggregated = new Map();
        for (const point of data) {
            const intervalStart = Math.floor(point.timestamp / intervalMs) * intervalMs;
            const existing = aggregated.get(intervalStart) || {
                sum: 0,
                count: 0,
                label: point.label,
            };
            aggregated.set(intervalStart, {
                sum: existing.sum + point.value,
                count: existing.count + 1,
                label: existing.label,
            });
        }
        return Array.from(aggregated.entries())
            .map(([timestamp, { sum, count, label }]) => ({
            timestamp,
            value: sum / count, // Average
            label,
        }))
            .sort((a, b) => a.timestamp - b.timestamp);
    };
    // Update data when props change
    createEffect(() => {
        processTimeSeriesData();
    });
    // Set up auto-update timer
    createEffect(() => {
        if (local.updateInterval && local.data.length > 0) {
            updateTimer = window.setInterval(() => {
                // Wrap in untrack to avoid reactivity issues in timer callback
                untrack(() => {
                    processTimeSeriesData();
                });
            }, local.updateInterval);
        }
        return () => {
            if (updateTimer) {
                window.clearInterval(updateTimer);
                updateTimer = null;
            }
        };
    });
    const getChartOptions = () => {
        const baseConfig = getDefaultConfig("line");
        return {
            ...baseConfig,
            responsive: local.responsive,
            maintainAspectRatio: local.maintainAspectRatio,
            animation: local.animation || {
                duration: 750,
                easing: "easeOutCubic",
            },
            interaction: {
                intersect: false,
                mode: "index",
            },
            plugins: {
                ...baseConfig.plugins,
                title: {
                    display: !!local.title,
                    text: local.title,
                    color: "var(--text-primary)",
                    font: {
                        size: 16,
                        weight: "600",
                    },
                    padding: {
                        top: 10,
                        bottom: 30,
                    },
                },
                legend: {
                    ...baseConfig.plugins?.legend,
                    display: local.showLegend,
                },
                tooltip: {
                    ...baseConfig.plugins?.tooltip,
                    ...local.tooltip,
                    callbacks: {
                        label: (context) => {
                            const value = context.parsed.y;
                            const formattedValue = local.valueFormatter ? local.valueFormatter(value) : value.toLocaleString();
                            return `${context.dataset.label}: ${formattedValue}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    type: "time",
                    time: {
                        displayFormats: {
                            second: "HH:mm:ss",
                            minute: "HH:mm",
                            hour: "HH:mm",
                            day: "MM/dd",
                        },
                    },
                    display: local.xAxis?.display !== false,
                    title: {
                        display: !!local.xAxis?.label,
                        text: local.xAxis?.label || "Time",
                        color: "var(--text-primary)",
                    },
                    grid: {
                        display: local.showGrid && local.xAxis?.grid?.display !== false,
                        color: local.xAxis?.grid?.color || "var(--border-color)",
                        lineWidth: local.xAxis?.grid?.lineWidth || 1,
                    },
                    ticks: {
                        color: "var(--text-secondary)",
                        maxTicksLimit: 10,
                        ...local.xAxis?.ticks,
                    },
                },
                y: {
                    type: "linear",
                    display: local.yAxis?.display !== false,
                    position: local.yAxis?.position || "left",
                    title: {
                        display: !!local.yAxis?.label,
                        text: local.yAxis?.label || "Value",
                        color: "var(--text-primary)",
                    },
                    grid: {
                        display: local.showGrid && local.yAxis?.grid?.display !== false,
                        color: local.yAxis?.grid?.color || "var(--border-color)",
                        lineWidth: local.yAxis?.grid?.lineWidth || 1,
                    },
                    ticks: {
                        color: "var(--text-secondary)",
                        callback: (value) => {
                            return local.valueFormatter ? local.valueFormatter(value) : value.toLocaleString();
                        },
                        ...local.yAxis?.ticks,
                    },
                    min: local.yAxis?.min,
                    max: local.yAxis?.max,
                },
            },
        };
    };
    const getContainerClasses = () => {
        const classes = ["reynard-timeseries-chart"];
        if (local.responsive)
            classes.push("responsive");
        if (!local.responsive)
            classes.push("fixed-size");
        if (local.stepped)
            classes.push("reynard-timeseries-chart--stepped");
        if (local.class)
            classes.push(local.class);
        return classes.join(" ");
    };
    return (<div class={getContainerClasses()} role="img" aria-label={local.title || "time series chart"} {...others}>
      <Show when={local.title}>
        <div class="reynard-chart-title">{local.title}</div>
      </Show>
      <Show when={local.loading}>
        <div class="reynard-chart-loading">
          <div class="reynard-chart-spinner"/>
          <span>Loading chart...</span>
        </div>
      </Show>

      <Show when={!local.loading && !processedData()}>
        <div class="reynard-chart-empty">
          <span>{local.emptyMessage}</span>
        </div>
      </Show>

      <Show when={!local.loading && processedData()}>
        <div class="reynard-chart-container" style={{ position: "relative", width: "100%", height: "100%" }}>
          <canvas width={local.width} height={local.height} style={{ "max-width": "100%", "max-height": "100%" }} data-testid="timeseries-chart-canvas"/>
        </div>
      </Show>
    </div>);
};
