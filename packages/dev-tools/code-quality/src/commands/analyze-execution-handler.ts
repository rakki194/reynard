/**
 * Analyze Execution Handler
 *
 * Handles the execution of code quality analysis, including security analysis
 * and quality gate evaluation.
 */

import { CodeQualityAnalyzer } from "../CodeQualityAnalyzer";
import { DatabaseQualityGateManager } from "../DatabaseQualityGateManager";
import { SecurityAnalysisIntegration } from "../SecurityAnalysisIntegration";
import { AnalyzeOptions } from "./analyze-command";

export interface AnalysisExecutionResult {
  analysisResult: any;
  securityResult: any;
  qualityGateResults: any[];
  duration: number;
}

/**
 * Execute the main analysis workflow
 */
export async function executeAnalysis(options: AnalyzeOptions): Promise<AnalysisExecutionResult> {
  const analyzer = new CodeQualityAnalyzer(options.project);
  const backendUrl = process.env.REYNARD_BACKEND_URL || "http://localhost:8000";
  const apiKey = process.env.REYNARD_API_KEY;
  const qualityGateManager = new DatabaseQualityGateManager(backendUrl, apiKey);
  const securityIntegration = new SecurityAnalysisIntegration(options.project);

  // Load quality gate configuration
  await qualityGateManager.loadConfiguration();

  // Run analysis
  const startTime = Date.now();
  const analysisResult = await analyzer.analyzeProject();

  // Run security analysis if requested
  const securityResult = await runSecurityAnalysisIfRequested(options, securityIntegration, analysisResult);

  // Evaluate quality gates
  const qualityGateResults = await evaluateQualityGates(options, qualityGateManager, analysisResult);

  const duration = Date.now() - startTime;

  return {
    analysisResult,
    securityResult,
    qualityGateResults,
    duration,
  };
}

/**
 * Run security analysis if requested
 */
async function runSecurityAnalysisIfRequested(
  options: AnalyzeOptions,
  securityIntegration: SecurityAnalysisIntegration,
  analysisResult: any
): Promise<any> {
  if (options.security === true) {
    console.log("🐺 Starting comprehensive security analysis...");
    const files = analysisResult.files.map((f: any) => f.path);
    return await securityIntegration.runSecurityAnalysis(files);
  } else {
    console.log("⏭️ Skipping security analysis (use --security to enable)");
    return null;
  }
}

/**
 * Evaluate quality gates if requested
 */
async function evaluateQualityGates(
  options: AnalyzeOptions,
  qualityGateManager: DatabaseQualityGateManager,
  analysisResult: any
): Promise<any[]> {
  if (options.qualityGates !== false) {
    return qualityGateManager.evaluateQualityGates(analysisResult.metrics, options.environment);
  }
  return [];
}
