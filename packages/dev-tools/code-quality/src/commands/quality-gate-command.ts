#!/usr/bin/env node
/**
 * 🦊 Quality Gate Command Handler
 *
 * *whiskers twitch with intelligence* Handles quality gate evaluation
 * for specific environments and metrics.
 */

import { readFile } from "fs/promises";
import { CodeQualityAnalyzer } from "../CodeQualityAnalyzer";
import { QualityGateManager } from "../QualityGateManager";

export interface QualityGateOptions {
  project: string;
  environment: string;
  metrics?: string;
}

function getStatusIcon(status: string): string {
  if (status === "PASSED") return "✅";
  if (status === "WARN") return "⚠️";
  return "❌";
}

function displayQualityGateResult(result: any): void {
  const statusIcon = getStatusIcon(result.status);

  console.log(`\n${statusIcon} ${result.gateName}`);
  console.log(`   Status: ${result.status}`);
  console.log(`   Score: ${result.overallScore.toFixed(1)}%`);
  console.log(`   Passed: ${result.passedConditions}/${result.totalConditions}`);

  if (result.failedConditions > 0) {
    console.log(`   Failed: ${result.failedConditions}`);
  }

  if (result.warningConditions > 0) {
    console.log(`   Warnings: ${result.warningConditions}`);
  }

  // Show failed conditions
  const failedConditions = result.conditions.filter((c: any) => c.status === "FAILED");
  if (failedConditions.length > 0) {
    console.log("   Failed Conditions:");
    for (const condition of failedConditions) {
      console.log(
        `     - ${condition.condition.metric} ${condition.condition.operator} ${condition.condition.threshold} (actual: ${condition.actualValue})`
      );
    }
  }
}

async function loadMetrics(options: QualityGateOptions): Promise<any> {
  if (options.metrics) {
    const metricsData = await readFile(options.metrics, "utf-8");
    return JSON.parse(metricsData);
  }

  // Run quick analysis to get metrics
  const analyzer = new CodeQualityAnalyzer(options.project);
  const analysisResult = await analyzer.analyzeProject();
  return analysisResult.metrics;
}

export async function handleQualityGateCommand(options: QualityGateOptions): Promise<void> {
  try {
    const qualityGateManager = new QualityGateManager(options.project);
    await qualityGateManager.loadConfiguration();

    const metrics = await loadMetrics(options);
    const results = qualityGateManager.evaluateQualityGates(metrics, options.environment);

    console.log("🦊 Quality Gate Evaluation Results:");
    console.log("=====================================");

    for (const result of results) {
      displayQualityGateResult(result);
    }

    const hasFailures = results.some(gate => gate.status === "FAILED");
    process.exit(hasFailures ? 1 : 0);
  } catch (error: any) {
    console.error("❌ Quality gate evaluation failed:", error.message);
    process.exit(1);
  }
}
