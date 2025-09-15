/**
 * 🦊 Reynard Code Quality Dashboard
 *
 * *red fur gleams with intelligence* A comprehensive web dashboard for
 * visualizing code quality metrics, security analysis, and quality gate status.
 * Provides real-time insights into the Reynard codebase health.
 */

import { CodeQualityAnalyzer } from "./CodeQualityAnalyzer";
import { QualityGateManager, QualityGateResult } from "./QualityGateManager";
import { SecurityAnalysisIntegration, SecurityAnalysisResult } from "./SecurityAnalysisIntegration";
import { AnalysisResult } from "./types";

interface DashboardProps {
  projectRoot: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface DashboardState {
  currentAnalysis: AnalysisResult | null;
  securityAnalysis: SecurityAnalysisResult | null;
  qualityGateResults: QualityGateResult[];
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

/**
 * 🦊 Code Quality Dashboard Component
 *
 * *whiskers twitch with intelligence* A comprehensive dashboard for
 * visualizing code quality metrics and security analysis results.
 */
export class CodeQualityDashboard {
  private readonly projectRoot: string;
  private readonly autoRefresh: boolean;
  private readonly refreshInterval: number;
  private state: DashboardState;
  private analyzer: CodeQualityAnalyzer;
  private qualityGateManager: QualityGateManager;
  private securityIntegration: SecurityAnalysisIntegration;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(props: DashboardProps) {
    this.projectRoot = props.projectRoot;
    this.autoRefresh = props.autoRefresh ?? false;
    this.refreshInterval = props.refreshInterval ?? 30000; // 30 seconds

    this.state = {
      currentAnalysis: null,
      securityAnalysis: null,
      qualityGateResults: [],
      isLoading: false,
      lastUpdated: null,
      error: null,
    };

    this.analyzer = new CodeQualityAnalyzer(this.projectRoot);
    this.qualityGateManager = new QualityGateManager(this.projectRoot);
    this.securityIntegration = new SecurityAnalysisIntegration(this.projectRoot);
  }

  /**
   * 🦊 Initialize the dashboard
   */
  async initialize(): Promise<void> {
    try {
      // Load configuration
      await this.qualityGateManager.loadConfiguration();

      // Run initial analysis
      await this.runAnalysis();

      // Set up auto-refresh if enabled
      if (this.autoRefresh) {
        this.startAutoRefresh();
      }
    } catch (error: any) {
      this.state.error = error.message;
      throw error;
    }
  }

  /**
   * 🦊 Run complete analysis
   */
  async runAnalysis(): Promise<void> {
    this.state.isLoading = true;
    this.state.error = null;

    try {
      // Run code quality analysis
      const analysisResult = await this.analyzer.analyzeProject();

      // Run security analysis
      const files = analysisResult.files.map((f: any) => f.path);
      const securityResult = await this.securityIntegration.runSecurityAnalysis(files);

      // Evaluate quality gates
      const qualityGateResults = this.qualityGateManager.evaluateQualityGates(analysisResult.metrics);

      this.state = {
        currentAnalysis: analysisResult,
        securityAnalysis: securityResult,
        qualityGateResults,
        isLoading: false,
        lastUpdated: new Date(),
        error: null,
      };
    } catch (error: any) {
      this.state = {
        ...this.state,
        isLoading: false,
        error: error.message || "Analysis failed",
      };
      throw error;
    }
  }

  /**
   * 🦊 Get current dashboard state
   */
  getState(): DashboardState {
    return { ...this.state };
  }

  /**
   * 🦊 Start auto-refresh
   */
  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(async () => {
      try {
        await this.runAnalysis();
      } catch (error) {
        console.error("Auto-refresh failed:", error);
      }
    }, this.refreshInterval);
  }

  /**
   * 🦊 Stop auto-refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * 🦊 Cleanup resources
   */
  dispose(): void {
    this.stopAutoRefresh();
  }
}

/**
 * 🦊 Create a dashboard instance
 */
export function createCodeQualityDashboard(props: DashboardProps): CodeQualityDashboard {
  return new CodeQualityDashboard(props);
}
