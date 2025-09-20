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
import { AnalysisResult, QualityGate } from "./types";

export class CodeQualityAnalyzer extends EventEmitter {
  private readonly projectRoot: string;
  private readonly analysisHistory: AnalysisResult[] = [];

  // Component services
  private readonly fileDiscovery: FileDiscoveryService;
  private readonly languageAnalyzer: LanguageAnalyzer;
  private readonly metricsCalculator: MetricsCalculator;
  private readonly issueDetector: IssueDetector;
  private readonly qualityGateEvaluator: QualityGateEvaluator;
  private readonly fileAnalyzer: FileAnalyzer;

  constructor(projectRoot: string) {
    super();
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
  async analyzeProject(): Promise<AnalysisResult> {
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

      const result: AnalysisResult = {
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
    } catch (error) {
      console.error("❌ Code quality analysis failed:", error);
      this.emit("analysisError", error);
      throw error;
    }
  }

  getAnalysisHistory(): AnalysisResult[] {
    return [...this.analysisHistory];
  }

  getLatestAnalysis(): AnalysisResult | null {
    return this.analysisHistory.length > 0 ? this.analysisHistory[this.analysisHistory.length - 1] : null;
  }

  addQualityGate(gate: QualityGate): void {
    this.qualityGateEvaluator.addQualityGate(gate);
  }

  removeQualityGate(gateId: string): void {
    this.qualityGateEvaluator.removeQualityGate(gateId);
  }

  getQualityGates(): QualityGate[] {
    return this.qualityGateEvaluator.getQualityGates();
  }
}
