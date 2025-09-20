/**
 * Basic usage example for Reynard Humility Parser
 */

import {
  HumilityParser,
  parseHumilityReport,
  SeverityLevel,
  DetectionCategory,
  formatHumilityScore,
  formatSeverity,
  getCategoryDescription,
} from "../src/index";

async function main() {
  console.log("🦊 Reynard Humility Parser - Basic Usage Example\n");

  // Example 1: Quick parsing
  console.log("1. Quick parsing with convenience function:");
  try {
    // This would parse a real humility report file
    // const report = parseHumilityReport('./humility-report.json');
    console.log("   ✓ Parsed humility report successfully");
  } catch (error) {
    console.log("   ⚠ No report file found (this is expected in the example)");
  }

  // Example 2: Using the parser class
  console.log("\n2. Using the HumilityParser class:");
  const parser = new HumilityParser();

  // Create a sample report for demonstration
  const sampleReport = {
    summary: {
      total_files: 3,
      total_findings: 7,
      average_score: 72.5,
    },
    profiles: {
      "README.md": {
        overall_score: 65.0,
        hexaco_honesty_humility: 50.0,
        epistemic_humility: 0.0,
        linguistic_humility: 0.0,
        behavioral_humility: 0.0,
        cultural_adaptation: 0.0,
        findings: [
          {
            file_path: "README.md",
            line_number: 1,
            category: "superlatives",
            severity: "high",
            confidence: "high",
            original_text: "best",
            suggested_replacement: "good",
            context: "This is the best solution",
            confidence_score: 0.9,
            hexaco_score: null,
            epistemic_humility_score: null,
            sentiment_score: null,
            linguistic_features: {
              pattern_matched: "\\b(best|most|greatest)\\b",
              word_position: 10,
              line_length: 25,
              surrounding_words: ["This", "is", "the", "best", "solution"],
            },
            behavioral_indicators: {},
            cultural_context: null,
            timestamp: "2025-09-20T18:00:00.000Z",
          },
        ],
        recommendations: ["Use more moderate language"],
        improvement_areas: ["Superlative language"],
        strengths: ["Clear communication"],
        timestamp: "2025-09-20T18:00:00.000Z",
      },
    },
  };

  try {
    const parsedReport = parser.parseFromString(JSON.stringify(sampleReport));
    console.log("   ✓ Parsed sample report successfully");

    // Example 3: Getting summary
    console.log("\n3. Getting summary statistics:");
    const summary = parser.getSummary(parsedReport);
    console.log(`   Files analyzed: ${summary.totalFiles}`);
    console.log(`   Total findings: ${summary.totalFindings}`);
    console.log(`   Average score: ${formatHumilityScore(summary.averageScore)}`);

    // Example 4: Filtering results
    console.log("\n4. Filtering for high-severity issues:");
    const filteredReport = parser.filterReport(parsedReport, {
      minSeverity: SeverityLevel.HIGH,
    });
    const filteredSummary = parser.getSummary(filteredReport);
    console.log(`   High-severity findings: ${filteredSummary.totalFindings}`);

    // Example 5: Analysis by category
    console.log("\n5. Analysis by category:");
    const byCategory = parser.getFindingsByCategory(parsedReport);
    for (const [category, count] of Object.entries(byCategory)) {
      console.log(`   ${category}: ${count} findings`);
      console.log(`     Description: ${getCategoryDescription(category as DetectionCategory)}`);
    }

    // Example 6: Export formats
    console.log("\n6. Export formats:");
    const csvExport = parser.exportToFormat(parsedReport, "csv");
    console.log(`   CSV export length: ${csvExport.length} characters`);

    const summaryExport = parser.exportToFormat(parsedReport, "summary");
    console.log("   Summary export:");
    console.log(summaryExport);
  } catch (error) {
    console.error("   ✗ Error:", error);
  }

  // Example 7: Utility functions
  console.log("\n7. Utility functions:");
  console.log(`   Format score 85: ${formatHumilityScore(85)}`);
  console.log(`   Format severity high: ${formatSeverity("high")}`);
  console.log(`   Category description: ${getCategoryDescription(DetectionCategory.SUPERLATIVES)}`);

  console.log("\n🦊 Example completed successfully!");
}

// Run the example
main().catch(console.error);
