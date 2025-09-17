/**
 * 🐺 Security Tool Executor
 *
 * *snarls with predatory intelligence* Utility for executing security tools
 * and processing their output.
 */
import type { SecurityHotspot, SecurityToolConfig, SecurityVulnerability } from "../types";
/**
 * 🐺 Run a specific security tool
 */
export declare function runSecurityTool(tool: SecurityToolConfig, files: string[], projectRoot: string): Promise<{
    vulnerabilities: SecurityVulnerability[];
    hotspots: SecurityHotspot[];
}>;
