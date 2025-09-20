#!/usr/bin/env node

/**
 * 🦊 Real Ecosystem Frontend-Backend Relationship Diagram Generator
 *
 * Generates comprehensive diagrams of the actual Reynard ecosystem
 * by analyzing the real codebase structure.
 */

import { DiagramGeneratorMain } from "./src/core/DiagramGenerator.js";
import { writeFile } from "fs/promises";
import { join } from "path";

async function generateRealEcosystemDiagram() {
  console.log("🐉 Generating Real Reynard Ecosystem Diagram...");

  try {
    // Create diagram generator with real codebase analysis
    const generator = new DiagramGeneratorMain("/home/kade/runeset/reynard");

    const config = {
      outputDir: "./diagrams",
      generateSvg: false,
      generatePng: false,
      generateHighRes: false,
      theme: "neutral" as const,
      maxComplexity: 100,
      includeFilePaths: true,
      includeRelationships: true,
      includeMetadata: true,
    };

    console.log("📊 Analyzing real Reynard codebase...");

    // Generate the diagram using real codebase analysis
    const result = await generator.generateDiagram("frontend-backend-relationships", config);

    if (result && result.mermaidContent) {
      const diagram = result;

      // Create diagrams directory
      await import("fs/promises").then(fs => fs.mkdir("./diagrams", { recursive: true }));

      // Save Mermaid content
      const mermaidPath = join(config.outputDir, "real-ecosystem-relationships.mmd");
      await writeFile(mermaidPath, diagram.mermaidContent);

      console.log(`✅ Real ecosystem diagram generated successfully!`);
      console.log(`📄 Mermaid file: ${mermaidPath}`);
      console.log(`📊 Nodes: ${diagram.metadata.nodeCount}`);
      console.log(`🔗 Edges: ${diagram.metadata.edgeCount}`);
      console.log(`📈 Complexity: ${diagram.metadata.complexityScore}`);
      console.log(`📁 Source files analyzed: ${diagram.metadata.sourceFiles.length}`);

      // Display the Mermaid content
      console.log("\n📋 Real Ecosystem Mermaid Diagram Content:");
      console.log("=".repeat(80));
      console.log(diagram.mermaidContent);
      console.log("=".repeat(80));
    } else {
      console.error("❌ No diagrams were generated");
      console.log("Result:", JSON.stringify(result, null, 2));
      if (result && result.errors && result.errors.length > 0) {
        console.error("Errors:", result.errors);
      }
    }
  } catch (error) {
    console.error("❌ Error generating real ecosystem diagram:", error);
    process.exit(1);
  }
}

// Run the real ecosystem generation
generateRealEcosystemDiagram();
