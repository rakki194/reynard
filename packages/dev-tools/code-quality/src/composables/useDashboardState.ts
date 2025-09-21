/**
 * Dashboard State Composable
 * 
 * Manages the state and logic for the Code Quality Dashboard
 */

import { createSignal, onMount } from "solid-js";
import { CodeQualityAnalyzer } from "../CodeQualityAnalyzer";
import { QualityGateManager, QualityGateResult } from "../QualityGateManager";
import { SecurityAnalysisIntegration, SecurityAnalysisResult } from "../SecurityAnalysisIntegration";
import { AnalysisResult } from "../types";
import { useAutoRefresh } from "./useAutoRefresh";

interface DashboardState {
  currentAnalysis: AnalysisResult | null;
  securityAnalysis: SecurityAnalysisResult | null;
  qualityGateResults: QualityGateResult[];
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
  analysisHistory: AnalysisResult[];
}

interface DashboardProps {
  projectRoot: string;
  showSecurity?: boolean;
  showQualityGates?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useDashboardState(props: DashboardProps) {
  const [state, setState] = createSignal<DashboardState>({
    currentAnalysis: null,
    securityAnalysis: null,
    qualityGateResults: [],
    isLoading: false,
    lastUpdated: null,
    error: null,
    analysisHistory: [],
  });

  // Initialize components
  const analyzer = new CodeQualityAnalyzer(props.projectRoot);
  const qualityGateManager = new QualityGateManager(props.projectRoot);
  const securityIntegration = new SecurityAnalysisIntegration(props.projectRoot);
  
  // Use auto-refresh composable
  const { startAutoRefresh, stopAutoRefresh } = useAutoRefresh(props.refreshInterval);

  /**
   * 🦊 Run security analysis if enabled
   */
  const runSecurityAnalysis = async (files: string[]): Promise<SecurityAnalysisResult | null> => {
    if (!props.showSecurity) return null;
    return await securityIntegration.runSecurityAnalysis(files);
  };

  /**
   * 🦊 Run quality gates evaluation if enabled
   */
  const runQualityGatesEvaluation = (metrics: any): QualityGateResult[] => {
    if (!props.showQualityGates) return [];
    return qualityGateManager.evaluateQualityGates(metrics);
  };

  /**
   * 🦊 Run complete analysis
   */
  const runAnalysis = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const analysisResult = await analyzer.analyzeProject();
      const files = analysisResult.files.map((f: any) => f.path);
      
      const [securityResult, qualityGateResults] = await Promise.all([
        runSecurityAnalysis(files),
        Promise.resolve(runQualityGatesEvaluation(analysisResult.metrics))
      ]);

      setState(prev => ({
        ...prev,
        currentAnalysis: analysisResult,
        securityAnalysis: securityResult,
        qualityGateResults,
        isLoading: false,
        lastUpdated: new Date(),
        error: null,
        analysisHistory: [...prev.analysisHistory.slice(-9), analysisResult],
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Analysis failed",
      }));
    }
  };

  // Wrapper functions for auto-refresh
  const startAutoRefreshWrapper = () => startAutoRefresh(runAnalysis);
  const stopAutoRefreshWrapper = () => stopAutoRefresh();

  // Initialize on mount
  onMount(async () => {
    try {
      await qualityGateManager.loadConfiguration();
      await runAnalysis();

      if (props.autoRefresh) {
        startAutoRefreshWrapper();
      }
    } catch (error) {
      console.error("Dashboard initialization failed:", error);
    }
  });

  return {
    state,
    runAnalysis,
    startAutoRefresh: startAutoRefreshWrapper,
    stopAutoRefresh: stopAutoRefreshWrapper,
  };
}
