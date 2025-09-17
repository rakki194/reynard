/**
 * 🦊 Reynard Code Quality Dashboard
 *
 * *red fur gleams with intelligence* A comprehensive web dashboard for
 * visualizing code quality metrics, security analysis, and quality gate status.
 * Provides real-time insights into the Reynard codebase health.
 */
import { QualityGateResult } from "./QualityGateManager";
import { SecurityAnalysisResult } from "./SecurityAnalysisIntegration";
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
export declare class CodeQualityDashboard {
    private readonly projectRoot;
    private readonly autoRefresh;
    private readonly refreshInterval;
    private state;
    private analyzer;
    private qualityGateManager;
    private securityIntegration;
    private refreshTimer;
    constructor(props: DashboardProps);
    /**
     * 🦊 Initialize the dashboard
     */
    initialize(): Promise<void>;
    /**
     * 🦊 Run complete analysis
     */
    runAnalysis(): Promise<void>;
    /**
     * 🦊 Get current dashboard state
     */
    getState(): DashboardState;
    /**
     * 🦊 Start auto-refresh
     */
    private startAutoRefresh;
    /**
     * 🦊 Stop auto-refresh
     */
    stopAutoRefresh(): void;
    /**
     * 🦊 Cleanup resources
     */
    dispose(): void;
}
/**
 * 🦊 Create a dashboard instance
 */
export declare function createCodeQualityDashboard(props: DashboardProps): CodeQualityDashboard;
export {};
