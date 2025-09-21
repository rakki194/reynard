/**
 * Reynard Code Quality Analyzer
 *
 * A comprehensive code quality analysis engine that unifies all Reynard's existing tools into a SonarQube-like system.
 *
 * Features:
 * - Multi-language static analysis
 * - Security vulnerability detection
 * - Code complexity metrics
 * - Technical debt tracking
 * - Quality gates enforcement
 * - Trend analysis and reporting
 * - Emoji and roleplay language detection
 */

import { EventEmitter } from "events";
import { FileAnalyzer } from "./FileAnalyzer";
import { FileDiscoveryService } from "./FileDiscoveryService";
import { IssueDetector } from "./IssueDetector";
import { LanguageAnalyzer } from "./LanguageAnalyzer";
import { MetricsCalculator } from "./MetricsCalculator";
import { QualityGateEvaluator } from "./QualityGateEvaluator";
import { EmojiRoleplayScanner } from "./EmojiRoleplayScanner";
import { JunkFileDetector, JunkFileAnalysis } from "./JunkFileDetector";
import { AnalysisResult, QualityGate, EmojiRoleplayMetrics, EmojiRoleplayScanResult } from "./types";

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
  private readonly emojiRoleplayScanner: EmojiRoleplayScanner;
  private readonly junkFileDetector: JunkFileDetector;

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
    this.emojiRoleplayScanner = new EmojiRoleplayScanner();
    this.junkFileDetector = new JunkFileDetector(projectRoot);
  }

  /**
   * Perform comprehensive code quality analysis
   */
  async analyzeProject(): Promise<AnalysisResult> {
    console.log("Starting comprehensive code quality analysis...");

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

      // Update metrics with junk file data
      const junkFileMetrics = await this.getJunkFileMetrics();
      const finalMetrics = this.metricsCalculator.updateMetricsWithJunkFiles(updatedMetrics, junkFileMetrics);

      // Evaluate quality gates
      const qualityGateResults = this.qualityGateEvaluator.evaluateQualityGates(finalMetrics);
      const qualityGateStatus = this.qualityGateEvaluator.determineQualityGateStatus(qualityGateResults);

      // Create file analyses
      const fileAnalyses = await this.fileAnalyzer.analyzeFiles(files, issues);

      const result: AnalysisResult = {
        projectKey: "reynard",
        analysisDate,
        metrics: finalMetrics,
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

  /**
   * Scan project for emojis and roleplay language
   */
  async scanEmojiRoleplay(): Promise<EmojiRoleplayScanResult[]> {
    console.log("Scanning for emojis and roleplay language...");
    
    const files = await this.fileDiscovery.discoverFiles(this.projectRoot);
    const supportedFiles = files.filter(file => 
      file.endsWith('.md') || 
      file.endsWith('.py') || 
      file.endsWith('.ts') || 
      file.endsWith('.tsx') || 
      file.endsWith('.js') || 
      file.endsWith('.jsx') ||
      file.endsWith('.txt')
    );

    const results = this.emojiRoleplayScanner.scanFiles(supportedFiles);
    
    console.log(`Scanned ${supportedFiles.length} files for emojis and roleplay language`);
    return results;
  }

  /**
   * Get emoji and roleplay metrics for the project
   */
  async getEmojiRoleplayMetrics(): Promise<EmojiRoleplayMetrics> {
    const scanResults = await this.scanEmojiRoleplay();
    const summary = this.emojiRoleplayScanner.getScanSummary(scanResults);
    
    const filesWithEmojis = scanResults.filter(r => r.emojiCount > 0).length;
    const filesWithRoleplay = scanResults.filter(r => 
      r.roleplayPatternCount > 0 || r.roleplayActionCount > 0
    ).length;

    // Calculate professional language score (0-100, higher is better)
    const totalFiles = scanResults.length;
    const professionalLanguageScore = totalFiles > 0 
      ? Math.max(0, 100 - (summary.totalIssues / totalFiles) * 10)
      : 100;

    return {
      totalEmojis: summary.totalEmojis,
      totalRoleplayPatterns: summary.totalRoleplayPatterns,
      totalRoleplayActions: summary.totalRoleplayActions,
      filesWithEmojis,
      filesWithRoleplay,
      professionalLanguageScore: Math.round(professionalLanguageScore)
    };
  }

  /**
   * Generate emoji and roleplay scan report
   */
  async generateEmojiRoleplayReport(): Promise<string> {
    const scanResults = await this.scanEmojiRoleplay();
    return this.emojiRoleplayScanner.generateReport(scanResults);
  }

  /**
   * Scan specific files for emojis and roleplay language
   */
  scanFilesForEmojiRoleplay(filePaths: string[]): EmojiRoleplayScanResult[] {
    return this.emojiRoleplayScanner.scanFiles(filePaths);
  }

  /**
   * Detect Git-tracked junk files and development artifacts
   */
  async detectJunkFiles(): Promise<JunkFileAnalysis> {
    console.log("🔍 Detecting Git-tracked junk files...");
    return await this.junkFileDetector.detectJunkFiles();
  }

  /**
   * Generate junk file detection report
   */
  async generateJunkFileReport(): Promise<string> {
    const analysis = await this.detectJunkFiles();
    return this.junkFileDetector.generateReport(analysis);
  }

  /**
   * Get junk file metrics for quality gates
   */
  async getJunkFileMetrics(): Promise<{
    totalJunkFiles: number;
    criticalJunkFiles: number;
    highJunkFiles: number;
    qualityScore: number;
  }> {
    const analysis = await this.detectJunkFiles();
    return {
      totalJunkFiles: analysis.totalFiles,
      criticalJunkFiles: analysis.criticalIssues,
      highJunkFiles: analysis.highIssues,
      qualityScore: analysis.qualityScore
    };
  }
}
