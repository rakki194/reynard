#!/usr/bin/env node

/**
 * ADR Analysis CLI Tool
 *
 * Command-line interface for running codebase analysis and generating ADR suggestions.
 */

import { Command } from "commander";
import { CodebaseAnalyzer } from "./CodebaseAnalyzer";
import { ADRGenerator } from "./ADRGenerator";
import { ADRValidator } from "./ADRValidator";
import { ADRRelationshipMapper } from "./ADRRelationshipMapper";
import { join } from "path";

const program = new Command();

program
  .name("adr-analyze")
  .description("Reynard ADR System - Intelligent Architecture Decision Record Analysis")
  .version("1.0.0");

program
  .command("analyze")
  .description("Analyze codebase and generate ADR suggestions")
  .option("-p, --path <path>", "Path to codebase root", ".")
  .option("-o, --output <path>", "Output directory for ADRs", "./docs/architecture/decisions")
  .option("-t, --templates <path>", "Templates directory", "./docs/architecture/decisions/templates")
  .option("--generate", "Generate ADRs from suggestions")
  .option("--validate", "Validate existing ADRs")
  .option("--relationships", "Analyze ADR relationships")
  .action(async options => {
    console.log("🦊 Reynard ADR System - Starting Analysis");
    console.log("==========================================");

    try {
      const analyzer = new CodebaseAnalyzer(options.path);
      const analysis = await analyzer.analyzeCodebase();

      console.log("\n📊 Codebase Metrics:");
      console.log(`  Total Files: ${analysis.metrics.totalFiles}`);
      console.log(`  Total Lines: ${analysis.metrics.totalLines.toLocaleString()}`);
      console.log(`  Average File Size: ${analysis.metrics.averageFileSize.toFixed(1)} lines`);
      console.log(`  Complexity Score: ${analysis.metrics.complexityScore.toFixed(1)}`);

      console.log("\n🏗️ Architecture Patterns:");
      for (const pattern of analysis.patterns) {
        console.log(`  ${pattern.type}: ${(pattern.confidence * 100).toFixed(1)}% confidence`);
      }

      console.log("\n📈 Code Quality:");
      console.log(`  Test Coverage: ${analysis.quality.testCoverage.toFixed(1)}%`);
      console.log(`  Documentation Coverage: ${analysis.quality.documentationCoverage.toFixed(1)}%`);
      console.log(`  Code Smells: ${analysis.quality.codeSmells.length}`);

      console.log("\n💡 ADR Suggestions:");
      for (const suggestion of analysis.suggestions) {
        console.log(`  [${suggestion.priority.toUpperCase()}] ${suggestion.title}`);
        console.log(`    Category: ${suggestion.category}`);
        console.log(`    Impact: ${suggestion.estimatedImpact}`);
        console.log(`    Evidence: ${suggestion.evidence.length} items`);
        console.log("");
      }

      if (options.generate && analysis.suggestions.length > 0) {
        console.log("🦊 Generating ADRs from suggestions...");
        const generator = new ADRGenerator(options.output, options.templates);
        const generatedFiles = await generator.generateMultipleADRs(analysis.suggestions);

        console.log(`✅ Generated ${generatedFiles.length} ADR files:`);
        for (const file of generatedFiles) {
          console.log(`  - ${file}`);
        }
      }

      if (options.validate) {
        console.log("\n🔍 Validating existing ADRs...");
        const validator = new ADRValidator(options.output);
        const results = await validator.validateAllADRs();

        let validCount = 0;
        let totalErrors = 0;
        let totalWarnings = 0;

        for (const [file, result] of results) {
          if (result.isValid) {
            validCount++;
          }
          totalErrors += result.errors.length;
          totalWarnings += result.warnings.length;

          if (!result.isValid || result.warnings.length > 0) {
            console.log(`\n📄 ${file}:`);
            if (result.errors.length > 0) {
              console.log("  ❌ Errors:");
              for (const error of result.errors) {
                console.log(`    - ${error}`);
              }
            }
            if (result.warnings.length > 0) {
              console.log("  ⚠️ Warnings:");
              for (const warning of result.warnings) {
                console.log(`    - ${warning}`);
              }
            }
          }
        }

        console.log(`\n📊 Validation Summary:`);
        console.log(`  Valid ADRs: ${validCount}/${results.size}`);
        console.log(`  Total Errors: ${totalErrors}`);
        console.log(`  Total Warnings: ${totalWarnings}`);
      }

      if (options.relationships) {
        console.log("\n🔗 Analyzing ADR relationships...");
        const mapper = new ADRRelationshipMapper(options.output);
        const relationships = await mapper.analyzeRelationships();

        console.log(`Found ${relationships.length} relationships:`);
        for (const rel of relationships) {
          console.log(`  ${rel.source} -> ${rel.target} (${rel.type}, strength: ${rel.strength})`);
        }

        const cycles = mapper.detectCircularDependencies();
        if (cycles.length > 0) {
          console.log(`\n⚠️ Circular dependencies detected:`);
          for (const cycle of cycles) {
            console.log(`  ${cycle.join(" -> ")} -> ${cycle[0]}`);
          }
        }
      }

      console.log("\n🎉 Analysis complete!");
    } catch (error) {
      console.error("❌ Analysis failed:", error);
      process.exit(1);
    }
  });

program
  .command("validate")
  .description("Validate existing ADRs")
  .option("-p, --path <path>", "Path to ADR directory", "./docs/architecture/decisions")
  .action(async options => {
    console.log("🔍 Validating ADRs...");

    try {
      const validator = new ADRValidator(options.path);
      const results = await validator.validateAllADRs();

      let validCount = 0;
      let totalErrors = 0;
      let totalWarnings = 0;

      for (const [file, result] of results) {
        if (result.isValid) {
          validCount++;
        }
        totalErrors += result.errors.length;
        totalWarnings += result.warnings.length;

        if (!result.isValid || result.warnings.length > 0) {
          console.log(`\n📄 ${file}:`);
          if (result.errors.length > 0) {
            console.log("  ❌ Errors:");
            for (const error of result.errors) {
              console.log(`    - ${error}`);
            }
          }
          if (result.warnings.length > 0) {
            console.log("  ⚠️ Warnings:");
            for (const warning of result.warnings) {
              console.log(`    - ${warning}`);
            }
          }
        }
      }

      console.log(`\n📊 Validation Summary:`);
      console.log(`  Valid ADRs: ${validCount}/${results.size}`);
      console.log(`  Total Errors: ${totalErrors}`);
      console.log(`  Total Warnings: ${totalWarnings}`);
    } catch (error) {
      console.error("❌ Validation failed:", error);
      process.exit(1);
    }
  });

program
  .command("relationships")
  .description("Analyze ADR relationships")
  .option("-p, --path <path>", "Path to ADR directory", "./docs/architecture/decisions")
  .action(async options => {
    console.log("🔗 Analyzing ADR relationships...");

    try {
      const mapper = new ADRRelationshipMapper(options.path);
      const relationships = await mapper.analyzeRelationships();

      console.log(`Found ${relationships.length} relationships:`);
      for (const rel of relationships) {
        console.log(`  ${rel.source} -> ${rel.target} (${rel.type}, strength: ${rel.strength})`);
      }

      const cycles = mapper.detectCircularDependencies();
      if (cycles.length > 0) {
        console.log(`\n⚠️ Circular dependencies detected:`);
        for (const cycle of cycles) {
          console.log(`  ${cycle.join(" -> ")} -> ${cycle[0]}`);
        }
      }
    } catch (error) {
      console.error("❌ Relationship analysis failed:", error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
