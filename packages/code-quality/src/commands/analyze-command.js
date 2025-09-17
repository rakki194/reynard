#!/usr/bin/env node
/**
 * 🦊 Analyze Command Handler
 *
 * *whiskers twitch with intelligence* Handles the main analyze command
 * for comprehensive code quality analysis.
 */
import { writeFile } from "fs/promises";
import { CodeQualityAnalyzer } from "../CodeQualityAnalyzer";
import { QualityGateManager } from "../QualityGateManager";
import { SecurityAnalysisIntegration } from "../SecurityAnalysisIntegration";
import { displaySummaryResults, displayTableResults } from "../display/results-display";
export async function handleAnalyzeCommand(options) {
    try {
        console.log("🦊 Starting Reynard code quality analysis...");
        const analyzer = new CodeQualityAnalyzer(options.project);
        const qualityGateManager = new QualityGateManager(options.project);
        const securityIntegration = new SecurityAnalysisIntegration(options.project);
        // Load quality gate configuration
        await qualityGateManager.loadConfiguration();
        // Run analysis
        const startTime = Date.now();
        const analysisResult = await analyzer.analyzeProject();
        let securityResult = null;
        if (options.security !== false) {
            const files = analysisResult.files.map(f => f.path);
            securityResult = await securityIntegration.runSecurityAnalysis(files);
        }
        let qualityGateResults = [];
        if (options.qualityGates !== false) {
            qualityGateResults = qualityGateManager.evaluateQualityGates(analysisResult.metrics, options.environment);
        }
        const duration = Date.now() - startTime;
        // Output results
        const output = {
            analysis: analysisResult,
            security: securityResult,
            qualityGates: qualityGateResults,
            duration,
            timestamp: new Date().toISOString(),
        };
        if (options.output) {
            await writeFile(options.output, JSON.stringify(output, null, 2));
            console.log(`📄 Results saved to ${options.output}`);
        }
        // Display results based on format
        switch (options.format) {
            case "json":
                console.log(JSON.stringify(output, null, 2));
                break;
            case "table":
                displayTableResults(output);
                break;
            case "summary":
            default:
                displaySummaryResults(output);
                break;
        }
        // Exit with appropriate code
        const hasFailures = qualityGateResults.some(gate => gate.status === "FAILED");
        process.exit(hasFailures ? 1 : 0);
    }
    catch (error) {
        console.error("❌ Analysis failed:", error.message);
        process.exit(1);
    }
}
