/**
 * @fileoverview Global teardown for component rendering benchmarks
 *
 * Cleans up benchmark environment, generates final reports,
 * and consolidates performance results.
 *
 * @author Pool-Theorist-35 (Reynard Otter Specialist)
 * @since 1.0.0
 */

import { FullConfig } from "@playwright/test";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function globalTeardown(config: FullConfig) {
  console.log("\n🦦 Cleaning up benchmark environment...");

  const resultsDir = join(__dirname, "../../results");

  try {
    // Read benchmark results if they exist
    const resultsFile = join(resultsDir, "benchmark-results.json");
    let results = [];

    if (existsSync(resultsFile)) {
      const resultsData = readFileSync(resultsFile, "utf8");
      const parsedData = JSON.parse(resultsData);
      results = Array.isArray(parsedData) ? parsedData : [];
      console.log(`✅ Found ${results.length} benchmark results`);
    }

    // Generate final summary report
    const summaryReport = generateSummaryReport(results);
    writeFileSync(join(resultsDir, "benchmark-summary.md"), summaryReport);

    // Generate performance recommendations
    const recommendations = generateRecommendations(results);
    writeFileSync(join(resultsDir, "benchmark-recommendations.json"), JSON.stringify(recommendations, null, 2));

    console.log("✅ Generated summary report");
    console.log("✅ Generated performance recommendations");

    // Display final summary
    console.log("\n📊 BENCHMARK SUMMARY:");
    console.log("====================");
    console.log(summaryReport);

    console.log("\n🎯 RECOMMENDATIONS:");
    console.log("===================");
    recommendations.forEach(rec => {
      console.log(`• ${rec.category}: ${rec.approach} - ${rec.reason}`);
    });

    console.log("\n🦦 *splashes with satisfaction* Benchmark cleanup complete!\n");
  } catch (error) {
    console.error("❌ Error during benchmark teardown:", error);
  }
}

function generateSummaryReport(results: any[]): string {
  if (results.length === 0) {
    return "# Benchmark Summary\n\nNo benchmark results found.\n";
  }

  // Group results by category and approach
  const groupedResults = results.reduce(
    (acc, result) => {
      const key = `${result.category}-${result.approach}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(result);
      return acc;
    },
    {} as Record<string, any[]>
  );

  let report = "# Reynard Component Rendering Benchmark Summary\n\n";
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Total Tests:** ${results.length}\n\n`;

  // Summary by category
  const categories = [...new Set(results.map(r => r.category))];
  report += "## Performance by Category\n\n";

  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    const avgTime = categoryResults.reduce((sum, r) => sum + r.renderTime, 0) / categoryResults.length;

    report += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
    report += `- **Average Render Time:** ${avgTime.toFixed(2)}ms\n`;
    report += `- **Tests Run:** ${categoryResults.length}\n\n`;
  }

  // Best approaches
  report += "## Best Performing Approaches\n\n";
  const approaches = [...new Set(results.map(r => r.approach))];

  for (const approach of approaches) {
    const approachResults = results.filter(r => r.approach === approach);
    const avgTime = approachResults.reduce((sum, r) => sum + r.renderTime, 0) / approachResults.length;

    report += `### ${approach.toUpperCase()}\n`;
    report += `- **Average Render Time:** ${avgTime.toFixed(2)}ms\n`;
    report += `- **Tests Run:** ${approachResults.length}\n\n`;
  }

  return report;
}

function generateRecommendations(results: any[]): Array<{
  category: string;
  approach: string;
  reason: string;
  confidence: number;
}> {
  const recommendations = [];
  const categories = [...new Set(results.map(r => r.category))];

  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);

    // Find best approach for this category
    const bestResult = categoryResults.reduce((best, current) => {
      return current.renderTime < best.renderTime ? current : best;
    });

    let reason = "";
    let confidence = 0.8;

    switch (category) {
      case "primitives":
        reason = "Fastest rendering for simple UI components";
        confidence = 0.9;
        break;
      case "layouts":
        reason = "Optimal for complex layout structures";
        confidence = 0.85;
        break;
      case "data":
        reason = "Best performance for data-heavy components";
        confidence = 0.8;
        break;
      case "overlays":
        reason = "Efficient for on-demand rendering";
        confidence = 0.75;
        break;
      default:
        reason = "Best overall performance for this category";
        confidence = 0.7;
    }

    recommendations.push({
      category,
      approach: bestResult.approach,
      reason,
      confidence,
    });
  }

  return recommendations;
}

export default globalTeardown;
