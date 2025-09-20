#!/usr/bin/env node
/**
 * ADR System Demo
 *
 * Demonstrates the capabilities of the Reynard ADR System
 */
import { CodebaseAnalyzer } from "./src/CodebaseAnalyzer";
import { ADRGenerator } from "./src/ADRGenerator";
import { ADRValidator } from "./src/ADRValidator";
import { ADRRelationshipMapper } from "./src/ADRRelationshipMapper";
async function runDemo() {
    console.log("🦊 Reynard ADR System Demo");
    console.log("==========================\n");
    try {
        // Initialize components
        const analyzer = new CodebaseAnalyzer("./src");
        const generator = new ADRGenerator("./docs/architecture/decisions", "./docs/architecture/decisions/templates");
        const validator = new ADRValidator("./docs/architecture/decisions");
        const mapper = new ADRRelationshipMapper("./docs/architecture/decisions");
        console.log("1. 🔍 Analyzing codebase...");
        const analysis = await analyzer.analyzeCodebase();
        console.log(`   📊 Found ${analysis.metrics.totalFiles} files with ${analysis.metrics.totalLines.toLocaleString()} lines`);
        console.log(`   🏗️ Detected ${analysis.patterns.length} architecture patterns`);
        console.log(`   💡 Generated ${analysis.suggestions.length} ADR suggestions`);
        console.log(`   📈 Code quality: ${analysis.quality.testCoverage.toFixed(1)}% test coverage\n`);
        console.log("2. 🎯 Top ADR Suggestions:");
        analysis.suggestions.slice(0, 3).forEach((suggestion, index) => {
            console.log(`   ${index + 1}. [${suggestion.priority.toUpperCase()}] ${suggestion.title}`);
            console.log(`      Category: ${suggestion.category} | Impact: ${suggestion.estimatedImpact}`);
            console.log(`      Evidence: ${suggestion.evidence.length} items\n`);
        });
        console.log("3. 🏗️ Architecture Patterns:");
        analysis.patterns.forEach(pattern => {
            console.log(`   - ${pattern.type}: ${(pattern.confidence * 100).toFixed(1)}% confidence`);
            if (pattern.recommendations.length > 0) {
                console.log(`     Recommendations: ${pattern.recommendations.slice(0, 2).join(", ")}`);
            }
        });
        console.log("");
        console.log("4. 📊 Code Quality Metrics:");
        console.log(`   - Test Coverage: ${analysis.quality.testCoverage.toFixed(1)}%`);
        console.log(`   - Documentation Coverage: ${analysis.quality.documentationCoverage.toFixed(1)}%`);
        console.log(`   - Code Smells: ${analysis.quality.codeSmells.length}`);
        console.log(`   - Maintainability Index: ${analysis.quality.complexityMetrics.maintainabilityIndex.toFixed(1)}\n`);
        console.log("5. 🔗 ADR Relationships:");
        const relationships = await mapper.analyzeRelationships();
        console.log(`   Found ${relationships.length} relationships between ADRs`);
        const cycles = mapper.detectCircularDependencies();
        if (cycles.length > 0) {
            console.log(`   ⚠️ Detected ${cycles.length} circular dependencies`);
        }
        else {
            console.log(`   ✅ No circular dependencies detected`);
        }
        console.log("");
        console.log("6. ✅ ADR Validation:");
        const validationResults = await validator.validateAllADRs();
        let validCount = 0;
        let totalErrors = 0;
        let totalWarnings = 0;
        for (const [, result] of validationResults) {
            if (result.isValid)
                validCount++;
            totalErrors += result.errors.length;
            totalWarnings += result.warnings.length;
        }
        console.log(`   Valid ADRs: ${validCount}/${validationResults.size}`);
        console.log(`   Total Errors: ${totalErrors}`);
        console.log(`   Total Warnings: ${totalWarnings}\n`);
        console.log("🎉 Demo completed successfully!");
        console.log("\n💡 Next Steps:");
        console.log("   - Review generated ADR suggestions");
        console.log("   - Generate ADRs for high-priority items");
        console.log("   - Address validation warnings and errors");
        console.log("   - Update ADR relationships as needed");
    }
    catch (error) {
        console.error("❌ Demo failed:", error);
        process.exit(1);
    }
}
// Run the demo
runDemo();
