/**
 * PCAVarianceChart Component
 * Principal Component Analysis variance visualization with recommendations
 */
import { Show, createMemo } from "solid-js";
import { useVisualizationEngine } from "../core/VisualizationEngine";
export const PCAVarianceChart = props => {
    const visualizationEngine = useVisualizationEngine();
    // Prepare chart data using createMemo for better performance
    const chartData = createMemo(() => {
        const maxComps = props.maxComponents || props.data.components.length;
        const components = props.data.components.slice(0, maxComps);
        const varianceRatio = props.data.explainedVarianceRatio.slice(0, maxComps);
        const cumulativeRatio = props.data.cumulativeVarianceRatio.slice(0, maxComps);
        const colors = props.useOKLCH
            ? visualizationEngine.generateOKLCHColors(2, props.colorTheme || "dark")
            : [props.varianceColor || "rgba(54, 162, 235, 0.2)", props.cumulativeColor || "rgba(255, 99, 132, 0.2)"];
        const datasets = [
            {
                label: "Explained Variance Ratio",
                data: varianceRatio,
                backgroundColor: colors[0],
                borderColor: colors[0]?.replace("0.2", "1"),
                borderWidth: 2,
                pointBackgroundColor: colors[0]?.replace("0.2", "1"),
                pointBorderColor: "#fff",
                pointBorderWidth: 1,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.1,
                fill: false,
            },
        ];
        if (props.showCumulative !== false) {
            datasets.push({
                label: "Cumulative Variance Ratio",
                data: cumulativeRatio,
                backgroundColor: colors[1],
                borderColor: colors[1]?.replace("0.2", "1"),
                borderWidth: 2,
                pointBackgroundColor: colors[1]?.replace("0.2", "1"),
                pointBorderColor: "#fff",
                pointBorderWidth: 1,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.1,
                fill: false,
            });
        }
        return {
            labels: components.map(c => `PC${c}`),
            datasets,
        };
    });
    // Chart options
    const chartOptions = () => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: props.title,
                font: {
                    size: 16,
                    weight: "bold",
                },
            },
            legend: {
                display: true,
                position: "top",
            },
            tooltip: {
                mode: "index",
                intersect: false,
                callbacks: {
                    label: (context) => {
                        const value = context.parsed.y;
                        const percentage = (value * 100).toFixed(2);
                        return `${context.dataset.label}: ${percentage}% (${value.toFixed(4)})`;
                    },
                },
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: !!props.xAxisLabel,
                    text: props.xAxisLabel || "Principal Components",
                },
                grid: {
                    display: props.showGrid !== false,
                },
            },
            y: {
                display: true,
                title: {
                    display: !!props.yAxisLabel,
                    text: props.yAxisLabel || "Explained Variance Ratio",
                },
                grid: {
                    display: props.showGrid !== false,
                },
                beginAtZero: true,
                max: 1,
                ticks: {
                    callback: (value) => `${(value * 100).toFixed(0)}%`,
                },
            },
        },
        interaction: {
            mode: "nearest",
            axis: "x",
            intersect: false,
        },
    });
    // Recommendations overlay
    const recommendationsOverlay = () => {
        if (!props.showRecommendations || !props.data.recommendations)
            return null;
        const recs = props.data.recommendations;
        return (<div class="recommendations-overlay">
        <h4>Component Recommendations</h4>
        <div class="recommendation-item">
          <span class="rec-label">Conservative (80% variance):</span>
          <span class="rec-value">PC{recs.conservative}</span>
        </div>
        <div class="recommendation-item">
          <span class="rec-label">Balanced (90% variance):</span>
          <span class="rec-value">PC{recs.balanced}</span>
        </div>
        <div class="recommendation-item">
          <span class="rec-label">Comprehensive (95% variance):</span>
          <span class="rec-value">PC{recs.comprehensive}</span>
        </div>
        <div class="recommendation-item">
          <span class="rec-label">Elbow Method:</span>
          <span class="rec-value">PC{recs.elbowMethod}</span>
        </div>
      </div>);
    };
    // Summary statistics
    const summaryStats = () => {
        const totalVariance = props.data.cumulativeVarianceRatio[props.data.cumulativeVarianceRatio.length - 1];
        const topComponents = props.data.components.slice(0, 5);
        const topVariance = props.data.explainedVarianceRatio.slice(0, 5);
        return (<div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">Total Variance Explained:</span>
          <span class="stat-value">{(totalVariance * 100).toFixed(2)}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Top 5 Components:</span>
          <span class="stat-value">
            {topComponents.map((comp, i) => `PC${comp}(${(topVariance[i] * 100).toFixed(1)}%)`).join(", ")}
          </span>
        </div>
      </div>);
    };
    return (<div class="pca-variance-chart">
      <Show when={props.loading}>
        <div class="chart-loading">
          <div class="loading-spinner"/>
          <p>Loading PCA variance data...</p>
        </div>
      </Show>

      <Show when={!props.loading && (!props.data.components || props.data.components.length === 0)}>
        <div class="chart-empty">
          <p>{props.emptyMessage || "No PCA variance data available"}</p>
        </div>
      </Show>

      <Show when={!props.loading && props.data.components && props.data.components.length > 0}>
        <div class="reynard-chart-container" style={{ position: "relative", width: "100%", height: "100%" }}>
          <canvas width={props.width || 600} height={props.height || 400} style={{ "max-width": "100%", "max-height": "100%" }} data-testid="pca-variance-chart-canvas"/>
        </div>
        {recommendationsOverlay()}
        {summaryStats()}
      </Show>
    </div>);
};
