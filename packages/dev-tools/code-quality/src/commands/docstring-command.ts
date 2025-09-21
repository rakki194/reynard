/**
 * 🦦 Reynard Docstring Validation Command
 *
 * *splashes with thoroughness* CLI command for analyzing docstring
 * coverage and quality across the codebase.
 */

import { Command } from "commander";
import { DocstringAnalyzer } from "../DocstringAnalyzer";
import { FileDiscoveryService } from "../FileDiscoveryService";

export function createDocstringCommand(): Command {
  const command = new Command("docstring");
  
  command
    .description("🦦 Analyze docstring coverage and quality")
    .option("-p, --path <path>", "Path to analyze (default: current directory)", ".")
    .option("-f, --format <format>", "Output format (table, json, summary)", "table")
    .option("--min-coverage <percentage>", "Minimum coverage percentage threshold", "80")
    .option("--min-quality <score>", "Minimum quality score threshold", "70")
    .option("--include-files <pattern>", "Include files matching pattern (glob)", "**/*.{py,ts,tsx}")
    .option("--exclude-files <pattern>", "Exclude files matching pattern (glob)", "**/node_modules/**,**/dist/**,**/build/**")
    .action(async (options) => {
      try {
        console.log("🦦 Starting docstring analysis...");
        
        const analyzer = new DocstringAnalyzer();
        const fileDiscovery = new FileDiscoveryService();
        
        // Discover files
        const files = await fileDiscovery.discoverFiles(options.path);
        const docstringFiles = files.filter(f => 
          f.endsWith(".py") || f.endsWith(".ts") || f.endsWith(".tsx")
        );
        
        if (docstringFiles.length === 0) {
          console.log("ℹ️ No Python or TypeScript files found to analyze");
          return;
        }
        
        console.log(`📁 Found ${docstringFiles.length} files to analyze`);
        
        // Analyze files
        const analyses = await analyzer.analyzeFiles(docstringFiles);
        const overallMetrics = analyzer.getOverallMetrics(analyses);
        
        // Display results based on format
        switch (options.format) {
          case "json":
            console.log(JSON.stringify({ analyses, overallMetrics }, null, 2));
            break;
          case "summary":
            displaySummary(overallMetrics, options);
            break;
          case "table":
          default:
            displayTable(analyses, overallMetrics, options);
            break;
        }
        
        // Check thresholds
        const coveragePassed = overallMetrics.coveragePercentage >= parseFloat(options.minCoverage);
        const qualityPassed = overallMetrics.qualityScore >= parseFloat(options.minQuality);
        
        if (!coveragePassed || !qualityPassed) {
          console.log("\n❌ Quality gates failed:");
          if (!coveragePassed) {
            console.log(`  - Docstring coverage: ${overallMetrics.coveragePercentage.toFixed(1)}% < ${options.minCoverage}%`);
          }
          if (!qualityPassed) {
            console.log(`  - Quality score: ${overallMetrics.qualityScore} < ${options.minQuality}`);
          }
          process.exit(1);
        } else {
          console.log("\n✅ All quality gates passed!");
        }
        
      } catch (error) {
        console.error("❌ Docstring analysis failed:", error);
        process.exit(1);
      }
    });
  
  return command;
}

function displaySummary(metrics: any, options: any): void {
  console.log("\n📊 Docstring Analysis Summary");
  console.log("=" .repeat(50));
  console.log(`📁 Total Files Analyzed: ${metrics.totalFunctions + metrics.totalClasses + metrics.totalModules}`);
  console.log(`📝 Functions: ${metrics.documentedFunctions}/${metrics.totalFunctions} documented (${((metrics.documentedFunctions / Math.max(metrics.totalFunctions, 1)) * 100).toFixed(1)}%)`);
  console.log(`🏗️  Classes: ${metrics.documentedClasses}/${metrics.totalClasses} documented (${((metrics.documentedClasses / Math.max(metrics.totalClasses, 1)) * 100).toFixed(1)}%)`);
  console.log(`📦 Modules: ${metrics.documentedModules}/${metrics.totalModules} documented (${((metrics.documentedModules / Math.max(metrics.totalModules, 1)) * 100).toFixed(1)}%)`);
  console.log(`📈 Overall Coverage: ${metrics.coveragePercentage.toFixed(1)}%`);
  console.log(`⭐ Quality Score: ${metrics.qualityScore}/100`);
  console.log(`📏 Average Docstring Length: ${metrics.averageDocstringLength.toFixed(1)} characters`);
  
  // Quality assessment
  const coverageGrade = getGrade(metrics.coveragePercentage);
  const qualityGrade = getGrade(metrics.qualityScore);
  console.log(`\n🎯 Coverage Grade: ${coverageGrade}`);
  console.log(`🎯 Quality Grade: ${qualityGrade}`);
}

function displayTable(analyses: any[], overallMetrics: any, options: any): void {
  console.log("\n📊 Docstring Analysis Results");
  console.log("=" .repeat(100));
  
  // File-by-file breakdown
  console.log("\n📁 File Analysis:");
  console.log("File".padEnd(50) + "Language".padEnd(10) + "Functions".padEnd(12) + "Classes".padEnd(10) + "Coverage".padEnd(10) + "Quality");
  console.log("-".repeat(100));
  
  for (const analysis of analyses) {
    const funcCoverage = analysis.metrics.totalFunctions > 0 
      ? ((analysis.metrics.documentedFunctions / analysis.metrics.totalFunctions) * 100).toFixed(1) + "%"
      : "N/A";
    const classCoverage = analysis.metrics.totalClasses > 0
      ? ((analysis.metrics.documentedClasses / analysis.metrics.totalClasses) * 100).toFixed(1) + "%"
      : "N/A";
    
    const fileName = analysis.file.split("/").pop() || analysis.file;
    const language = analysis.language.toUpperCase();
    const functions = `${analysis.metrics.documentedFunctions}/${analysis.metrics.totalFunctions}`;
    const classes = `${analysis.metrics.documentedClasses}/${analysis.metrics.totalClasses}`;
    const quality = analysis.metrics.qualityScore;
    
    console.log(
      fileName.padEnd(50) + 
      language.padEnd(10) + 
      functions.padEnd(12) + 
      classes.padEnd(10) + 
      funcCoverage.padEnd(10) + 
      quality.toString()
    );
  }
  
  // Overall summary
  console.log("\n📈 Overall Metrics:");
  console.log("-".repeat(50));
  console.log(`Total Functions: ${overallMetrics.totalFunctions}`);
  console.log(`Documented Functions: ${overallMetrics.documentedFunctions}`);
  console.log(`Total Classes: ${overallMetrics.totalClasses}`);
  console.log(`Documented Classes: ${overallMetrics.documentedClasses}`);
  console.log(`Total Modules: ${overallMetrics.totalModules}`);
  console.log(`Documented Modules: ${overallMetrics.documentedModules}`);
  console.log(`Overall Coverage: ${overallMetrics.coveragePercentage.toFixed(1)}%`);
  console.log(`Quality Score: ${overallMetrics.qualityScore}/100`);
  console.log(`Average Docstring Length: ${overallMetrics.averageDocstringLength.toFixed(1)} characters`);
  
  // Issues summary
  const totalIssues = analyses.reduce((sum, analysis) => sum + analysis.issues.length, 0);
  if (totalIssues > 0) {
    console.log(`\n⚠️  Total Issues Found: ${totalIssues}`);
    
    // Group issues by type
    const issueTypes = new Map<string, number>();
    for (const analysis of analyses) {
      for (const issue of analysis.issues) {
        const type = issue.rule;
        issueTypes.set(type, (issueTypes.get(type) || 0) + 1);
      }
    }
    
    console.log("\nIssue Breakdown:");
    for (const [type, count] of issueTypes) {
      console.log(`  ${type}: ${count}`);
    }
  } else {
    console.log("\n✅ No docstring issues found!");
  }
}

function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}
