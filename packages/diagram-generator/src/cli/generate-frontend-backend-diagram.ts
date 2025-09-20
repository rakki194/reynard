#!/usr/bin/env node

/**
 * 🦊 Frontend-Backend Relationship Diagram CLI
 *
 * Command-line tool for generating frontend-backend relationship diagrams
 * for the Reynard project.
 */

import { DiagramGeneratorMain } from "../core/DiagramGenerator.js";
import { DEFAULT_CONFIG } from "../index.js";
import { writeFile } from "fs/promises";
import { join } from "path";

async function generateFrontendBackendDiagram() {
  console.log("🐉 Generating Frontend-Backend Relationship Diagram...");

  try {
    // Create diagram generator
    const generator = new DiagramGeneratorMain();

    // Configure for frontend-backend relationships
    const config = {
      ...DEFAULT_CONFIG,
      outputDir: "./diagrams",
      generateSvg: true,
      generatePng: false,
      includeRelationships: true,
      includeMetadata: true,
    };

    // Generate the diagram
    const result = await generator.generateDiagram("frontend-backend-relationships", config);

    if (result) {
      // Save Mermaid content
      const mermaidPath = join(config.outputDir, "frontend-backend-relationships.mmd");
      await writeFile(mermaidPath, result.mermaidContent);

      console.log(`✅ Diagram generated successfully!`);
      console.log(`📄 Mermaid file: ${mermaidPath}`);
      console.log(`📊 Nodes: ${result.metadata.nodeCount}`);
      console.log(`🔗 Edges: ${result.metadata.edgeCount}`);
      console.log(`📈 Complexity: ${result.metadata.complexityScore}`);

      // Display the Mermaid content
      console.log("\n📋 Mermaid Diagram Content:");
      console.log("=".repeat(80));
      console.log(result.mermaidContent);
      console.log("=".repeat(80));
    } else {
      console.error("❌ No diagrams were generated");
    }
  } catch (error) {
    console.error("❌ Error generating diagram:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateFrontendBackendDiagram();
}

export { generateFrontendBackendDiagram };
