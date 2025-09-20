#!/usr/bin/env node
/**
 * 🦊 Reynard Diagram Generator Demo
 *
 * Demonstration script showing the diagram generation tool in action.
 */
import { DiagramGenerator, DEFAULT_CONFIG } from "./src/index.js";
async function runDemo() {
    console.log("🦊 Reynard Diagram Generator Demo");
    console.log("==================================");
    console.log("");
    try {
        // Initialize the diagram generator
        const generator = new DiagramGenerator("/home/kade/runeset/reynard");
        console.log("📊 Available diagram types:");
        const types = generator.getAvailableDiagramTypes();
        for (const type of types) {
            const info = generator.getGeneratorInfo(type);
            console.log(`  - ${type}: ${info?.description}`);
        }
        console.log("");
        // Configure generation
        const config = {
            ...DEFAULT_CONFIG,
            outputDir: "./demo-diagrams",
            generateSvg: true,
            generatePng: false, // Skip PNG for demo to be faster
            generateHighRes: false,
            theme: "neutral",
            maxComplexity: 30,
            includeFilePaths: true,
            includeRelationships: true,
            includeMetadata: true,
        };
        console.log("⚙️ Configuration:");
        console.log(`  Output Directory: ${config.outputDir}`);
        console.log(`  Generate SVG: ${config.generateSvg}`);
        console.log(`  Generate PNG: ${config.generatePng}`);
        console.log(`  Theme: ${config.theme}`);
        console.log(`  Max Complexity: ${config.maxComplexity}`);
        console.log("");
        // Generate all diagrams
        console.log("🎨 Generating diagrams...");
        const result = await generator.generateAll(config);
        console.log("");
        console.log("📊 Generation Results:");
        console.log(`  Total Diagrams: ${result.summary.totalDiagrams}`);
        console.log(`  Successful: ${result.summary.successfulGenerations}`);
        console.log(`  Failed: ${result.summary.failedGenerations}`);
        console.log(`  Total Time: ${result.summary.totalTime}ms`);
        console.log("");
        if (result.diagrams.length > 0) {
            console.log("📋 Generated Diagrams:");
            for (const diagram of result.diagrams) {
                console.log(`  - ${diagram.metadata.title}`);
                console.log(`    Type: ${diagram.metadata.type}`);
                console.log(`    Nodes: ${diagram.metadata.nodeCount}`);
                console.log(`    Edges: ${diagram.metadata.edgeCount}`);
                console.log(`    Complexity: ${diagram.metadata.complexityScore}`);
                if (diagram.outputPaths.mermaid) {
                    console.log(`    Mermaid: ${diagram.outputPaths.mermaid}`);
                }
                if (diagram.outputPaths.svg) {
                    console.log(`    SVG: ${diagram.outputPaths.svg}`);
                }
                console.log("");
            }
        }
        if (result.errors.length > 0) {
            console.log("⚠️ Errors:");
            for (const error of result.errors) {
                console.log(`  - ${error.message}`);
            }
            console.log("");
        }
        // Generate a sample diagram content for demonstration
        console.log("📝 Sample Mermaid Content (Architecture Overview):");
        const architectureDiagram = result.diagrams.find(d => d.metadata.type === "architecture-overview");
        if (architectureDiagram) {
            const lines = architectureDiagram.mermaidContent.split("\n").slice(0, 20);
            console.log(lines.join("\n"));
            if (architectureDiagram.mermaidContent.split("\n").length > 20) {
                console.log("... (truncated)");
            }
        }
        console.log("");
        console.log("🎉 Demo complete!");
        console.log(`📁 Check the output directory: ${config.outputDir}`);
        console.log("");
        console.log("💡 Next steps:");
        console.log("  1. View the generated SVG files in your browser");
        console.log("  2. Use the Mermaid source files (.mmd) for customization");
        console.log("  3. Integrate the CLI tools into your development workflow");
        console.log("  4. Customize the diagram generators for your specific needs");
    }
    catch (error) {
        console.error("❌ Demo failed:", error);
        process.exit(1);
    }
}
// Run the demo
runDemo().catch(console.error);
