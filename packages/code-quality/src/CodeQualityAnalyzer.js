/**
 * 🦊 Reynard Code Quality Analyzer
 *
 * *red fur gleams with intelligence* A comprehensive code quality analysis engine
 * that unifies all Reynard's existing tools into a SonarQube-like system.
 *
 * Features:
 * - Multi-language static analysis
 * - Security vulnerability detection
 * - Code complexity metrics
 * - Technical debt tracking
 * - Quality gates enforcement
 * - Trend analysis and reporting
 */
import { EventEmitter } from "events";
import { FileAnalyzer } from "./FileAnalyzer";
import { FileDiscoveryService } from "./FileDiscoveryService";
import { IssueDetector } from "./IssueDetector";
import { LanguageAnalyzer } from "./LanguageAnalyzer";
import { MetricsCalculator } from "./MetricsCalculator";
import { QualityGateEvaluator } from "./QualityGateEvaluator";
export class CodeQualityAnalyzer extends EventEmitter {
    constructor(projectRoot) {
        super();
        Object.defineProperty(this, "projectRoot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "analysisHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        // Component services
        Object.defineProperty(this, "fileDiscovery", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "languageAnalyzer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metricsCalculator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "issueDetector", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "qualityGateEvaluator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fileAnalyzer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.projectRoot = projectRoot;
        // Initialize component services
        this.fileDiscovery = new FileDiscoveryService();
        this.languageAnalyzer = new LanguageAnalyzer();
        this.metricsCalculator = new MetricsCalculator();
        this.issueDetector = new IssueDetector();
        this.qualityGateEvaluator = new QualityGateEvaluator();
        this.fileAnalyzer = new FileAnalyzer();
    }
    /**
     * 🦊 Perform comprehensive code quality analysis
     */
    async analyzeProject() {
        console.log("🦊 Starting comprehensive code quality analysis...");
        const startTime = Date.now();
        const analysisDate = new Date();
        try {
            // Discover all files
            const files = await this.fileDiscovery.discoverFiles(this.projectRoot);
            // Analyze each language
            const languageAnalyses = await this.languageAnalyzer.analyzeLanguages(files);
            // Calculate overall metrics
            const metrics = await this.metricsCalculator.calculateMetrics(files, languageAnalyses);
            // Detect issues
            const issues = await this.issueDetector.detectIssues(files);
            // Update metrics with issue data
            const updatedMetrics = this.metricsCalculator.updateMetricsWithIssues(metrics, issues);
            // Evaluate quality gates
            const qualityGateResults = this.qualityGateEvaluator.evaluateQualityGates(updatedMetrics);
            const qualityGateStatus = this.qualityGateEvaluator.determineQualityGateStatus(qualityGateResults);
            // Create file analyses
            const fileAnalyses = await this.fileAnalyzer.analyzeFiles(files, issues);
            const result = {
                projectKey: "reynard",
                analysisDate,
                metrics: updatedMetrics,
                issues,
                qualityGateStatus,
                qualityGateDetails: qualityGateResults,
                languages: languageAnalyses,
                files: fileAnalyses,
            };
            // Store in history
            this.analysisHistory.push(result);
            const duration = Date.now() - startTime;
            console.log(`✅ Code quality analysis complete in ${duration}ms`);
            this.emit("analysisComplete", result);
            return result;
        }
        catch (error) {
            console.error("❌ Code quality analysis failed:", error);
            this.emit("analysisError", error);
            throw error;
        }
    }
    getAnalysisHistory() {
        return [...this.analysisHistory];
    }
    getLatestAnalysis() {
        return this.analysisHistory.length > 0 ? this.analysisHistory[this.analysisHistory.length - 1] : null;
    }
    addQualityGate(gate) {
        this.qualityGateEvaluator.addQualityGate(gate);
    }
    removeQualityGate(gateId) {
        this.qualityGateEvaluator.removeQualityGate(gateId);
    }
    getQualityGates() {
        return this.qualityGateEvaluator.getQualityGates();
    }
}
