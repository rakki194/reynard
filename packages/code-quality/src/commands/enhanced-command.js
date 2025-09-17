#!/usr/bin/env node
/**
 * 🦊 Enhanced Command Handler
 *
 * *whiskers twitch with intelligence* Handles the enhanced analysis command
 * with AI, behavioral insights, and advanced security.
 */
import { displayEnhancedResults } from "../display/results-display";
export async function handleEnhancedCommand(options) {
    try {
        console.log("🦊 Starting enhanced Reynard code quality analysis...");
        const { createCodeQualitySystem } = await import("../index");
        const system = createCodeQualitySystem(options.project);
        await system.initialize();
        const startTime = Date.now();
        const results = await system.runEnhancedAnalysis(options.environment);
        const duration = Date.now() - startTime;
        console.log(`✅ Enhanced analysis complete in ${duration}ms`);
        if (options.format === "json") {
            console.log(JSON.stringify(results, null, 2));
        }
        else {
            displayEnhancedResults(results, options.format);
        }
    }
    catch (error) {
        console.error("❌ Enhanced analysis failed:", error);
        process.exit(1);
    }
}
