/**
 * 🦊 Reynard Code Quality Dashboard
 *
 * *red fur gleams with intelligence* A comprehensive web dashboard for
 * visualizing code quality metrics, security analysis, and quality gate status.
 * Provides real-time insights into the Reynard codebase health.
 */
import { CodeQualityAnalyzer } from "./CodeQualityAnalyzer";
import { QualityGateManager } from "./QualityGateManager";
import { SecurityAnalysisIntegration } from "./SecurityAnalysisIntegration";
/**
 * 🦊 Code Quality Dashboard Component
 *
 * *whiskers twitch with intelligence* A comprehensive dashboard for
 * visualizing code quality metrics and security analysis results.
 */
export class CodeQualityDashboard {
    constructor(props) {
        Object.defineProperty(this, "projectRoot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "autoRefresh", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "refreshInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "analyzer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "qualityGateManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "securityIntegration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "refreshTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
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
    async initialize() {
        try {
            // Load configuration
            await this.qualityGateManager.loadConfiguration();
            // Run initial analysis
            await this.runAnalysis();
            // Set up auto-refresh if enabled
            if (this.autoRefresh) {
                this.startAutoRefresh();
            }
        }
        catch (error) {
            this.state.error = error.message;
            throw error;
        }
    }
    /**
     * 🦊 Run complete analysis
     */
    async runAnalysis() {
        this.state.isLoading = true;
        this.state.error = null;
        try {
            // Run code quality analysis
            const analysisResult = await this.analyzer.analyzeProject();
            // Run security analysis
            const files = analysisResult.files.map((f) => f.path);
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
        }
        catch (error) {
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
    getState() {
        return { ...this.state };
    }
    /**
     * 🦊 Start auto-refresh
     */
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        this.refreshTimer = setInterval(async () => {
            try {
                await this.runAnalysis();
            }
            catch (error) {
                console.error("Auto-refresh failed:", error);
            }
        }, this.refreshInterval);
    }
    /**
     * 🦊 Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    /**
     * 🦊 Cleanup resources
     */
    dispose() {
        this.stopAutoRefresh();
    }
}
/**
 * 🦊 Create a dashboard instance
 */
export function createCodeQualityDashboard(props) {
    return new CodeQualityDashboard(props);
}
