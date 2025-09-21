#!/usr/bin/env tsx
/**
 * Test script for the docstring validation system
 */

import { DocstringAnalyzer } from "./src/DocstringAnalyzer";
import { getDocstringQualityGates } from "./src/quality-gates/docstring-gates";

async function testDocstringSystem() {
  console.log("🦦 Testing Docstring Validation System");
  console.log("=" .repeat(50));

  const analyzer = new DocstringAnalyzer();
  
  // Test Python file
  console.log("\n📁 Testing Python file analysis...");
  try {
    const pythonAnalysis = await analyzer.analyzeFile("./test-docstring-analyzer.py");
    console.log(`✅ Python analysis complete:`);
    console.log(`   Functions: ${pythonAnalysis.metrics.documentedFunctions}/${pythonAnalysis.metrics.totalFunctions} documented`);
    console.log(`   Classes: ${pythonAnalysis.metrics.documentedClasses}/${pythonAnalysis.metrics.totalClasses} documented`);
    console.log(`   Modules: ${pythonAnalysis.metrics.documentedModules}/${pythonAnalysis.metrics.totalModules} documented`);
    console.log(`   Issues found: ${pythonAnalysis.issues.length}`);
    
    if (pythonAnalysis.issues.length > 0) {
      console.log("   Issues:");
      pythonAnalysis.issues.forEach(issue => {
        console.log(`     - ${issue.message} (${issue.severity})`);
      });
    }
  } catch (error) {
    console.error("❌ Python analysis failed:", error);
  }

  // Test TypeScript file
  console.log("\n📁 Testing TypeScript file analysis...");
  try {
    const tsAnalysis = await analyzer.analyzeFile("./test-docstring-analyzer.ts");
    console.log(`✅ TypeScript analysis complete:`);
    console.log(`   Functions: ${tsAnalysis.metrics.documentedFunctions}/${tsAnalysis.metrics.totalFunctions} documented`);
    console.log(`   Classes: ${tsAnalysis.metrics.documentedClasses}/${tsAnalysis.metrics.totalClasses} documented`);
    console.log(`   Modules: ${tsAnalysis.metrics.documentedModules}/${tsAnalysis.metrics.totalModules} documented`);
    console.log(`   Issues found: ${tsAnalysis.issues.length}`);
    
    if (tsAnalysis.issues.length > 0) {
      console.log("   Issues:");
      tsAnalysis.issues.forEach(issue => {
        console.log(`     - ${issue.message} (${issue.severity})`);
      });
    }
  } catch (error) {
    console.error("❌ TypeScript analysis failed:", error);
  }

  // Test overall metrics
  console.log("\n📊 Testing overall metrics calculation...");
  try {
    const analyses = await analyzer.analyzeFiles([
      "./test-docstring-analyzer.py",
      "./test-docstring-analyzer.ts"
    ]);
    
    const overallMetrics = analyzer.getOverallMetrics(analyses);
    console.log(`✅ Overall metrics calculated:`);
    console.log(`   Total Functions: ${overallMetrics.totalFunctions}`);
    console.log(`   Documented Functions: ${overallMetrics.documentedFunctions}`);
    console.log(`   Total Classes: ${overallMetrics.totalClasses}`);
    console.log(`   Documented Classes: ${overallMetrics.documentedClasses}`);
    console.log(`   Coverage: ${overallMetrics.coveragePercentage.toFixed(1)}%`);
    console.log(`   Quality Score: ${overallMetrics.qualityScore}/100`);
    console.log(`   Average Docstring Length: ${overallMetrics.averageDocstringLength.toFixed(1)} chars`);
  } catch (error) {
    console.error("❌ Overall metrics calculation failed:", error);
  }

  // Test quality gates
  console.log("\n🚪 Testing quality gates...");
  try {
    const standardGates = getDocstringQualityGates("standard");
    const strictGates = getDocstringQualityGates("strict");
    const relaxedGates = getDocstringQualityGates("relaxed");
    
    console.log(`✅ Quality gates loaded:`);
    console.log(`   Standard gates: ${standardGates.length}`);
    console.log(`   Strict gates: ${strictGates.length}`);
    console.log(`   Relaxed gates: ${relaxedGates.length}`);
    
    // Show first gate as example
    if (standardGates.length > 0) {
      const firstGate = standardGates[0];
      console.log(`   Example gate: ${firstGate.name} (${firstGate.conditions.length} conditions)`);
    }
  } catch (error) {
    console.error("❌ Quality gates test failed:", error);
  }

  console.log("\n🎉 Docstring validation system test complete!");
}

// Run the test
testDocstringSystem().catch(console.error);
