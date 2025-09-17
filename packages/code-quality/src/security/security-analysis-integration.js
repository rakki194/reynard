/**
 * 🐺 Reynard Security Analysis Integration
 *
 * *snarls with predatory intelligence* Main orchestrator for security analysis
 * that coordinates multiple security tools and provides unified results.
 */
import { EventEmitter } from "events";
import { createSecurityTools, getEnabledSecurityTools } from "./tool-config";
import { calculateSecuritySummary, removeDuplicateHotspots, removeDuplicateVulnerabilities, } from "./utils/analysis-utils";
import { getRelevantFiles, groupFilesByLanguage } from "./utils/file-processor";
import { runSecurityTool } from "./utils/tool-executor";
export class SecurityAnalysisIntegration extends EventEmitter {
    constructor(projectRoot) {
        super();
        Object.defineProperty(this, "projectRoot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "securityTools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.projectRoot = projectRoot;
        this.securityTools = createSecurityTools();
    }
    /**
     * 🐺 Run comprehensive security analysis
     */
    async runSecurityAnalysis(files) {
        console.log("🐺 Starting comprehensive security analysis...");
        const startTime = Date.now();
        const vulnerabilities = [];
        const hotspots = [];
        const toolsUsed = [];
        try {
            // Group files by language
            const filesByLanguage = groupFilesByLanguage(files);
            // Run each security tool
            for (const tool of getEnabledSecurityTools(this.securityTools)) {
                const relevantFiles = getRelevantFiles(filesByLanguage, tool.supportedLanguages);
                if (relevantFiles.length === 0)
                    continue;
                try {
                    console.log(`🔍 Running ${tool.name} on ${relevantFiles.length} files...`);
                    const toolResult = await runSecurityTool(tool, relevantFiles, this.projectRoot);
                    vulnerabilities.push(...toolResult.vulnerabilities);
                    hotspots.push(...toolResult.hotspots);
                    toolsUsed.push(tool.name);
                }
                catch (error) {
                    console.warn(`⚠️ Security tool ${tool.name} failed:`, error);
                }
            }
            // Remove duplicates
            const uniqueVulnerabilities = removeDuplicateVulnerabilities(vulnerabilities);
            const uniqueHotspots = removeDuplicateHotspots(hotspots);
            // Calculate summary
            const summary = calculateSecuritySummary(uniqueVulnerabilities, uniqueHotspots);
            const result = {
                vulnerabilities: uniqueVulnerabilities,
                hotspots: uniqueHotspots,
                summary,
                toolsUsed,
                analysisDate: new Date(),
                duration: Date.now() - startTime,
            };
            console.log(`✅ Security analysis complete in ${result.duration}ms`);
            this.emit("securityAnalysisComplete", result);
            return result;
        }
        catch (error) {
            console.error("❌ Security analysis failed:", error);
            this.emit("securityAnalysisError", error);
            throw error;
        }
    }
    /**
     * 🦊 Enable/disable security tools
     */
    async configureSecurityTool(toolName, enabled) {
        const tool = this.securityTools.find(t => t.name === toolName);
        if (tool) {
            tool.enabled = enabled;
            this.emit("securityToolConfigured", { toolName, enabled });
        }
    }
    /**
     * 🐺 Get available security tools
     */
    getSecurityTools() {
        return [...this.securityTools];
    }
}
