/**
 * Reynard Code Quality Dashboard
 *
 * A comprehensive SolidJS dashboard providing real-time visualization of code
 * quality metrics, security analysis results, and quality gate status.
 * Built using Reynard's modular UI components and advanced charting capabilities.
 */

import { Chart, RealTimeChart } from "reynard-charts";
import { Button } from "reynard-components-core";
import { AppLayout, Grid, GridItem } from "reynard-ui";
import { Component, For, Show, createSignal, onCleanup, onMount } from "solid-js";
import { CodeQualityAnalyzer } from "./CodeQualityAnalyzer";
import { QualityGateManager, QualityGateResult } from "./QualityGateManager";
import { SecurityAnalysisIntegration, SecurityAnalysisResult } from "./SecurityAnalysisIntegration";
import { AnalysisResult } from "./types";

interface DashboardProps {
  projectRoot: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showSecurity?: boolean;
  showQualityGates?: boolean;
  showTrends?: boolean;
}

interface DashboardState {
  currentAnalysis: AnalysisResult | null;
  securityAnalysis: SecurityAnalysisResult | null;
  qualityGateResults: QualityGateResult[];
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
  analysisHistory: AnalysisResult[];
}

/**
 * Code Quality Dashboard Component
 *
 * A comprehensive SolidJS dashboard component providing real-time visualization
 * of code quality metrics and security analysis results with interactive
 * filtering and detailed reporting capabilities.
 */
export const CodeQualityDashboard: Component<DashboardProps> = props => {
  const [state, setState] = createSignal<DashboardState>({
    currentAnalysis: null,
    securityAnalysis: null,
    qualityGateResults: [],
    isLoading: false,
    lastUpdated: null,
    error: null,
    analysisHistory: [],
  });

  const [activeTab, setActiveTab] = createSignal("overview");
  const [refreshTimer, setRefreshTimer] = createSignal<NodeJS.Timeout | null>(null);

  // Initialize components
  const analyzer = new CodeQualityAnalyzer(props.projectRoot);
  const qualityGateManager = new QualityGateManager(props.projectRoot);
  const securityIntegration = new SecurityAnalysisIntegration(props.projectRoot);

  /**
   * 🦊 Run complete analysis
   */
  const runAnalysis = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Run code quality analysis
      const analysisResult = await analyzer.analyzeProject();

      // Run security analysis if enabled
      let securityResult: SecurityAnalysisResult | null = null;
      if (props.showSecurity) {
        const files = analysisResult.files.map((f: any) => f.path);
        securityResult = await securityIntegration.runSecurityAnalysis(files);
      }

      // Evaluate quality gates if enabled
      let qualityGateResults: QualityGateResult[] = [];
      if (props.showQualityGates) {
        qualityGateResults = qualityGateManager.evaluateQualityGates(analysisResult.metrics);
      }

      setState(prev => ({
        ...prev,
        currentAnalysis: analysisResult,
        securityAnalysis: securityResult,
        qualityGateResults,
        isLoading: false,
        lastUpdated: new Date(),
        error: null,
        analysisHistory: [...prev.analysisHistory.slice(-9), analysisResult], // Keep last 10
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Analysis failed",
      }));
    }
  };

  /**
   * 🦊 Start auto-refresh
   */
  const startAutoRefresh = () => {
    if (refreshTimer()) {
      clearInterval(refreshTimer()!);
    }

    const timer = setInterval(async () => {
      try {
        await runAnalysis();
      } catch (error) {
        console.error("Auto-refresh failed:", error);
      }
    }, props.refreshInterval || 30000);

    setRefreshTimer(timer);
  };

  /**
   * 🦊 Stop auto-refresh
   */
  const stopAutoRefresh = () => {
    if (refreshTimer()) {
      clearInterval(refreshTimer()!);
      setRefreshTimer(null);
    }
  };

  // Initialize on mount
  onMount(async () => {
    try {
      await qualityGateManager.loadConfiguration();
      await runAnalysis();

      if (props.autoRefresh) {
        startAutoRefresh();
      }
    } catch (error) {
      console.error("Dashboard initialization failed:", error);
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    stopAutoRefresh();
  });

  /**
   * 🦊 Get quality rating color
   */
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "A":
        return "text-green-600";
      case "B":
        return "text-blue-600";
      case "C":
        return "text-yellow-600";
      case "D":
        return "text-orange-600";
      case "E":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  /**
   * 🦊 Get quality gate status color
   */
  const getQualityGateColor = (status: string) => {
    switch (status) {
      case "PASSED":
        return "text-green-600 bg-green-50";
      case "FAILED":
        return "text-red-600 bg-red-50";
      case "WARNING":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  /**
   * 🦊 Prepare metrics chart data
   */
  const getMetricsChartData = () => {
    const current = state().currentAnalysis;
    if (!current) return null;

    return {
      labels: ["Bugs", "Vulnerabilities", "Code Smells", "Security Hotspots"],
      datasets: [
        {
          label: "Issues",
          data: [
            current.metrics.bugs,
            current.metrics.vulnerabilities,
            current.metrics.codeSmells,
            current.metrics.securityHotspots,
          ],
          backgroundColor: ["#ef4444", "#f97316", "#eab308", "#8b5cf6"],
        },
      ],
    };
  };

  /**
   * 🦊 Prepare trend chart data
   */
  const getTrendChartData = () => {
    const history = state().analysisHistory;
    if (history.length < 2) return null;

    return {
      labels: history.map((_, i) => `Analysis ${i + 1}`),
      datasets: [
        {
          label: "Lines of Code",
          data: history.map(h => h.metrics.linesOfCode),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
        },
        {
          label: "Issues",
          data: history.map(h => h.issues.length),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
        },
      ],
    };
  };

  return (
    <AppLayout
      sidebar={
        <nav class="p-4 space-y-2">
          <h3 class="font-semibold text-lg mb-4">Code Quality Dashboard</h3>

          <button
            class={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              activeTab() === "overview" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Overview
          </button>

          <button
            class={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              activeTab() === "security" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("security")}
          >
            🛡️ Security
          </button>

          <button
            class={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              activeTab() === "quality-gates" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("quality-gates")}
          >
            🎯 Quality Gates
          </button>

          <button
            class={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              activeTab() === "trends" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("trends")}
          >
            📈 Trends
          </button>

          <div class="mt-8 pt-4 border-t">
            <Button onClick={runAnalysis} disabled={state().isLoading} class="w-full">
              {state().isLoading ? "Analyzing..." : "Refresh Analysis"}
            </Button>

            <Button
              onClick={props.autoRefresh ? stopAutoRefresh : startAutoRefresh}
              variant="secondary"
              class="w-full mt-2"
            >
              {props.autoRefresh ? "Stop Auto-Refresh" : "Start Auto-Refresh"}
            </Button>
          </div>
        </nav>
      }
      header={
        <header class="p-4 border-b">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">🦊 Reynard Code Quality</h1>
            <div class="text-sm text-gray-600">
              <Show when={state().lastUpdated}>Last updated: {state().lastUpdated?.toLocaleTimeString()}</Show>
            </div>
          </div>
        </header>
      }
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
          <Grid columns={{ xs: 1, md: 2, lg: 3 }} gap="1rem">
            {/* Key Metrics */}
            <GridItem colSpan={{ xs: 1, md: 2, lg: 3 }}>
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">Key Metrics</h2>
                <Show when={state().currentAnalysis}>
                  <Grid columns={{ xs: 2, md: 4 }} gap="1rem">
                    <div class="text-center">
                      <div class="text-3xl font-bold text-blue-600">
                        {state().currentAnalysis?.metrics.linesOfCode.toLocaleString()}
                      </div>
                      <div class="text-sm text-gray-600">Lines of Code</div>
                    </div>
                    <div class="text-center">
                      <div class="text-3xl font-bold text-red-600">{state().currentAnalysis?.issues.length || 0}</div>
                      <div class="text-sm text-gray-600">Total Issues</div>
                    </div>
                    <div class="text-center">
                      <div
                        class={`text-3xl font-bold ${getRatingColor(state().currentAnalysis?.metrics.reliabilityRating || "E")}`}
                      >
                        {state().currentAnalysis?.metrics.reliabilityRating || "E"}
                      </div>
                      <div class="text-sm text-gray-600">Reliability</div>
                    </div>
                    <div class="text-center">
                      <div
                        class={`text-3xl font-bold ${getRatingColor(state().currentAnalysis?.metrics.securityRating || "E")}`}
                      >
                        {state().currentAnalysis?.metrics.securityRating || "E"}
                      </div>
                      <div class="text-sm text-gray-600">Security</div>
                    </div>
                  </Grid>
                </Show>
              </div>
            </GridItem>

            {/* Issues Chart */}
            <GridItem colSpan={{ xs: 1, md: 2 }}>
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">Issues Breakdown</h2>
                <Show when={getMetricsChartData()}>
                  <Chart type="doughnut" data={getMetricsChartData()!} width={400} height={300} useOKLCH={true} />
                </Show>
              </div>
            </GridItem>

            {/* Quality Ratings */}
            <GridItem>
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">Quality Ratings</h2>
                <Show when={state().currentAnalysis}>
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <span>Reliability</span>
                      <span
                        class={`font-bold ${getRatingColor(state().currentAnalysis?.metrics.reliabilityRating || "E")}`}
                      >
                        {state().currentAnalysis?.metrics.reliabilityRating || "E"}
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span>Security</span>
                      <span
                        class={`font-bold ${getRatingColor(state().currentAnalysis?.metrics.securityRating || "E")}`}
                      >
                        {state().currentAnalysis?.metrics.securityRating || "E"}
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span>Maintainability</span>
                      <span
                        class={`font-bold ${getRatingColor(state().currentAnalysis?.metrics.maintainabilityRating || "E")}`}
                      >
                        {state().currentAnalysis?.metrics.maintainabilityRating || "E"}
                      </span>
                    </div>
                  </div>
                </Show>
              </div>
            </GridItem>
          </Grid>
        </Show>

        <Show when={activeTab() === "security" && props.showSecurity}>
          <Grid columns={{ xs: 1, md: 2 }} gap="1rem">
            <GridItem colSpan={{ xs: 1, md: 2 }}>
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">Security Analysis</h2>
                <Show when={state().securityAnalysis}>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center">
                      <div class="text-3xl font-bold text-red-600">
                        {state().securityAnalysis?.summary.totalVulnerabilities || 0}
                      </div>
                      <div class="text-sm text-gray-600">Vulnerabilities</div>
                    </div>
                    <div class="text-center">
                      <div class="text-3xl font-bold text-orange-600">
                        {state().securityAnalysis?.summary.securityHotspots || 0}
                      </div>
                      <div class="text-sm text-gray-600">Security Hotspots</div>
                    </div>
                    <div class="text-center">
                      <div
                        class={`text-3xl font-bold ${getRatingColor(state().securityAnalysis?.summary.securityRating || "E")}`}
                      >
                        {state().securityAnalysis?.summary.securityRating || "E"}
                      </div>
                      <div class="text-sm text-gray-600">Security Rating</div>
                    </div>
                  </div>
                </Show>
              </div>
            </GridItem>
          </Grid>
        </Show>

        <Show when={activeTab() === "quality-gates" && props.showQualityGates}>
          <Grid columns={{ xs: 1 }} gap="1rem">
            <GridItem>
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">Quality Gates</h2>
                <Show when={state().qualityGateResults.length > 0}>
                  <div class="space-y-3">
                    <For each={state().qualityGateResults}>
                      {gate => (
                        <div class={`p-4 rounded-md ${getQualityGateColor(gate.status)}`}>
                          <div class="flex justify-between items-center">
                            <div>
                              <h3 class="font-semibold">{gate.gateName}</h3>
                              <p class="text-sm opacity-75">{gate.description}</p>
                            </div>
                            <div class="text-right">
                              <div class="font-bold">{gate.status}</div>
                              <div class="text-sm opacity-75">
                                {gate.passedConditions}/{gate.totalConditions} conditions
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            </GridItem>
          </Grid>
        </Show>

        <Show when={activeTab() === "trends" && props.showTrends}>
          <Grid columns={{ xs: 1 }} gap="1rem">
            <GridItem>
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">Trend Analysis</h2>
                <Show when={getTrendChartData()}>
                  <RealTimeChart
                    type="line"
                    data={getTrendChartData()!}
                    title="Code Quality Trends"
                    width={800}
                    height={400}
                    useOKLCH={true}
                  />
                </Show>
              </div>
            </GridItem>
          </Grid>
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
