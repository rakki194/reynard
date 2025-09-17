/**
 * 🐺 Security Tool Configuration
 *
 * *snarls with predatory intelligence* Configuration and initialization
 * of security analysis tools.
 */
import type { SecurityToolConfig } from "./types";
/**
 * 🦊 Initialize security analysis tools
 */
export declare function createSecurityTools(): SecurityToolConfig[];
/**
 * 🦊 Get security tool by name
 */
export declare function getSecurityTool(tools: SecurityToolConfig[], name: string): SecurityToolConfig | undefined;
/**
 * 🦊 Enable/disable security tool
 */
export declare function configureSecurityTool(tools: SecurityToolConfig[], toolName: string, enabled: boolean): SecurityToolConfig[];
/**
 * 🦊 Get enabled security tools
 */
export declare function getEnabledSecurityTools(tools: SecurityToolConfig[]): SecurityToolConfig[];
