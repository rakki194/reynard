#!/usr/bin/env node
/**
 * 🦊 Simple Frontend-Backend Relationship Diagram Test
 */
import { FrontendBackendRelationshipGenerator } from "./src/generators/FrontendBackendRelationshipGenerator.js";
import { writeFile } from "fs/promises";
import { join } from "path";
// Mock analysis data based on actual Reynard structure
const mockAnalysis = {
    packages: [
        {
            name: "reynard-api-client",
            path: "packages/api-client",
            type: "source",
            importance: "critical",
            dependencies: ["reynard-connection", "reynard-i18n", "solid-js"],
            exports: ["useAuth", "useCaption", "useChat", "useRAG"],
            components: [],
            files: [],
        },
        {
            name: "reynard-connection",
            path: "packages/connection",
            type: "source",
            importance: "critical",
            dependencies: ["reynard-validation", "solid-js"],
            exports: ["HTTPClient", "WebSocketClient", "SSEClient"],
            components: [],
            files: [],
        },
        {
            name: "reynard-caption",
            path: "packages/caption",
            type: "source",
            importance: "important",
            dependencies: ["reynard-api-client", "reynard-components-core"],
            exports: ["CaptionComponent", "CaptionService"],
            components: [],
            files: [],
        },
        {
            name: "reynard-chat",
            path: "packages/chat",
            type: "source",
            importance: "important",
            dependencies: ["reynard-api-client", "reynard-connection"],
            exports: ["ChatComponent", "ChatService"],
            components: [],
            files: [],
        },
        {
            name: "reynard-rag",
            path: "packages/rag",
            type: "source",
            importance: "important",
            dependencies: ["reynard-api-client", "reynard-connection"],
            exports: ["RAGComponent", "RAGService"],
            components: [],
            files: [],
        },
        {
            name: "reynard-gallery",
            path: "packages/gallery",
            type: "source",
            importance: "important",
            dependencies: ["reynard-api-client", "reynard-components-core"],
            exports: ["GalleryComponent", "GalleryService"],
            components: [],
            files: [],
        },
        {
            name: "reynard-components-core",
            path: "packages/components-core",
            type: "source",
            importance: "critical",
            dependencies: ["reynard-themes", "reynard-fluent-icons"],
            exports: ["Button", "Input", "Modal"],
            components: [],
            files: [],
        },
        {
            name: "reynard-auth",
            path: "packages/auth",
            type: "source",
            importance: "critical",
            dependencies: ["reynard-api-client", "reynard-connection"],
            exports: ["AuthProvider", "useAuth"],
            components: [],
            files: [],
        },
        {
            name: "backend",
            path: "backend",
            type: "source",
            importance: "critical",
            dependencies: [],
            exports: [],
            components: [],
            files: [],
        },
    ],
    dependencies: [
        {
            name: "solid-js",
            type: "external",
            version: "1.9.9",
            usageCount: 8,
            packages: ["packages/api-client", "packages/connection", "packages/caption"],
        },
        {
            name: "typescript",
            type: "dev",
            version: "5.9.2",
            usageCount: 10,
            packages: ["packages/api-client", "packages/connection"],
        },
    ],
    components: [],
    fileStructure: {
        rootDirectories: ["packages", "backend"],
        structure: {
            name: "root",
            path: "",
            type: "directory",
            children: [],
            files: [],
            metadata: {},
        },
        totalFiles: 0,
        totalDirectories: 0,
        fileTypeDistribution: {},
    },
    relationships: [],
};
async function generateTestDiagram() {
    console.log("🐉 Generating Frontend-Backend Relationship Diagram...");
    try {
        const generator = new FrontendBackendRelationshipGenerator();
        const config = {
            outputDir: "./diagrams",
            generateSvg: false,
            generatePng: false,
            generateHighRes: false,
            theme: "neutral",
            maxComplexity: 50,
            includeFilePaths: true,
            includeRelationships: true,
            includeMetadata: true,
        };
        // Generate the diagram
        const result = await generator.generate(mockAnalysis, config);
        // Create diagrams directory
        await import("fs/promises").then(fs => fs.mkdir("./diagrams", { recursive: true }));
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
    }
    catch (error) {
        console.error("❌ Error generating diagram:", error);
        process.exit(1);
    }
}
// Run the test
generateTestDiagram();
