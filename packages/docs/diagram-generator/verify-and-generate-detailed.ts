#!/usr/bin/env node

/**
 * 🦊 Comprehensive Diagram Generation and Verification System
 *
 * Generates detailed ecosystem diagrams and verifies their accuracy
 * against the real codebase
 */

import { DiagramGeneratorMain } from "./src/core/DiagramGenerator.js";
import { DetailedEcosystemGenerator } from "./src/generators/DetailedEcosystemGenerator.js";
import { DiagramAccuracyVerifier } from "./src/verification/DiagramAccuracyVerifier.js";
import { writeFile } from "fs/promises";
import { join } from "path";

async function generateAndVerifyDetailedDiagrams() {
  console.log("🐉 Generating and Verifying Detailed Ecosystem Diagrams...");

  try {
    const rootPath = process.cwd();
    const generator = new DiagramGeneratorMain(rootPath);
    const verifier = new DiagramAccuracyVerifier(rootPath);

    const config = {
      outputDir: "./diagrams",
      generateSvg: false,
      generatePng: false,
      generateHighRes: false,
      theme: "neutral" as const,
      maxComplexity: 200,
      includeFilePaths: true,
      includeRelationships: true,
      includeMetadata: true,
    };

    console.log("📊 Step 1: Analyzing real Reynard codebase...");
    const analysis = await generator["analyzer"].analyzeCodebase();
    console.log(`✅ Analysis complete: ${analysis.packages.length} packages, ${analysis.components.length} components`);

    console.log("📊 Step 2: Generating detailed ecosystem diagram...");
    const detailedGenerator = new DetailedEcosystemGenerator();
    const detailedResult = await detailedGenerator.generate(analysis, config);

    console.log("📊 Step 3: Verifying diagram accuracy...");
    const verificationResult = await verifier.verifyDiagramAccuracy(detailedResult.mermaidContent, analysis);

    // Create diagrams directory
    await import("fs/promises").then(fs => fs.mkdir("./diagrams", { recursive: true }));

    // Save detailed diagram
    const detailedPath = join(config.outputDir, "detailed-ecosystem-analysis.mmd");
    await writeFile(detailedPath, detailedResult.mermaidContent);

    // Save verification report
    const verificationPath = join(config.outputDir, "verification-report.json");
    await writeFile(verificationPath, JSON.stringify(verificationResult, null, 2));

    // Display results
    console.log("\n" + "=".repeat(80));
    console.log("🎯 DETAILED ECOSYSTEM ANALYSIS RESULTS");
    console.log("=".repeat(80));

    console.log(`✅ Detailed diagram generated: ${detailedPath}`);
    console.log(`📊 Nodes: ${detailedResult.metadata.nodeCount}`);
    console.log(`🔗 Edges: ${detailedResult.metadata.edgeCount}`);
    console.log(`📈 Complexity: ${detailedResult.metadata.complexityScore}`);

    console.log("\n🔍 VERIFICATION RESULTS");
    console.log("-".repeat(40));
    console.log(`🎯 Accuracy Score: ${verificationResult.accuracyScore.toFixed(1)}%`);
    console.log(`✅ Is Accurate: ${verificationResult.isAccurate ? "YES" : "NO"}`);
    console.log(
      `📦 Packages: ${verificationResult.statistics.verifiedPackages}/${verificationResult.statistics.totalPackages}`
    );
    console.log(
      `🔗 Dependencies: ${verificationResult.statistics.verifiedDependencies}/${verificationResult.statistics.totalDependencies}`
    );
    console.log(
      `📤 Exports: ${verificationResult.statistics.verifiedExports}/${verificationResult.statistics.totalExports}`
    );
    console.log(
      `📥 Imports: ${verificationResult.statistics.verifiedImports}/${verificationResult.statistics.totalImports}`
    );

    if (verificationResult.issues.length > 0) {
      console.log("\n⚠️ ISSUES FOUND");
      console.log("-".repeat(40));
      verificationResult.issues.forEach((issue, index) => {
        const severity = issue.severity.toUpperCase();
        const emoji = { low: "🟡", medium: "🟠", high: "🔴", critical: "🚨" }[issue.severity];
        console.log(`${emoji} [${severity}] ${issue.description}`);
        if (issue.expected && issue.actual) {
          console.log(`   Expected: ${issue.expected}`);
          console.log(`   Actual: ${issue.actual}`);
        }
        if (issue.file) {
          console.log(`   File: ${issue.file}`);
        }
      });
    }

    if (verificationResult.recommendations.length > 0) {
      console.log("\n💡 RECOMMENDATIONS");
      console.log("-".repeat(40));
      verificationResult.recommendations.forEach(rec => console.log(rec));
    }

    console.log("\n📋 DETAILED DIAGRAM CONTENT");
    console.log("=".repeat(80));
    console.log(detailedResult.mermaidContent);
    console.log("=".repeat(80));

    // Generate additional focused diagrams
    console.log("\n📊 Step 4: Generating focused diagrams...");
    await generateFocusedDiagrams(generator, analysis, config);
  } catch (error) {
    console.error("❌ Error in comprehensive analysis:", error);
    process.exit(1);
  }
}

async function generateFocusedDiagrams(generator: DiagramGeneratorMain, analysis: any, config: any) {
  const focusedTypes = [
    "architecture-overview",
    "package-dependencies",
    "component-relationships",
    "frontend-backend-relationships",
  ];

  for (const diagramType of focusedTypes) {
    try {
      console.log(`📊 Generating ${diagramType} diagram...`);
      const result = await generator.generateDiagram(diagramType, config);

      if (result && result.mermaidContent) {
        const focusedPath = join(config.outputDir, `${diagramType}.mmd`);
        await writeFile(focusedPath, result.mermaidContent);
        console.log(`✅ ${diagramType} saved: ${focusedPath}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to generate ${diagramType}:`, error);
    }
  }
}

// Run the comprehensive analysis
generateAndVerifyDetailedDiagrams();
