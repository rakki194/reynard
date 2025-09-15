#!/usr/bin/env node
/**
 * 🦊 Security Command Handler
 *
 * *whiskers twitch with intelligence* Handles security analysis
 * with comprehensive vulnerability detection.
 */

import { writeFile } from "fs/promises";
import { CodeQualityAnalyzer } from "../CodeQualityAnalyzer";
import { SecurityAnalysisIntegration } from "../SecurityAnalysisIntegration";
import { displaySecuritySummary, displaySecurityTable } from "../display/security-display";

export interface SecurityOptions {
  project: string;
  output?: string;
  format: string;
}

export async function handleSecurityCommand(options: SecurityOptions): Promise<void> {
  try {
    console.log("🐺 Starting security analysis...");

    const securityIntegration = new SecurityAnalysisIntegration(options.project);
    const analyzer = new CodeQualityAnalyzer(options.project);

    // Get files to analyze
    const analysisResult = await analyzer.analyzeProject();
    const files = analysisResult.files.map(f => f.path);

    const startTime = Date.now();
    const securityResult = await securityIntegration.runSecurityAnalysis(files);
    const duration = Date.now() - startTime;

    const output = {
      security: securityResult,
      duration,
      timestamp: new Date().toISOString(),
    };

    if (options.output) {
      await writeFile(options.output, JSON.stringify(output, null, 2));
      console.log(`📄 Security results saved to ${options.output}`);
    }

    // Display results
    switch (options.format) {
      case "json":
        console.log(JSON.stringify(output, null, 2));
        break;
      case "table":
        displaySecurityTable(securityResult);
        break;
      case "summary":
      default:
        displaySecuritySummary(securityResult);
        break;
    }

    // Exit with appropriate code
    const hasCriticalIssues =
      securityResult.summary.criticalVulnerabilities > 0 || securityResult.summary.highVulnerabilities > 0;
    process.exit(hasCriticalIssues ? 1 : 0);
  } catch (error: any) {
    console.error("❌ Security analysis failed:", error.message);
    process.exit(1);
  }
}
