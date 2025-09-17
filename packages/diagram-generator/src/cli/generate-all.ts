#!/usr/bin/env node
/**
 * 🦊 Generate All Diagrams CLI
 *
 * Command-line interface for generating all Reynard project diagrams.
 */

import { DiagramGeneratorMain } from "../core/DiagramGenerator.js";
import type { DiagramGenerationConfig } from "../types.js";
import { program } from "commander";
import { resolve } from "path";

// Default configuration
const defaultConfig: DiagramGenerationConfig = {
  outputDir: "./diagrams",
  generateSvg: true,
  generatePng: true,
  generateHighRes: false,
  theme: "neutral",
  maxComplexity: 50,
  includeFilePaths: true,
  includeRelationships: true,
  includeMetadata: true,
};

program
  .name("generate-all")
  .description("Generate all Reynard project diagrams")
  .version("0.1.0")
  .option("-o, --output <dir>", "Output directory", defaultConfig.outputDir)
  .option("--no-svg", "Skip SVG generation")
  .option("--no-png", "Skip PNG generation")
  .option("--high-res", "Generate high-resolution PNGs")
  .option("-t, --theme <theme>", "Diagram theme", defaultConfig.theme)
  .option("--max-complexity <number>", "Maximum diagram complexity", String(defaultConfig.maxComplexity))
  .option("--no-file-paths", "Exclude file paths from diagrams")
  .option("--no-relationships", "Exclude relationship details")
  .option("--no-metadata", "Exclude metadata from diagrams")
  .option("-r, --root <path>", "Project root path", "/home/kade/runeset/reynard")
  .action(async options => {
    try {
      console.log("🦊 Reynard Diagram Generator");
      console.log("============================");
      console.log("");

      const config: DiagramGenerationConfig = {
        outputDir: resolve(options.output),
        generateSvg: options.svg,
        generatePng: options.png,
        generateHighRes: options.highRes,
        theme: options.theme,
        maxComplexity: parseInt(options.maxComplexity),
        includeFilePaths: options.filePaths,
        includeRelationships: options.relationships,
        includeMetadata: options.metadata,
      };

      console.log("Configuration:");
      console.log(`  Output Directory: ${config.outputDir}`);
      console.log(`  Generate SVG: ${config.generateSvg}`);
      console.log(`  Generate PNG: ${config.generatePng}`);
      console.log(`  High Resolution: ${config.generateHighRes}`);
      console.log(`  Theme: ${config.theme}`);
      console.log(`  Max Complexity: ${config.maxComplexity}`);
      console.log("");

      const generator = new DiagramGeneratorMain(options.root);
      const result = await generator.generateAll(config);

      console.log("");
      console.log("📊 Generation Summary:");
      console.log(`  Total Diagrams: ${result.summary.totalDiagrams}`);
      console.log(`  Successful: ${result.summary.successfulGenerations}`);
      console.log(`  Failed: ${result.summary.failedGenerations}`);
      console.log(`  Total Time: ${result.summary.totalTime}ms`);
      console.log(`  Output Directory: ${result.summary.outputDirectory}`);
      console.log("");

      if (result.errors.length > 0) {
        console.log("⚠️ Errors:");
        for (const error of result.errors) {
          console.log(`  - ${error.message}`);
        }
        console.log("");
      }

      console.log("🎉 Diagram generation complete!");
      console.log(`📁 Check the output directory: ${config.outputDir}`);
    } catch (error) {
      console.error("❌ Generation failed:", error);
      process.exit(1);
    }
  });

program.parse();
