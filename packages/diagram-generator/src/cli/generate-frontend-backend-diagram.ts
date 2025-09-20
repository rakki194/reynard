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

    if (result && result.diagrams && result.diagrams.length > 0) {
      const diagram = result.diagrams[0];

      // Save Mermaid content
      const mermaidPath = join(config.outputDir, "frontend-backend-relationships.mmd");
      await writeFile(mermaidPath, diagram.mermaidContent);

      console.log(`✅ Diagram generated successfully!`);
      console.log(`📄 Mermaid file: ${mermaidPath}`);
      console.log(`📊 Nodes: ${diagram.metadata.nodeCount}`);
      console.log(`🔗 Edges: ${diagram.metadata.edgeCount}`);
      console.log(`📈 Complexity: ${diagram.metadata.complexityScore}`);

      // Display the Mermaid content
      console.log("\n📋 Mermaid Diagram Content:");
      console.log("=".repeat(80));
      console.log(diagram.mermaidContent);
      console.log("=".repeat(80));
    } else {
      console.error("❌ No diagrams were generated");
      if (result && result.errors && result.errors.length > 0) {
        console.error("Errors:", result.errors);
      }
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
