#!/usr/bin/env tsx
/**
 * Example test demonstrating the docstring validation system
 */

import { DocstringAnalyzer } from "./src/DocstringAnalyzer";
import { getDocstringQualityGates } from "./src/quality-gates/docstring-gates";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";

async function runExampleTest() {
  console.log("🦦 Docstring Validation System - Example Test");
  console.log("=".repeat(50));

  const analyzer = new DocstringAnalyzer();
  const tempDir = join(process.cwd(), "temp-example");

  // Create example Python file
  const pythonContent = `"""
Example Python module with mixed documentation quality.
"""

def well_documented_function(param1: str, param2: int) -> str:
    """
    This is a well-documented function with comprehensive docstring.
    
    Args:
        param1: A string parameter for processing
        param2: An integer parameter for calculations
        
    Returns:
        A formatted string combining both parameters
        
    Example:
        >>> result = well_documented_function("hello", 42)
        >>> print(result)
        "hello-42"
    """
    return f"{param1}-{param2}"

def poorly_documented_function():
    """short"""
    return "poor documentation"

def undocumented_function():
    return "no documentation at all"

class WellDocumentedClass:
    """
    A well-documented class with proper docstring.
    
    This class demonstrates proper documentation practices
    with detailed explanations of its purpose and usage.
    """
    
    def __init__(self, value: int):
        """Initialize the class with a value."""
        self.value = value
    
    def method_without_docstring(self):
        return self.value * 2

class UndocumentedClass:
    def __init__(self):
        self.value = 0
`;

  // Create example TypeScript file
  const tsContent = `/**
 * Example TypeScript module with mixed documentation quality.
 * 
 * This module demonstrates proper JSDoc documentation practices
 * for TypeScript code analysis.
 */

/**
 * A well-documented function with proper JSDoc.
 * 
 * @param param1 - A string parameter for processing
 * @param param2 - A number parameter for calculations
 * @returns A formatted string combining both parameters
 * 
 * @example
 * \`\`\`typescript
 * const result = wellDocumentedFunction("hello", 42);
 * console.log(result); // "hello-42"
 * \`\`\`
 */
export function wellDocumentedFunction(param1: string, param2: number): string {
  return \`\${param1}-\${param2}\`;
}

/**
 * Function with minimal documentation
 */
export function minimalFunction(): string {
  return "minimal docstring";
}

export function undocumentedFunction(): string {
  return "no JSDoc";
}

/**
 * A well-documented class with proper JSDoc.
 * 
 * This class demonstrates proper documentation practices
 * with detailed explanations of its purpose and usage.
 */
export class WellDocumentedClass {
  private value: number;

  /**
   * Initialize the class with a value.
   * 
   * @param value - The initial value
   */
  constructor(value: number) {
    this.value = value;
  }

  /**
   * Get the current value.
   * 
   * @returns The current value
   */
  getValue(): number {
    return this.value;
  }

  methodWithoutDocstring(): number {
    return this.value * 2;
  }
}

export class UndocumentedClass {
  private value: number = 0;

  constructor() {
    this.value = 0;
  }
}
`;

  try {
    // Create temporary files
    const pythonFile = join(tempDir, "example.py");
    const tsFile = join(tempDir, "example.ts");

    writeFileSync(pythonFile, pythonContent);
    writeFileSync(tsFile, tsContent);

    console.log("📁 Created example files:");
    console.log(`   - ${pythonFile}`);
    console.log(`   - ${tsFile}`);

    // Analyze Python file
    console.log("\n🐍 Analyzing Python file...");
    const pythonAnalysis = await analyzer.analyzeFile(pythonFile);

    console.log(
      `   Functions: ${pythonAnalysis.metrics.documentedFunctions}/${pythonAnalysis.metrics.totalFunctions} documented`
    );
    console.log(
      `   Classes: ${pythonAnalysis.metrics.documentedClasses}/${pythonAnalysis.metrics.totalClasses} documented`
    );
    console.log(
      `   Modules: ${pythonAnalysis.metrics.documentedModules}/${pythonAnalysis.metrics.totalModules} documented`
    );
    console.log(`   Issues found: ${pythonAnalysis.issues.length}`);

    if (pythonAnalysis.issues.length > 0) {
      console.log("   Issues:");
      pythonAnalysis.issues.forEach(issue => {
        console.log(`     - ${issue.message} (${issue.severity})`);
      });
    }

    // Analyze TypeScript file
    console.log("\n📘 Analyzing TypeScript file...");
    const tsAnalysis = await analyzer.analyzeFile(tsFile);

    console.log(
      `   Functions: ${tsAnalysis.metrics.documentedFunctions}/${tsAnalysis.metrics.totalFunctions} documented`
    );
    console.log(`   Classes: ${tsAnalysis.metrics.documentedClasses}/${tsAnalysis.metrics.totalClasses} documented`);
    console.log(`   Modules: ${tsAnalysis.metrics.documentedModules}/${tsAnalysis.metrics.totalModules} documented`);
    console.log(`   Issues found: ${tsAnalysis.issues.length}`);

    if (tsAnalysis.issues.length > 0) {
      console.log("   Issues:");
      tsAnalysis.issues.forEach(issue => {
        console.log(`     - ${issue.message} (${issue.severity})`);
      });
    }

    // Calculate overall metrics
    console.log("\n📊 Overall Metrics:");
    const analyses = [pythonAnalysis, tsAnalysis];
    const overallMetrics = analyzer.getOverallMetrics(analyses);

    console.log(`   Total Functions: ${overallMetrics.totalFunctions}`);
    console.log(`   Documented Functions: ${overallMetrics.documentedFunctions}`);
    console.log(`   Total Classes: ${overallMetrics.totalClasses}`);
    console.log(`   Documented Classes: ${overallMetrics.documentedClasses}`);
    console.log(`   Total Modules: ${overallMetrics.totalModules}`);
    console.log(`   Documented Modules: ${overallMetrics.documentedModules}`);
    console.log(`   Coverage: ${overallMetrics.coveragePercentage.toFixed(1)}%`);
    console.log(`   Quality Score: ${overallMetrics.qualityScore}/100`);
    console.log(`   Average Docstring Length: ${overallMetrics.averageDocstringLength.toFixed(1)} chars`);

    // Test quality gates
    console.log("\n🚪 Quality Gates:");
    const standardGates = getDocstringQualityGates("standard");
    const strictGates = getDocstringQualityGates("strict");
    const relaxedGates = getDocstringQualityGates("relaxed");

    console.log(`   Standard gates: ${standardGates.length}`);
    console.log(`   Strict gates: ${strictGates.length}`);
    console.log(`   Relaxed gates: ${relaxedGates.length}`);

    // Check if metrics pass standard gates
    const coverageGate = standardGates.find(gate => gate.id === "docstring-coverage-minimum");
    const qualityGate = standardGates.find(gate => gate.id === "docstring-quality-minimum");

    if (coverageGate && qualityGate) {
      const coveragePassed = overallMetrics.coveragePercentage >= (coverageGate.conditions[0].threshold as number);
      const qualityPassed = overallMetrics.qualityScore >= (qualityGate.conditions[0].threshold as number);

      console.log(
        `   Coverage gate (${coverageGate.conditions[0].threshold}%): ${coveragePassed ? "✅ PASSED" : "❌ FAILED"}`
      );
      console.log(
        `   Quality gate (${qualityGate.conditions[0].threshold}): ${qualityPassed ? "✅ PASSED" : "❌ FAILED"}`
      );
    }

    console.log("\n🎉 Example test completed successfully!");
  } catch (error) {
    console.error("❌ Example test failed:", error);
  } finally {
    // Clean up temporary files
    const pythonFile = join(tempDir, "example.py");
    const tsFile = join(tempDir, "example.ts");

    if (existsSync(pythonFile)) unlinkSync(pythonFile);
    if (existsSync(tsFile)) unlinkSync(tsFile);

    console.log("\n🧹 Cleaned up temporary files");
  }
}

// Run the example test
runExampleTest().catch(console.error);
