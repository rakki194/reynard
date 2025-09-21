/**
 * Reynard Security Analysis Integration
 *
 * Main orchestrator for comprehensive security analysis that coordinates
 * multiple security tools and provides unified, actionable results.
 * Features advanced threat detection and vulnerability assessment capabilities.
 */

import { EventEmitter } from "events";

import { createSecurityTools, getEnabledSecurityTools } from "./tool-config";
import type { SecurityAnalysisResult, SecurityToolConfig } from "./types";
import {
  calculateSecuritySummary,
  removeDuplicateHotspots,
  removeDuplicateVulnerabilities,
} from "./utils/analysis-utils";
import { getRelevantFiles, groupFilesByLanguage } from "./utils/file-processor";
import { runSecurityTool } from "./utils/tool-executor";

export class SecurityAnalysisIntegration extends EventEmitter {
  private readonly projectRoot: string;
  private readonly securityTools: SecurityToolConfig[] = [];

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
    this.securityTools = createSecurityTools();
  }

  /**
   * 🐺 Run comprehensive security analysis
   */
  async runSecurityAnalysis(files: string[]): Promise<SecurityAnalysisResult> {
    console.log("🐺 Starting comprehensive security analysis...");

    const startTime = Date.now();
    const vulnerabilities: any[] = [];
    const hotspots: any[] = [];
    const toolsUsed: string[] = [];

    try {
      // Group files by language
      const filesByLanguage = groupFilesByLanguage(files);

      // Run each security tool
      for (const tool of getEnabledSecurityTools(this.securityTools)) {
        const relevantFiles = getRelevantFiles(filesByLanguage, tool.supportedLanguages);
        if (relevantFiles.length === 0) continue;

        try {
          console.log(`🔍 Running ${tool.name} on ${relevantFiles.length} files...`);

          const toolResult = await runSecurityTool(tool, relevantFiles, this.projectRoot);
          vulnerabilities.push(...toolResult.vulnerabilities);
          hotspots.push(...toolResult.hotspots);
          toolsUsed.push(tool.name);
        } catch (error) {
          console.warn(`⚠️ Security tool ${tool.name} failed:`, error);
        }
      }

      // Remove duplicates
      const uniqueVulnerabilities = removeDuplicateVulnerabilities(vulnerabilities);
      const uniqueHotspots = removeDuplicateHotspots(hotspots);

      // Calculate summary
      const summary = calculateSecuritySummary(uniqueVulnerabilities, uniqueHotspots);

      const result: SecurityAnalysisResult = {
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
    } catch (error) {
      console.error("❌ Security analysis failed:", error);
      this.emit("securityAnalysisError", error);
      throw error;
    }
  }

  /**
   * 🦊 Enable/disable security tools
   */
  async configureSecurityTool(toolName: string, enabled: boolean): Promise<void> {
    const tool = this.securityTools.find(t => t.name === toolName);
    if (tool) {
      tool.enabled = enabled;
      this.emit("securityToolConfigured", { toolName, enabled });
    }
  }

  /**
   * 🐺 Get available security tools
   */
  getSecurityTools(): SecurityToolConfig[] {
    return [...this.securityTools];
  }
}
