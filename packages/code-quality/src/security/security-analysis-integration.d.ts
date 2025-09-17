/**
 * 🐺 Reynard Security Analysis Integration
 *
 * *snarls with predatory intelligence* Main orchestrator for security analysis
 * that coordinates multiple security tools and provides unified results.
 */
import { EventEmitter } from "events";
import type { SecurityAnalysisResult, SecurityToolConfig } from "./types";
export declare class SecurityAnalysisIntegration extends EventEmitter {
    private readonly projectRoot;
    private readonly securityTools;
    constructor(projectRoot: string);
    /**
     * 🐺 Run comprehensive security analysis
     */
    runSecurityAnalysis(files: string[]): Promise<SecurityAnalysisResult>;
    /**
     * 🦊 Enable/disable security tools
     */
    configureSecurityTool(toolName: string, enabled: boolean): Promise<void>;
    /**
     * 🐺 Get available security tools
     */
    getSecurityTools(): SecurityToolConfig[];
}
