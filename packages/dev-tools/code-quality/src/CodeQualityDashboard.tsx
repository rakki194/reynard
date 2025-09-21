/**
 * Reynard Code Quality Dashboard
 *
 * A comprehensive SolidJS dashboard providing real-time visualization of code
 * quality metrics, security analysis results, and quality gate status.
 * Built using Reynard's modular UI components and advanced charting capabilities.
 */

import { AppLayout } from "reynard-ui";
import { Component, Show, createSignal } from "solid-js";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { OverviewTab } from "./components/OverviewTab";
import { QualityGatesTab } from "./components/QualityGatesTab";
import { SecurityTab } from "./components/SecurityTab";
import { TrendsTab } from "./components/TrendsTab";
import { useDashboardState } from "./composables/useDashboardState";
import { useDashboardUtils } from "./composables/useDashboardUtils";

interface DashboardProps {
  projectRoot: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showSecurity?: boolean;
  showQualityGates?: boolean;
  showTrends?: boolean;
}

/**
 * Code Quality Dashboard Component
 *
 * A comprehensive SolidJS dashboard component providing real-time visualization
 * of code quality metrics and security analysis results with interactive
 * filtering and detailed reporting capabilities.
 */
export const CodeQualityDashboard: Component<DashboardProps> = props => {
  const [activeTab, setActiveTab] = createSignal("overview");
  
  // Use composables for state management and utilities
  const { state, runAnalysis, startAutoRefresh, stopAutoRefresh } = useDashboardState(props);
  const { getRatingColor, getQualityGateColor, getMetricsChartData, getTrendChartData } = useDashboardUtils();

  // Helper functions for chart data
  const getMetricsData = () => getMetricsChartData(state().currentAnalysis);
  const getTrendData = () => getTrendChartData(state().analysisHistory);

  return (
    <AppLayout
      sidebar={
        <DashboardSidebar
          activeTab={activeTab()}
          onTabChange={setActiveTab}
          isLoading={state().isLoading}
          onRefresh={runAnalysis}
          autoRefresh={props.autoRefresh || false}
          onToggleAutoRefresh={() => props.autoRefresh ? stopAutoRefresh() : startAutoRefresh()}
        />
      }
      header={<DashboardHeader lastUpdated={state().lastUpdated} />}
    >
      <div class="p-6">
        <Show when={state().error}>
          <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div class="flex">
              <div class="text-red-400">⚠️</div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Analysis Error</h3>
                <div class="mt-2 text-sm text-red-700">{state().error}</div>
              </div>
            </div>
          </div>
        </Show>

        <Show when={activeTab() === "overview"}>
          <OverviewTab
            currentAnalysis={state().currentAnalysis}
            getRatingColor={getRatingColor}
            getMetricsChartData={getMetricsData}
          />
        </Show>

        <Show when={activeTab() === "security" && props.showSecurity}>
          <SecurityTab
            securityAnalysis={state().securityAnalysis}
            getRatingColor={getRatingColor}
          />
        </Show>

        <Show when={activeTab() === "quality-gates" && props.showQualityGates}>
          <QualityGatesTab
            qualityGateResults={state().qualityGateResults}
            getQualityGateColor={getQualityGateColor}
          />
        </Show>

        <Show when={activeTab() === "trends" && props.showTrends}>
          <TrendsTab getTrendChartData={getTrendData} />
        </Show>
      </div>
    </AppLayout>
  );
};

/**
 * 🦊 Create a dashboard component
 */
export function createCodeQualityDashboard(props: DashboardProps) {
  return () => <CodeQualityDashboard {...props} />;
}
