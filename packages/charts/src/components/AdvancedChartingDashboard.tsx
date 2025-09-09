/**
 * AdvancedChartingDashboard Component
 * Comprehensive dashboard combining all advanced charting components
 */

import {
  Component,
  createSignal,
  createEffect,
  onMount,
  Show,
} from "solid-js";
import { Tabs, TabItem } from "reynard-components";
import { ModelUsageChart, ModelUsageData } from "./ModelUsageChart";
import { EmbeddingDistributionChart, EmbeddingDistributionData } from "./EmbeddingDistributionChart";
import { PCAVarianceChart, PCAVarianceData } from "./PCAVarianceChart";
import { ChartConfig } from "../types";

export interface AdvancedChartingDashboardProps {
  /** Dashboard title */
  title?: string;
  /** Model usage data */
  modelUsageData?: Record<string, ModelUsageData>;
  /** Embedding distribution data */
  embeddingDistributionData?: EmbeddingDistributionData;
  /** PCA variance data */
  pcaVarianceData?: PCAVarianceData;
  /** Whether to show loading states */
  showLoading?: boolean;
  /** Custom chart configuration */
  chartConfig?: Partial<ChartConfig>;
  /** Whether to use OKLCH colors */
  useOKLCH?: boolean;
  /** Theme for color generation */
  colorTheme?: string;
  /** Dashboard width */
  width?: number;
  /** Dashboard height */
  height?: number;
}

export const AdvancedChartingDashboard: Component<AdvancedChartingDashboardProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal("model-usage");
  const [isLoading, setIsLoading] = createSignal(props.showLoading || false);

  // Simulate data loading
  onMount(() => {
    if (props.showLoading) {
      setTimeout(() => setIsLoading(false), 2000);
    }
  });

  const tabs: TabItem[] = [
    {
      id: "model-usage",
      label: "Model Usage",
      content: (
        <div class="dashboard-tab-content">
          <div class="chart-grid">
            <div class="chart-item">
              <ModelUsageChart
                title="Model Usage by Type"
                type="doughnut"
                data={props.modelUsageData || {}}
                width={400}
                height={300}
                useOKLCH={props.useOKLCH}
                colorTheme={props.colorTheme}
                loading={isLoading()}
                {...props.chartConfig}
              />
            </div>
            <div class="chart-item">
              <ModelUsageChart
                title="Usage Count by Model"
                type="bar"
                data={props.modelUsageData || {}}
                metric="usage_count"
                width={400}
                height={300}
                useOKLCH={props.useOKLCH}
                colorTheme={props.colorTheme}
                loading={isLoading()}
                {...props.chartConfig}
              />
            </div>
            <div class="chart-item">
              <ModelUsageChart
                title="Hours Since Last Used"
                type="line"
                data={props.modelUsageData || {}}
                metric="last_used"
                width={400}
                height={300}
                useOKLCH={props.useOKLCH}
                colorTheme={props.colorTheme}
                loading={isLoading()}
                {...props.chartConfig}
              />
            </div>
            <div class="chart-item">
              <ModelUsageChart
                title="VRAM/RAM Timeout Ratio"
                type="bar"
                data={props.modelUsageData || {}}
                metric="timeout_ratio"
                width={400}
                height={300}
                useOKLCH={props.useOKLCH}
                colorTheme={props.colorTheme}
                loading={isLoading()}
                {...props.chartConfig}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "embedding-distribution",
      label: "Embedding Distribution",
      content: (
        <div class="dashboard-tab-content">
          <div class="chart-grid">
            <div class="chart-item">
              <EmbeddingDistributionChart
                title="Embedding Value Histogram"
                type="histogram"
                data={props.embeddingDistributionData || { values: [] }}
                width={400}
                height={300}
                showStatistics={true}
                useOKLCH={props.useOKLCH}
                colorTheme={props.colorTheme}
                loading={isLoading()}
                {...props.chartConfig}
              />
            </div>
            <div class="chart-item">
              <EmbeddingDistributionChart
                title="Embedding Value Box Plot"
                type="boxplot"
                data={props.embeddingDistributionData || { values: [] }}
                width={400}
                height={300}
                showStatistics={true}
                useOKLCH={props.useOKLCH}
                colorTheme={props.colorTheme}
                loading={isLoading()}
                {...props.chartConfig}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "pca-analysis",
      label: "PCA Analysis",
      content: (
        <div class="dashboard-tab-content">
          <div class="chart-grid">
            <div class="chart-item full-width">
              <PCAVarianceChart
                title="PCA Explained Variance Analysis"
                data={props.pcaVarianceData || { components: [], explainedVarianceRatio: [], cumulativeVarianceRatio: [] }}
                width={800}
                height={400}
                showCumulative={true}
                showRecommendations={true}
                maxComponents={20}
                useOKLCH={props.useOKLCH}
                colorTheme={props.colorTheme}
                loading={isLoading()}
                {...props.chartConfig}
              />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div class="advanced-charting-dashboard">
      <div class="dashboard-header">
        <h2>{props.title || "Advanced Charting Dashboard"}</h2>
        <div class="dashboard-controls">
          <label>
            <input
              type="checkbox"
              checked={props.useOKLCH}
              onChange={(e) => {
                // This would need to be handled by parent component
                console.log("OKLCH toggle:", e.currentTarget.checked);
              }}
            />
            Use OKLCH Colors
          </label>
        </div>
      </div>
      
      <Tabs
        items={tabs}
        activeTab={activeTab()}
        onTabChange={setActiveTab}
        variant="underline"
        size="lg"
      />
    </div>
  );
};
