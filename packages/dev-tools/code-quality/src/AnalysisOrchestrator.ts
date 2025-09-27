/**
 * 🦦 Reynard Analysis Orchestrator
 *
 * *splashes with coordination* Orchestrates complex analysis workflows
 * across multiple engines and components.
 */

import { AIAnalysisEngine } from "./AIAnalysisEngine";
import { BehavioralAnalysisEngine } from "./BehavioralAnalysisEngine";
import { CodeQualityAnalyzer } from "./CodeQualityAnalyzer";
import { EnhancedSecurityEngine } from "./EnhancedSecurityEngine";
import { DatabaseQualityGateManager } from "./DatabaseQualityGateManager";
import { SecurityAnalysisIntegration } from "./SecurityAnalysisIntegration";

export interface AnalysisSystem {
  analyzer: CodeQualityAnalyzer;
  qualityGateManager: DatabaseQualityGateManager;
  securityIntegration: SecurityAnalysisIntegration;
  aiEngine: AIAnalysisEngine;
  behavioralEngine: BehavioralAnalysisEngine;
  enhancedSecurityEngine: EnhancedSecurityEngine;
}

export interface CompleteAnalysisResult {
  analysis: any;
  security: any;
  qualityGates: any[];
  timestamp: string;
}

export interface EnhancedAnalysisResult extends CompleteAnalysisResult {
  ai: any[];
  behavioral: any;
  enhancedSecurity: any;
}

/**
 * 🦦 Analysis Orchestrator
 *
 * *webbed paws coordinate perfectly* Manages complex analysis workflows
 * with the precision of an otter navigating through crystal-clear streams.
 */
export class AnalysisOrchestrator {
  constructor(private readonly system: AnalysisSystem) {}

  /**
   * 🦦 Run complete analysis
   *
   * *dives deep into the analysis pool* Coordinates all analysis engines
   * to provide comprehensive code quality insights.
   */
  async runCompleteAnalysis(environment: string = "development"): Promise<CompleteAnalysisResult> {
    console.log("🦦 Starting complete code quality analysis...");

    // Run code quality analysis
    const analysisResult = await this.system.analyzer.analyzeProject();

    // Run security analysis
    const files = analysisResult.files.map((f: any) => f.path);
    const securityResult = await this.system.securityIntegration.runSecurityAnalysis(files);

    // Evaluate quality gates
    const qualityGateResults = await this.system.qualityGateManager.evaluateQualityGates(analysisResult.metrics, environment);

    return {
      analysis: analysisResult,
      security: securityResult,
      qualityGates: qualityGateResults,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 🦦 Run enhanced analysis with AI and behavioral insights
   *
   * *swims through advanced analysis streams* Combines traditional analysis
   * with cutting-edge AI and behavioral insights for maximum coverage.
   */
  async runEnhancedAnalysis(environment: string = "development"): Promise<EnhancedAnalysisResult> {
    console.log("🦦 Starting enhanced code quality analysis...");

    // Run complete analysis
    const basicResults = await this.runCompleteAnalysis(environment);

    // Run AI analysis on key files
    const aiResults = await this.runAIAnalysis(basicResults.analysis.files);

    // Run behavioral analysis
    const behavioralResult = await this.system.behavioralEngine.analyzeBehavior();

    // Run enhanced security analysis
    const files = basicResults.analysis.files.map((f: any) => f.path);
    const enhancedSecurityResult = await this.system.enhancedSecurityEngine.runSecurityAnalysis(files);

    return {
      ...basicResults,
      ai: aiResults,
      behavioral: behavioralResult,
      enhancedSecurity: enhancedSecurityResult,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 🦦 Run AI analysis on key files
   *
   * *whiskers quiver with AI excitement* Analyzes the most important files
   * with AI-powered insights.
   */
  private async runAIAnalysis(files: any[]): Promise<any[]> {
    const keyFiles = files.slice(0, 5); // Analyze top 5 files

    const aiResults = await Promise.all(
      keyFiles.map(async (file: any) => {
        try {
          return await this.system.aiEngine.analyzeCode({
            filePath: file.path,
            content: file.content || "",
            language: file.language || "typescript",
            projectType: "reynard",
            dependencies: [],
            recentChanges: [],
            relatedFiles: [],
          });
        } catch (error) {
          console.warn(`AI analysis failed for ${file.path}:`, error);
          return null;
        }
      })
    );

    return aiResults.filter((r: any) => r !== null);
  }

  /**
   * 🦦 Initialize the analysis system
   *
   * *sleek fur glistens with preparation* Sets up the analysis system
   * with default configurations and quality gates.
   */
  async initialize(): Promise<void> {
    await this.system.qualityGateManager.loadConfiguration();

    // Create default quality gates if none exist
    const gates = await this.system.qualityGateManager.getQualityGates();
    if (gates.length === 0) {
      await this.system.qualityGateManager.createReynardQualityGates();
    }
  }
}
